// api/create-checkout-session.js
// Vercel Serverless Function — runs server-side, secret key never reaches browser.

const { Stripe } = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Required API version + beta flag for Embedded Checkout Form SDK
  apiVersion: '2026-08-26.dahlia; custom_checkout_payment_form_preview=v1',
});

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Line items come from the client (product id + quantity).
    // Each item must map to a real Stripe Price ID — see STRIPE_INTEGRATION_TODO.md.
    const { items } = req.body;

    // Build line_items array from cart payload.
    // items = [{ priceId: 'price_xxx', quantity: 1 }, ...]
    // TODO: Replace placeholder Price IDs with real ones from your Stripe Dashboard.
    const line_items = (items && items.length > 0)
      ? items.map((item) => ({
          price: item.priceId,
          quantity: item.quantity || 1,
        }))
      : [
          // Fallback single-item placeholder — replace with a real Price ID.
          { price: '{{PRICE_ID}}', quantity: 1 },
        ];

    // Create the Checkout Session.
    // fixed_by_ui parameters are set exactly as configured in Checkout Studio.
    // mode is "payment" for one-time purchases (Kong products are one-time).
    // payment_method_collection is omitted because mode !== "subscription".
    const session = await stripe.checkout.sessions.create({
      // ── fixed_by_ui ──────────────────────────────────────────────────────
      ui_mode:                    'form',
      billing_address_collection: 'auto',
      phone_number_collection:    { enabled: false },
      automatic_tax:              { enabled: false },
      submit_type:                'auto',
      integration_identifier:     'custom_embedded_web_0002',
      // ── sample_only (replace before going live) ───────────────────────────
      mode:       'payment',
      line_items,
      // ── return URLs ───────────────────────────────────────────────────────
      // Vercel exposes the deployment URL in VERCEL_URL; fallback to DOMAIN for local dev.
      return_url: `${process.env.DOMAIN || `https://${process.env.VERCEL_URL}`}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
    });

    // Return only the client_secret — never the full session object (contains secret key info).
    return res.status(200).json({ client_secret: session.client_secret });

  } catch (err) {
    console.error('Stripe session creation error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
