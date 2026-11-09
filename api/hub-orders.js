// api/hub-orders.js
// Fetches Stripe buyer orders + discount/promo codes for the KONG Hub Orders page.
// STRIPE_SECRET_KEY is server-side only — never exposed to the client.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'Stripe not configured — add STRIPE_SECRET_KEY to Vercel env vars.' });

  const stripe = (path, params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).flatMap(([k, v]) =>
        typeof v === 'object' ? Object.entries(v).map(([k2, v2]) => [`${k}[${k2}]`, v2]) : [[k, v]]
      )
    ).toString();
    return fetch(`https://api.stripe.com/v1${path}${qs ? '?' + qs : ''}`, {
      headers: { Authorization: `Bearer ${key}` },
    }).then(r => r.json());
  };

  try {
    // Fetch payment intents (most reliable for Checkout-based stores), coupons, and promo codes in parallel
    const [piRes, couponsRes, promosRes, checkoutRes] = await Promise.all([
      stripe('/payment_intents', { limit: 100, expand: ['data.customer'] }),
      stripe('/coupons', { limit: 100 }),
      stripe('/promotion_codes', { limit: 100 }),
      stripe('/checkout/sessions', { limit: 50, expand: ['data.customer', 'data.line_items'] }),
    ]);

    // ── Build orders from checkout sessions (richest data: has line items + address) ──
    const sessionOrders = (checkoutRes.data || [])
      .filter(s => s.payment_status === 'paid' || s.status === 'complete')
      .map(s => {
        const addr = s.shipping_details?.address || s.customer_details?.address || {};
        const addrStr = [addr.line1, addr.line2, addr.city, addr.postal_code, addr.country]
          .filter(Boolean).join(', ');
        const items = (s.line_items?.data || []).map(li => ({
          name: li.description || li.price?.nickname || 'Product',
          qty: li.quantity || 1,
          price: li.amount_total || li.price?.unit_amount || 0,
        }));
        return {
          id: s.payment_intent || s.id,
          session_id: s.id,
          name: s.customer_details?.name || s.shipping_details?.name || '—',
          email: s.customer_details?.email || '—',
          address: addrStr || '—',
          items,
          total: s.amount_total || 0,
          currency: s.currency || 'gbp',
          discount_code: s.total_details?.breakdown?.discounts?.[0]?.discount?.coupon?.name
            || s.total_details?.breakdown?.discounts?.[0]?.discount?.promotion_code?.code
            || null,
          discount_amount: s.total_details?.amount_discount || 0,
          status: s.payment_status === 'paid' ? 'paid' : 'pending',
          created: s.created,
          source: 'checkout',
        };
      });

    // ── Fallback: payment intents for any orders not in sessions list ──
    const sessionPIIds = new Set(sessionOrders.map(o => o.id));
    const piOrders = (piRes.data || [])
      .filter(p => p.status === 'succeeded' && !sessionPIIds.has(p.id))
      .map(p => ({
        id: p.id,
        session_id: null,
        name: p.billing_details?.name || p.shipping?.name || '—',
        email: p.receipt_email || p.billing_details?.email || '—',
        address: (() => {
          const a = p.shipping?.address || p.billing_details?.address || {};
          return [a.line1, a.line2, a.city, a.postal_code, a.country].filter(Boolean).join(', ') || '—';
        })(),
        items: [{ name: p.description || p.statement_descriptor || 'Payment', qty: 1, price: p.amount }],
        total: p.amount,
        currency: p.currency || 'gbp',
        discount_code: null,
        discount_amount: 0,
        status: 'paid',
        created: p.created,
        source: 'pi',
      }));

    const orders = [...sessionOrders, ...piOrders]
      .sort((a, b) => b.created - a.created)
      .slice(0, 100);

    // ── Discount codes — merge coupons + promo codes ──
    const couponMap = {};
    (couponsRes.data || []).forEach(c => { couponMap[c.id] = c; });

    const discountCodes = (promosRes.data || []).map(p => {
      const coupon = couponMap[p.coupon?.id] || p.coupon || {};
      return {
        id: p.id,
        code: p.code,
        coupon_id: coupon.id,
        off: coupon.percent_off
          ? `${coupon.percent_off}% off`
          : coupon.amount_off
            ? `£${(coupon.amount_off / 100).toFixed(2)} off`
            : 'Discount',
        percent_off: coupon.percent_off || null,
        amount_off: coupon.amount_off || null,
        name: coupon.name || p.code,
        active: p.active && (coupon.valid !== false),
        times_redeemed: p.times_redeemed || 0,
        max_redemptions: p.max_redemptions || coupon.max_redemptions || null,
        expires_at: p.expires_at || coupon.redeem_by || null,
        currency: coupon.currency || 'gbp',
        created: p.created,
      };
    }).sort((a, b) => b.times_redeemed - a.times_redeemed);

    // Also include any coupons that have no promo code attached
    (couponsRes.data || []).forEach(c => {
      const hasPromo = discountCodes.some(d => d.coupon_id === c.id);
      if (!hasPromo) {
        discountCodes.push({
          id: c.id,
          code: c.id,
          coupon_id: c.id,
          off: c.percent_off ? `${c.percent_off}% off` : c.amount_off ? `£${(c.amount_off/100).toFixed(2)} off` : 'Discount',
          percent_off: c.percent_off || null,
          amount_off: c.amount_off || null,
          name: c.name || c.id,
          active: c.valid !== false,
          times_redeemed: c.times_redeemed || 0,
          max_redemptions: c.max_redemptions || null,
          expires_at: c.redeem_by || null,
          currency: c.currency || 'gbp',
          created: c.created,
        });
      }
    });

    // ── Stats ──
    const totalRev = orders.reduce((s, o) => s + o.total, 0);
    const codesUsed = orders.filter(o => o.discount_code).length;

    return res.status(200).json({
      orders,
      discountCodes,
      stats: {
        totalOrders: orders.length,
        totalRevenue: totalRev,
        ordersWithCode: codesUsed,
        avgOrder: orders.length ? Math.round(totalRev / orders.length) : 0,
      },
    });
  } catch (err) {
    console.error('[hub-orders] error:', err);
    return res.status(500).json({ error: err.message || 'Stripe API error' });
  }
}
