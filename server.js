// server.js — Local development server only.
// In production (Vercel) the /api/* routes are handled by serverless functions in /api/.

require('dotenv').config();

const express = require('express');
const path    = require('path');
const { Stripe } = require('stripe');

const app    = express();
const PORT   = process.env.PORT || 4242;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-08-26.dahlia; custom_checkout_payment_form_preview=v1',
});

// Serve static site files
app.use(express.static(path.join(__dirname)));

// Parse JSON bodies for API routes
app.use('/api', express.json());

// ── POST /api/create-checkout-session ────────────────────────────────────────
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    const line_items = (items && items.length > 0)
      ? items.map((item) => ({
          price:    item.priceId,
          quantity: item.quantity || 1,
        }))
      : [{ price: '{{PRICE_ID}}', quantity: 1 }];

    const session = await stripe.checkout.sessions.create({
      // ── fixed_by_ui ────────────────────────────────────────────────────────
      ui_mode:                    'form',
      billing_address_collection: 'auto',
      phone_number_collection:    { enabled: false },
      automatic_tax:              { enabled: false },
      submit_type:                'auto',
      integration_identifier:     'custom_embedded_web_0002',
      // ── sample_only ────────────────────────────────────────────────────────
      mode:       'payment',
      line_items,
      return_url: `${process.env.DOMAIN || 'http://localhost:' + PORT}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ client_secret: session.client_secret });

  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/webhook ─────────────────────────────────────────────────────────
app.post(
  '/api/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig    = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
      console.error('Webhook verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('✅ Payment received:', event.data.object.id);
        // TODO: Fulfil order — send email, update DB, trigger shipping, etc.
        break;
      default:
        console.log('Unhandled event:', event.type);
    }

    res.json({ received: true });
  }
);

app.listen(PORT, () =>
  console.log(`\n🚀 Kong dev server running at http://localhost:${PORT}\n`)
);
