// api/hub-stripe.js
// Handles both Stripe revenue dashboard AND orders/discount codes.
// Use ?type=orders for the Orders & Codes page; default returns revenue data.
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
        typeof v === 'object' && v !== null
          ? Object.entries(v).map(([k2, v2]) => [`${k}[${k2}]`, v2])
          : [[k, v]]
      )
    ).toString();
    return fetch(`https://api.stripe.com/v1${path}${qs ? '?' + qs : ''}`, {
      headers: { Authorization: `Bearer ${key}` },
    }).then(r => r.json());
  };

  const type = req.query?.type || 'revenue';

  try {
    // ── ORDERS & DISCOUNT CODES ────────────────────────────────────────
    if (type === 'orders') {
      const [piRes, couponsRes, promosRes, checkoutRes] = await Promise.all([
        stripe('/payment_intents', { limit: 100 }),
        stripe('/coupons', { limit: 100 }),
        stripe('/promotion_codes', { limit: 100 }),
        stripe('/checkout/sessions', { limit: 50 }),
      ]);

      // Build orders from checkout sessions (richest data)
      const sessionOrders = (checkoutRes.data || [])
        .filter(s => s.payment_status === 'paid' || s.status === 'complete')
        .map(s => {
          const addr = s.shipping_details?.address || s.customer_details?.address || {};
          const addrStr = [addr.line1, addr.line2, addr.city, addr.postal_code, addr.country].filter(Boolean).join(', ');
          return {
            id: s.payment_intent || s.id,
            session_id: s.id,
            name: s.customer_details?.name || s.shipping_details?.name || '—',
            email: s.customer_details?.email || '—',
            address: addrStr || '—',
            items: (s.line_items?.data || []).map(li => ({
              name: li.description || li.price?.nickname || 'Product',
              qty: li.quantity || 1,
              price: li.amount_total || li.price?.unit_amount || 0,
            })),
            total: s.amount_total || 0,
            currency: s.currency || 'gbp',
            discount_code: s.total_details?.breakdown?.discounts?.[0]?.discount?.coupon?.name || null,
            discount_amount: s.total_details?.amount_discount || 0,
            status: s.payment_status === 'paid' ? 'paid' : 'pending',
            created: s.created,
          };
        });

      // Fallback: payment intents not in sessions
      const sessionPIIds = new Set(sessionOrders.map(o => o.id));
      const piOrders = (piRes.data || [])
        .filter(p => p.status === 'succeeded' && !sessionPIIds.has(p.id))
        .map(p => {
          const a = p.shipping?.address || p.billing_details?.address || {};
          return {
            id: p.id,
            session_id: null,
            name: p.billing_details?.name || p.shipping?.name || '—',
            email: p.receipt_email || p.billing_details?.email || '—',
            address: [a.line1, a.line2, a.city, a.postal_code, a.country].filter(Boolean).join(', ') || '—',
            items: [{ name: p.description || p.statement_descriptor || 'Payment', qty: 1, price: p.amount }],
            total: p.amount,
            currency: p.currency || 'gbp',
            discount_code: null,
            discount_amount: 0,
            status: 'paid',
            created: p.created,
          };
        });

      const orders = [...sessionOrders, ...piOrders].sort((a, b) => b.created - a.created).slice(0, 100);

      // Discount codes — merge coupons + promo codes
      const couponMap = {};
      (couponsRes.data || []).forEach(c => { couponMap[c.id] = c; });

      const discountCodes = (promosRes.data || []).map(p => {
        const coupon = couponMap[p.coupon?.id] || p.coupon || {};
        return {
          id: p.id,
          code: p.code,
          coupon_id: coupon.id,
          off: coupon.percent_off ? `${coupon.percent_off}% off` : coupon.amount_off ? `£${(coupon.amount_off/100).toFixed(2)} off` : 'Discount',
          name: coupon.name || p.code,
          active: p.active && (coupon.valid !== false),
          times_redeemed: p.times_redeemed || 0,
          max_redemptions: p.max_redemptions || coupon.max_redemptions || null,
          expires_at: p.expires_at || coupon.redeem_by || null,
          created: p.created,
        };
      }).sort((a, b) => b.times_redeemed - a.times_redeemed);

      // Add bare coupons with no promo code
      (couponsRes.data || []).forEach(c => {
        if (!discountCodes.some(d => d.coupon_id === c.id)) {
          discountCodes.push({
            id: c.id, code: c.id, coupon_id: c.id,
            off: c.percent_off ? `${c.percent_off}% off` : c.amount_off ? `£${(c.amount_off/100).toFixed(2)} off` : 'Discount',
            name: c.name || c.id,
            active: c.valid !== false,
            times_redeemed: c.times_redeemed || 0,
            max_redemptions: c.max_redemptions || null,
            expires_at: c.redeem_by || null,
            created: c.created,
          });
        }
      });

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
    }

    // ── REVENUE DASHBOARD (default) ────────────────────────────────────
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 3600;
    const sixtyDaysAgo = now - 60 * 24 * 3600;

    const [balance, charges30, charges60, chargesAll, payouts, pi30, pi60, piAll] = await Promise.all([
      stripe('/balance'),
      stripe('/charges', { limit: 100, created: { gte: thirtyDaysAgo } }),
      stripe('/charges', { limit: 100, created: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }),
      stripe('/charges', { limit: 100 }),
      stripe('/payouts', { limit: 10 }),
      stripe('/payment_intents', { limit: 100, created: { gte: thirtyDaysAgo } }).catch(() => ({ data: [] })),
      stripe('/payment_intents', { limit: 100, created: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }).catch(() => ({ data: [] })),
      stripe('/payment_intents', { limit: 100 }).catch(() => ({ data: [] })),
    ]);

    const availableGBP = (balance.available || []).find(b => b.currency === 'gbp') || { amount: 0 };
    const pendingGBP = (balance.pending || []).find(b => b.currency === 'gbp') || { amount: 0 };
    const available = availableGBP.amount || (balance.available?.[0]?.amount ?? 0);
    const pending = pendingGBP.amount || (balance.pending?.[0]?.amount ?? 0);
    const currency = balance.available?.[0]?.currency ?? 'gbp';

    const rawCharges30 = (charges30.data || []).filter(c => c.status === 'succeeded' && !c.refunded);
    const rawPI30 = (pi30.data || []).filter(p => p.status === 'succeeded');
    const usePI = rawPI30.length > 0 && rawPI30.length >= rawCharges30.length;
    const getAmt = item => item.amount_received ?? item.amount ?? 0;

    const paid30 = usePI ? rawPI30 : rawCharges30;
    const rev30 = paid30.reduce((s, c) => s + getAmt(c), 0);

    const rawPI60 = (pi60.data || []).filter(p => p.status === 'succeeded');
    const paid60 = usePI ? rawPI60 : (charges60.data || []).filter(c => c.status === 'succeeded' && !c.refunded);
    const rev60 = paid60.reduce((s, c) => s + getAmt(c), 0);
    const revGrowth = rev60 ? Math.round(((rev30 - rev60) / rev60) * 100) : null;

    const dailyMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date((now - i * 86400) * 1000);
      const key2 = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      dailyMap[key2] = 0;
    }
    paid30.forEach(c => {
      const d = new Date(c.created * 1000);
      const key2 = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      if (key2 in dailyMap) dailyMap[key2] += getAmt(c);
    });
    const dailyLabels = Object.keys(dailyMap).slice(-14);
    const dailyValues = dailyLabels.map(k => (dailyMap[k] / 100).toFixed(2));

    const recentSrc = usePI
      ? (pi30.data || []).filter(p => p.status === 'succeeded')
      : (charges30.data || []).filter(c => c.status === 'succeeded');
    const recent = recentSrc.slice(0, 12).map(c => ({
      id: c.id,
      amount: getAmt(c),
      currency: c.currency,
      description: c.description || c.statement_descriptor || 'Payment',
      customer_email: c.receipt_email || c.billing_details?.email || null,
      created: c.created,
      refunded: c.refunded || false,
    }));

    const recentPayouts = (payouts.data || []).slice(0, 6).map(p => ({
      id: p.id, amount: p.amount, currency: p.currency, status: p.status, arrival_date: p.arrival_date,
    }));

    const rawPaidAll = usePI
      ? (piAll.data || []).filter(p => p.status === 'succeeded')
      : (chargesAll.data || []).filter(c => c.status === 'succeeded' && !c.refunded);
    const revLifetime = rawPaidAll.reduce((s, c) => s + getAmt(c), 0);
    const refunds30 = usePI ? 0 : paid30.filter(c => c.refunded).reduce((s, c) => s + (c.amount_refunded || 0), 0);
    const txCount30 = paid30.length;
    const avgOrder = txCount30 ? Math.round(rev30 / txCount30) : 0;

    return res.status(200).json({
      balance: { available, pending, currency },
      revenue: { last30Days: rev30, prev30Days: rev60, growth: revGrowth, refunds: refunds30, txCount: txCount30, avgOrder, lifetime: revLifetime },
      chart: { labels: dailyLabels, values: dailyValues },
      recentCharges: recent,
      payouts: recentPayouts,
    });

  } catch (err) {
    console.error('[hub-stripe] error:', err);
    return res.status(500).json({ error: err.message || 'Stripe API error' });
  }
}
