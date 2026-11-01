// KONG Hub — Auth API (Supabase)
// Handles session verification; actual auth is done client-side via Supabase JS SDK
// This endpoint is used for server-side session verification when needed

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // This endpoint just returns Supabase config for the client
  // The client uses Supabase JS directly for all auth
  return res.json({
    url: process.env.SUPABASE_URL || '',
    anon: process.env.SUPABASE_ANON_KEY || '',
  });
};
