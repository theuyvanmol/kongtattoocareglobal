const Stripe = require('stripe');

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers for the same domain
  res.setHeader('Access-Control-Allow-Origin', 'https://www.kongtattoocareglobal.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Build Stripe line items from cart
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
        },
        unit_amount: item.price, // price is already in pence (e.g. 1399 = £13.99)
      },
      quantity: item.qty || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://www.kongtattoocareglobal.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.kongtattoocareglobal.com/checkout',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['GB', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK', 'FI', 'IE', 'BE', 'AT', 'CH', 'PT', 'ES', 'IT', 'PL', 'CZ', 'HR', 'RS', 'BA', 'KZ', 'RU', 'AU', 'US', 'CA'],
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: 'Payment session failed. Please try again.' });
  }
};
