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

      // TODO: Fulfil the order here.
      // Examples:
      //   - Send a confirmation email
      //   - Update your order database
      //   - Trigger shipping workflow
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      console.log('⚠️  Checkout expired:', session.id);
      // TODO: Release any held stock / notify customer
      break;
    }

    default:
      // Unexpected event type — log and ignore.
      console.log('Unhandled event type:', event.type);
  }

  return res.status(200).json({ received: true });
};
