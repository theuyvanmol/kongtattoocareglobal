// api/hub-add-studio.js
// Superadmin endpoint: manually add a new studio account.
// Uses SUPABASE_SERVICE_ROLE_KEY server-side — never exposed to client.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return res.status(500).json({ error: 'Missing env vars' });

  // Verify caller is superadmin
  const authHeader = req.headers.authorization || '';
  const jwt = authHeader.replace('Bearer ', '');
  if (!jwt) return res.status(401).json({ error: 'No token' });

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${jwt}` }
  });
  const userData = await userRes.json();
  if (!userRes.ok || !userData.id) return res.status(401).json({ error: 'Invalid token' });

  const profRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userData.id}&select=role`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
  });
  const profiles = await profRes.json();
  const role = profiles?.[0]?.role;
  if (role !== 'superadmin') return res.status(403).json({ error: 'Superadmin only' });

  const { display_name, email, password, username } = req.body || {};
  if (!display_name || !email || !password) {
    return res.status(400).json({ error: 'display_name, email and password are required' });
  }

  // Create auth user via Supabase Admin API
  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name },
      app_metadata: { provider: 'email', providers: ['email'] },
    }),
  });

  const authData = await createRes.json();
  if (!createRes.ok || !authData.id) {
    return res.status(400).json({ error: authData.msg || authData.message || 'Failed to create auth user' });
  }

  const uid = authData.id;

  // Upsert profile with role=studio
  const profilePayload = {
    id: uid,
    email,
    display_name,
    role: 'studio',
  };
  if (username) profilePayload.username = username;

  const upsertRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(profilePayload),
  });

  if (!upsertRes.ok) {
    const txt = await upsertRes.text();
    return res.status(500).json({ error: 'Auth user created but profile failed: ' + txt });
  }

  return res.status(200).json({ ok: true, uid, email, display_name });
}
