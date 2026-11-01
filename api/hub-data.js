// KONG Hub — Data API (Supabase)
// All data operations go through Supabase client on the frontend.
// This serverless function handles internal/admin operations that need service-role key.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sbFetch(path, method = 'GET', body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t);
  }
  return r.status === 204 ? null : r.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-kong-secret');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Commission recording webhook — called from payment-intent.js
  if (req.method === 'POST' && req.body?.resource === 'commission-record') {
    const secret = req.headers['x-kong-secret'];
    if (secret !== process.env.KONG_HUB_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { type, teamCode, amount } = req.body;
    if (!teamCode) return res.json({ ok: true });

    // Find team member with this code
    const [member] = await sbFetch(`profiles?team_code=eq.${encodeURIComponent(teamCode.toUpperCase())}&limit=1`);
    if (!member) return res.json({ ok: true, note: 'No member with that code' });

    const update = {};
    if (type === 'stripe_use') {
      update.commission_stripe_uses  = (member.commission_stripe_uses  || 0) + 1;
      update.commission_total_earned = (member.commission_total_earned || 0) + (amount || 0);
    }
    if (type === 'new_studio') {
      update.commission_new_studios  = (member.commission_new_studios  || 0) + 1;
      update.commission_total_earned = (member.commission_total_earned || 0) + (amount || 0);
    }
    await sbFetch(`profiles?id=eq.${member.id}`, 'PATCH', update);
    return res.json({ ok: true });
  }

  return res.status(404).json({ error: 'Unknown resource' });
};
