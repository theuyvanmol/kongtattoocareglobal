// api/hub-admin-stats.js
// Superadmin/team endpoint: returns studio/team counts and monthly signup
// data using service-role key so RLS doesn't block.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return res.status(500).json({ error: 'Missing env vars' });

  // Verify caller JWT
  const jwt = (req.headers.authorization || '').replace('Bearer ', '');
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
  if (role !== 'superadmin' && role !== 'team') return res.status(403).json({ error: 'Forbidden' });

  // Fetch all studio profiles with created_at + display_name for monthly breakdown + name lookup
  const studioRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?role=eq.studio&select=id,display_name,created_at&order=created_at.asc`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  const studios = await studioRes.json();

  // Fetch team count
  const teamRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?role=eq.team&select=id`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  );
  const team = await teamRes.json();

  // Build monthly signup counts for current year
  const now = new Date();
  const year = now.getFullYear();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyCounts = new Array(12).fill(0);
  let runningTotal = new Array(12).fill(0);

  (studios || []).forEach(s => {
    const d = new Date(s.created_at);
    if (d.getFullYear() === year) {
      monthlyCounts[d.getMonth()]++;
    }
  });

  // Running cumulative total per month (only for current year signups)
  let cumulative = 0;
  for (let i = 0; i <= now.getMonth(); i++) {
    cumulative += monthlyCounts[i];
    runningTotal[i] = cumulative;
  }
  // For future months in the year, leave as 0
  for (let i = now.getMonth() + 1; i < 12; i++) {
    runningTotal[i] = 0;
  }

  // Studio name map for client-side lookup
  const studioNames = {};
  (studios || []).forEach(s => { studioNames[s.id] = s.display_name; });

  return res.status(200).json({
    studioCount: (studios || []).length,
    teamCount: (team || []).length,
    studioNames,  // id -> display_name map
    studioGrowth: {
      labels: months,
      values: runningTotal,
    },
  });
}
