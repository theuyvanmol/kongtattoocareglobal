const Stripe = require('stripe');
const { rateLimit } = require('./_ratelimit');

module.exports = async (req, res) => {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', 'https://www.kongtattoocareglobal.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Rate limit: 10 checkout attempts per minute per IP
  if (rateLimit(req, res, { limit: 10, windowMs: 60_000, endpoint: 'checkout' })) return;

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items, type, studio_id, studio_name } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    const isTradeOrder = type === 'trade';

    // Build Stripe line items from cart
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name || (item.line1 && item.line2 ? item.line1 + ' ' + item.line2 : null) || item.title || item.label || item.id || 'KONG Product',
        },
        // For trade orders, price is already in pence (unit_price field); for regular, handle both
        unit_amount: isTradeOrder
          ? Math.round(item.unit_price * 100)
          : Math.round(item.price < 100 ? item.price * 100 : item.price),
      },
      quantity: item.qty || 1,
    }));

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: isTradeOrder
        ? 'https://hub.kongtattoocareglobal.com/hub.html?trade_success=1'
        : 'https://www.kongtattoocareglobal.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: isTradeOrder
        ? 'https://hub.kongtattoocareglobal.com/hub.html?trade_cancel=1'
        : 'https://www.kongtattoocareglobal.com/checkout',
      billing_address_collection: 'required',
    };

    if (!isTradeOrder) {
      sessionParams.shipping_address_collection = {
        allowed_countries: ['GB', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK', 'FI', 'IE', 'BE', 'AT', 'CH', 'PT', 'ES', 'IT', 'PL', 'CZ', 'HR', 'RS', 'BA', 'KZ', 'RU', 'AU', 'US', 'CA'],
      };
    }

    // For trade orders, embed studio info + cart snapshot in metadata so the webhook can record the order
    if (isTradeOrder && studio_id) {
      sessionParams.metadata = {
        type: 'trade',
        studio_id: String(studio_id),
        studio_name: String(studio_name || ''),
        // Store cart as JSON (Stripe metadata values max 500 chars; truncate gracefully)
        items_json: JSON.stringify(items).slice(0, 490),
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
