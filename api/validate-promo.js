// api/validate-promo.js
// Validates a promotion code and returns the discount details.
// Called by checkout.html before payment so the customer sees the discount applied.

const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.kongtattoocareglobal.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { code } = req.body;

    if (!code) return res.status(400).json({ error: 'No code provided' });

    const promoCodes = await stripe.promotionCodes.list({
      code: code.trim().toUpperCase(),
      active: true,
      limit: 1,
    });

    if (!promoCodes.data.length) {
      return res.status(200).json({ valid: false, error: 'Invalid or expired code' });
    }

    const promo  = promoCodes.data[0];
    const coupon = promo.coupon;

    return res.status(200).json({
      valid:        true,
      code:         promo.code,
      percentOff:   coupon.percent_off  || null,
      amountOff:    coupon.amount_off   || null,
      name:         coupon.name         || null,
    });

  } catch (err) {
    console.error('Promo validation error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
