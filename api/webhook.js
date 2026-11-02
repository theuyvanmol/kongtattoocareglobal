// api/webhook.js
// Stripe webhook handler — verifies signatures and fulfils orders.
// Register this endpoint in your Stripe Dashboard under Developers → Webhooks.
// Endpoint URL: https://yourdomain.com/api/webhook

const { Stripe } = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-08-26.dahlia; custom_checkout_payment_form_preview=v1',
});

// Vercel requires the raw body for Stripe signature verification.
// This config export tells Vercel NOT to parse the body automatically.
export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig       = req.headers['stripe-signature'];
  const secret    = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody   = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('✅ Checkout completed:', session.id);
      console.log('   Customer email:', session.customer_details?.email);
      console.log('   Amount total:  ', session.amount_total / 100, session.currency.toUpperCase());

      // ── Trade shop order ──────────────────────────────────────────────
      if (session.metadata?.type === 'trade') {
        const { studio_id, studio_name, items_json } = session.metadata;
        const totalGbp = (session.amount_total || 0) / 100;

        let items = [];
        try { items = JSON.parse(items_json || '[]'); } catch (_) {}

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && serviceKey && studio_id) {
          // 1. Record the paid trade order in Supabase
          const orderRes = await fetch(`${supabaseUrl}/rest/v1/trade_orders`, {
            method: 'POST',
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=representation',
            },
            body: JSON.stringify({
              studio_id,
              items,
              total_gbp: totalGbp,
              status: 'paid',
              stripe_session_id: session.id,
            }),
          });
          if (!orderRes.ok) {
            const t = await orderRes.text();
            console.error('Failed to record trade order:', t);
          } else {
            console.log(`✅ Trade order recorded for studio ${studio_name || studio_id}`);
          }

          // 2. Notify superadmin(s) by email via Supabase Auth Admin API
          //    Fetch all superadmin emails, then send each a notification email
          try {
            const adminsRes = await fetch(
              `${supabaseUrl}/rest/v1/profiles?role=eq.superadmin&select=id,display_name`,
              { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
            );
            const admins = await adminsRes.json();

            // Build a summary of items
            const itemSummary = items.slice(0, 5)
              .map(i => `• ${i.product || i.name} ×${i.qty}`)
              .join('\n');
            const moreItems = items.length > 5 ? `\n…and ${items.length - 5} more` : '';

            for (const admin of (admins || [])) {
              // Get admin's email from auth
              const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${admin.id}`, {
                headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
              });
              const authUser = await authRes.json();
              const adminEmail = authUser?.email;
              if (!adminEmail) continue;

              // Send email via Supabase's built-in mailer (resend/smtp configured in project)
              await fetch(`${supabaseUrl}/auth/v1/admin/users/${admin.id}/send-email`, {
                method: 'POST',
                headers: {
                  apikey: serviceKey,
                  Authorization: `Bearer ${serviceKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: adminEmail,
                  subject: `🛍️ Trade order paid — ${studio_name || studio_id}`,
                  body: `A studio has just paid for a trade order and needs restocking.\n\nStudio: ${studio_name || studio_id}\nTotal: £${totalGbp.toFixed(2)}\n\nItems ordered:\n${itemSummary}${moreItems}\n\nStripe session: ${session.id}\n\nLog into the KONG Hub to view the order.`,
                }),
              }).catch(e => console.error('Email send failed:', e.message));
            }
            console.log(`✅ Notified ${(admins||[]).length} superadmin(s) of trade order`);
          } catch (notifyErr) {
            console.error('Superadmin notification error:', notifyErr.message);
          }
        }
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      console.log('⚠️  Checkout expired:', session.id);
      break;
    }

    default:
      console.log('Unhandled event type:', event.type);
  }

  return res.status(200).json({ received: true });
};
