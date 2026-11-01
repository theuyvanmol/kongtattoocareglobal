// api/hub-analytics.js
// Fetches Vercel Web Analytics data for the KONG Hub performance dashboard.
// Uses the Vercel REST API with the VERCEL_ACCESS_TOKEN env var (team token).

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.VERCEL_ACCESS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_GIT_REPO_SLUG;
  const teamId = process.env.VERCEL_TEAM_ID;

  // If no Vercel token, return placeholder data so the UI always renders
  if (!token) {
    return res.status(200).json({ source: 'placeholder', ...placeholderData() });
  }

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const team = teamId ? `&teamId=${teamId}` : '';

  try {
    const now = Date.now();
    const since = new Date(now - 30 * 24 * 3600 * 1000).toISOString();

    // Fetch Web Analytics page views (Vercel Analytics API)
    const [pageviews, deploymentsRes] = await Promise.all([
      fetch(`https://api.vercel.com/v1/web/analytics/pageviews?projectId=${projectId}&since=${since}&limit=1000${team}`, { headers })
        .then(r => r.json()).catch(() => null),
      fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=10${team}`, { headers })
        .then(r => r.json()).catch(() => null),
    ]);

    // ── Page views ─────────────────────────────────────────────────────
    let totalViews = 0, topPages = [], dailyViews = [];
    if (pageviews?.data) {
      totalViews = pageviews.data.reduce((s, d) => s + (d.value || 0), 0);
      dailyViews = (pageviews.data || []).slice(-14).map(d => ({ date: d.key, views: d.value || 0 }));
    }

    // ── Recent deployments ─────────────────────────────────────────────
    const deploys = (deploymentsRes?.deployments || []).slice(0, 8).map(d => ({
      uid: d.uid,
      url: d.url,
      state: d.state,
      created: d.createdAt,
      target: d.target || 'preview',
      source: d.source || 'git',
      ready: d.readyAt,
    }));

    return res.status(200).json({
      source: 'vercel',
      pageviews: { total: totalViews, daily: dailyViews },
      deployments: deploys,
    });
  } catch (err) {
    console.error('[hub-analytics] error:', err);
    // Return placeholder rather than erroring out
    return res.status(200).json({ source: 'placeholder', error: err.message, ...placeholderData() });
  }
}

function placeholderData() {
  const labels = [];
  const values = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    labels.push(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
    values.push(Math.floor(40 + Math.random() * 120));
  }
  return {
    pageviews: { total: values.reduce((a, b) => a + b, 0), daily: labels.map((l, i) => ({ date: l, views: values[i] })) },
    deployments: [],
  };
}
