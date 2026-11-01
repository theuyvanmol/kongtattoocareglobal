// api/hub-trade.js
// Admin endpoint: list all trade orders across all studios (superadmin/team only).
// Uses SUPABASE_SERVICE_ROLE_KEY server-side — never exposed to client.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return res.status(500).json({ error: 'Missing env vars' });

  // Verify the caller's JWT is superadmin or team
  const authHeader = req.headers.authorization || '';
  const jwt = authHeader.replace('Bearer ', '');
  if (!jwt) return res.status(401).json({ error: 'No token' });

  // Verify token and get user role
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${jwt}` }
  });
  const userData = await userRes.json();
  if (!userRes.ok || !userData.id) return res.status(401).json({ error: 'Invalid token' });

  // Check profile role
  const profRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userData.id}&select=role`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  const profiles = await profRes.json();
  const role = profiles?.[0]?.role;
  if (role !== 'superadmin' && role !== 'team') return res.status(403).json({ error: 'Forbidden' });

  // Fetch all orders with studio name
  const ordersRes = await fetch(
    `${supabaseUrl}/rest/v1/trade_orders?select=*,profiles(display_name)&order=created_at.desc&limit=200`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  const orders = await ordersRes.json();

  return res.status(200).json({ orders });
}
