const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://www.kongtattoocareglobal.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items, promoCode, shipping } = req.body;

    if (!items || !items.length) return res.status(400).json({ error: 'No items in cart' });

    // Calculate base amount in pence
    let amount = Math.round(
      items.reduce((sum, item) => {
        const price = item.price < 100 ? item.price * 100 : item.price;
        return sum + price * (item.qty || 1);
      }, 0)
    );

    // Validate promo code and apply discount
    let discountAmount = 0;
    let promoCodeId = null;
    let promoCodeLabel = null;

    if (promoCode) {
      const promoCodes = await stripe.promotionCodes.list({
        code: promoCode.trim().toUpperCase(),
        active: true,
        limit: 1,
      });

      if (promoCodes.data.length > 0) {
        const promo = promoCodes.data[0];
        const coupon = promo.coupon;
        promoCodeId = promo.id;
        promoCodeLabel = promo.code;

        if (coupon.percent_off) {
          discountAmount = Math.round(amount * coupon.percent_off / 100);
        } else if (coupon.amount_off) {
          discountAmount = Math.min(coupon.amount_off, amount);
        }

        amount = Math.max(0, amount - discountAmount);
      } else {
        return res.status(400).json({ error: 'Invalid or expired discount code' });
      }
    }

    // Build metadata — includes promo code for commission tracking
    const metadata = {
      items: JSON.stringify(items.map(i => ({
        name: i.name || i.id,
        qty: i.qty,
        price: i.price,
      }))),
    };
    if (promoCodeId)    metadata.promo_code_id    = promoCodeId;
    if (promoCodeLabel) metadata.promo_code        = promoCodeLabel;
    if (discountAmount) metadata.discount_gbp      = (discountAmount / 100).toFixed(2);

    // Build PaymentIntent params
    const piParams = {
      amount,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata,
    };

    // Attach shipping address if provided
    if (shipping && shipping.name) {
      piParams.shipping = {
        name: shipping.name,
        address: {
          line1:       shipping.line1 || '',
          line2:       shipping.line2 || '',
          city:        shipping.city  || '',
          postal_code: shipping.postcode || '',
          country:     shipping.country || 'GB',
        },
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    return res.status(200).json({
      clientSecret:   paymentIntent.client_secret,
      discountAmount: discountAmount / 100,
      finalAmount:    amount / 100,
    });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
