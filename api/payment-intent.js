const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.kongtattoocareglobal.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items } = req.body;

    if (!items || !items.length) return res.status(400).json({ error: 'No items in cart' });

    const amount = Math.round(
      items.reduce((sum, item) => {
        const price = item.price < 100 ? item.price * 100 : item.price;
        return sum + price * (item.qty || 1);
      }, 0)
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: JSON.stringify(items.map(i => ({
          name: i.name || (i.line1 && i.line2 ? i.line1 + ' ' + i.line2 : i.id),
          qty: i.qty,
          price: i.price,
        }))),
      },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
