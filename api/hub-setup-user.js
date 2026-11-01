// api/hub-setup-user.js
// ONE-TIME setup endpoint: creates studio/superadmin users via service role key.
// Protected by KONG_HUB_SECRET. Delete after use.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const secret = process.env.KONG_HUB_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;

  if (!secret || !serviceKey || !supabaseUrl) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  const { auth_secret, users } = req.body || {};
  if (auth_secret !== secret) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const results = [];

  for (const user of (users || [])) {
    try {
      // Create auth user via Supabase Admin API
      const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { display_name: user.display_name },
          app_metadata: { provider: 'email', providers: ['email'] },
        }),
      });

      const authData = await createRes.json();

      if (!createRes.ok || !authData.id) {
        // User may already exist — try to get existing user
        if (authData.msg && authData.msg.includes('already been registered')) {
          // Get existing user ID
          const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(user.email)}`, {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
            },
          });
          const listData = await listRes.json();
          const existingUser = (listData.users || [])[0];
          if (existingUser) {
            authData.id = existingUser.id;
          }
        } else {
          results.push({ email: user.email, error: authData.msg || authData.message || JSON.stringify(authData) });
          continue;
        }
      }

      const uid = authData.id;

      // Upsert profile
      const profRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: uid,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          username: user.username || null,
        }),
      });

      const profText = await profRes.text();
      results.push({ email: user.email, uid, profileStatus: profRes.status, ok: true });
    } catch (err) {
      results.push({ email: user.email, error: err.message });
    }
  }

  return res.status(200).json({ results });
}
