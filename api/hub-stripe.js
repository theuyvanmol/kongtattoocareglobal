// api/hub-stripe.js
// Serverless API: fetches Stripe data for the KONG Hub dashboard.
// STRIPE_SECRET_KEY is only available server-side — never exposed to the client.

export default async function handler(req, res) {
  // CORS + cache
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(500).json({ error: 'Stripe not configured' });

  const stripe = (path, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`https://api.stripe.com/v1${path}${qs ? '?' + qs : ''}`, {
      headers: { Authorization: `Bearer ${key}` },
    }).then(r => r.json());
  };

  try {
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 3600;
    const sixtyDaysAgo = now - 60 * 24 * 3600;

    // Run all Stripe calls in parallel — check both charges and payment_intents (some accounts use one or the other)
    const [balance, charges30, charges60, chargesAll, payouts, pi30, pi60, piAll] = await Promise.all([
      stripe('/balance'),
      stripe('/charges', { limit: 100, created: { gte: thirtyDaysAgo } }),
      stripe('/charges', { limit: 100, created: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }),
      stripe('/charges', { limit: 100 }), // for lifetime (most recent 100)
      stripe('/payouts', { limit: 10 }),
      stripe('/payment_intents', { limit: 100, created: { gte: thirtyDaysAgo } }).catch(() => ({ data: [] })),
      stripe('/payment_intents', { limit: 100, created: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }).catch(() => ({ data: [] })),
      stripe('/payment_intents', { limit: 100 }).catch(() => ({ data: [] })),
    ]);

    // ── Balance ────────────────────────────────────────────────────────
    const availableGBP = (balance.available || []).find(b => b.currency === 'gbp') || { amount: 0 };
    const pendingGBP = (balance.pending || []).find(b => b.currency === 'gbp') || { amount: 0 };
    // Fall back to first currency if no GBP
    const available = availableGBP.amount || (balance.available?.[0]?.amount ?? 0);
    const pending = pendingGBP.amount || (balance.pending?.[0]?.amount ?? 0);
    const currency = balance.available?.[0]?.currency ?? 'gbp';

    // ── Revenue — prefer payment_intents when charges are sparse ──────
    // Some Stripe accounts (Checkout / Payment Links) show empty /charges but have /payment_intents
    const rawCharges30 = (charges30.data || []).filter(c => c.status === 'succeeded' && !c.refunded);
    const rawPI30     = (pi30.data || []).filter(p => p.status === 'succeeded');
    // Use payment_intents when they have more data OR when charges are empty
    const usePI = rawPI30.length > 0 && rawPI30.length >= rawCharges30.length;
    const getAmt = item => item.amount_received ?? item.amount ?? 0;

    const paid30 = usePI ? rawPI30 : rawCharges30;
    const rev30  = paid30.reduce((s, c) => s + getAmt(c), 0);

    const rawPI60 = (pi60.data || []).filter(p => p.status === 'succeeded');
    const paid60  = usePI
      ? rawPI60
      : (charges60.data || []).filter(c => c.status === 'succeeded' && !c.refunded);
    const rev60 = paid60.reduce((s, c) => s + getAmt(c), 0);
    const revGrowth = rev60 ? Math.round(((rev30 - rev60) / rev60) * 100) : null;

    // ── Daily revenue for chart (last 30 days) ─────────────────────────
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
    const dailyLabels = Object.keys(dailyMap).slice(-14); // last 14 days for chart
    const dailyValues = dailyLabels.map(k => (dailyMap[k] / 100).toFixed(2));

    // ── Recent transactions ────────────────────────────────────────────
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

    // ── Payouts ────────────────────────────────────────────────────────
    const recentPayouts = (payouts.data || []).slice(0, 6).map(p => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      arrival_date: p.arrival_date,
    }));

    // ── Lifetime (most recent 100 as proxy indicator) ──────────────────
    const rawPaidAll = usePI
      ? (piAll.data || []).filter(p => p.status === 'succeeded')
      : (chargesAll.data || []).filter(c => c.status === 'succeeded' && !c.refunded);
    const revLifetime = rawPaidAll.reduce((s, c) => s + getAmt(c), 0);

    // ── Totals ─────────────────────────────────────────────────────────
    const refunds30 = usePI ? 0 : paid30.filter(c => c.refunded).reduce((s, c) => s + (c.amount_refunded || 0), 0);
    const txCount30 = paid30.length;
    const avgOrder = txCount30 ? Math.round(rev30 / txCount30) : 0;

    return res.status(200).json({
      balance: { available, pending, currency },
      revenue: {
        last30Days: rev30,
        prev30Days: rev60,
        growth: revGrowth,
        refunds: refunds30,
        txCount: txCount30,
        avgOrder,
        lifetime: revLifetime,
      },
      chart: { labels: dailyLabels, values: dailyValues },
      recentCharges: recent,
      payouts: recentPayouts,
    });
  } catch (err) {
    console.error('[hub-stripe] error:', err);
    return res.status(500).json({ error: err.message || 'Stripe API error' });
  }
}
