// api/hub-analytics.js
// Fetches real data from Google Analytics 4 Data API for the KONG Hub dashboard.
//
// Required env vars:
//   GA4_PROPERTY_ID     — numeric property ID, e.g. 560748934
//   GA4_CLIENT_EMAIL    — service account email from credentials JSON
//   GA4_PRIVATE_KEY     — service account private key (PEM, with \n newlines)
//
// How to set up (one-time, 5 min):
//   1. Go to console.cloud.google.com → create/select a project
//   2. Enable "Google Analytics Data API"
//   3. IAM & Admin → Service Accounts → Create → download JSON key
//   4. In GA4: Admin → Property → Property Access Management → add service account email as "Viewer"
//   5. Add GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY to Vercel env vars
//
// Falls back to Vercel Analytics if GA4 creds are missing, then placeholder data.

const { rateLimit } = require('./_ratelimit');

// Minimal JWT + Google OAuth2 for service account — no extra dependencies needed
const crypto = require('crypto');
const https = require('https');

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getGoogleAccessToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64url(Buffer.from(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })));
  const sigInput = `${header}.${payload}`;
  // Fix escaped newlines in env var
  const key = privateKey.replace(/\\n/g, '\n');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(sigInput);
  const sig = base64url(sign.sign(key));
  const jwt = `${sigInput}.${sig}`;

  return new Promise((resolve, reject) => {
    const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { const j = JSON.parse(data); j.access_token ? resolve(j.access_token) : reject(new Error(j.error_description || 'Token error')); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function ga4Request(path, body, token) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request({
      hostname: 'analyticsdata.googleapis.com',
      path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function fetchGA4Data(propertyId, token) {
  const prop = `properties/${propertyId}`;

  const [overviewRes, dailyRes, countriesRes, pagesRes, sourcesRes, realtimeRes] = await Promise.all([
    // 30-day totals
    ga4Request(`/v1beta/${prop}:runReport`, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
        { name: 'newUsers' },
      ],
    }, token),

    // Daily pageviews last 30 days
    ga4Request(`/v1beta/${prop}:runReport`, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    }, token),

    // Top countries
    ga4Request(`/v1beta/${prop}:runReport`, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    }, token),

    // Top pages
    ga4Request(`/v1beta/${prop}:runReport`, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    }, token),

    // Traffic sources
    ga4Request(`/v1beta/${prop}:runReport`, {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 8,
    }, token),

    // Realtime active users
    ga4Request(`/v1beta/${prop}:runRealtimeReport`, {
      metrics: [{ name: 'activeUsers' }],
    }, token),
  ]);

  // Parse overview
  const ov = overviewRes.rows?.[0]?.metricValues || [];
  const overview = {
    activeUsers: parseInt(ov[0]?.value || 0),
    sessions: parseInt(ov[1]?.value || 0),
    pageviews: parseInt(ov[2]?.value || 0),
    bounceRate: parseFloat(ov[3]?.value || 0),
    avgSessionDuration: parseFloat(ov[4]?.value || 0),
    newUsers: parseInt(ov[5]?.value || 0),
  };

  // Parse daily
  const daily = (dailyRes.rows || []).map(r => ({
    date: r.dimensionValues[0].value, // YYYYMMDD
    views: parseInt(r.metricValues[0].value || 0),
    users: parseInt(r.metricValues[1].value || 0),
  }));

  // Parse countries
  const countries = (countriesRes.rows || []).map(r => ({
    country: r.dimensionValues[0].value,
    users: parseInt(r.metricValues[0].value || 0),
  }));

  // Parse top pages
  const pages = (pagesRes.rows || []).map(r => ({
    path: r.dimensionValues[0].value,
    views: parseInt(r.metricValues[0].value || 0),
  }));

  // Parse sources
  const sources = (sourcesRes.rows || []).map(r => ({
    channel: r.dimensionValues[0].value,
    sessions: parseInt(r.metricValues[0].value || 0),
  }));

  // Realtime
  const realtimeUsers = parseInt(realtimeRes.rows?.[0]?.metricValues?.[0]?.value || 0);

  return { overview, daily, countries, pages, sources, realtimeUsers };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (rateLimit(req, res, { limit: 30, windowMs: 60_000, endpoint: 'hub-analytics' })) return;

  const propertyId = process.env.GA4_PROPERTY_ID;
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY;

  // ── GA4 path ───────────────────────────────────────────────────────────────
  if (propertyId && clientEmail && privateKey) {
    try {
      const token = await getGoogleAccessToken(clientEmail, privateKey);
      const ga4 = await fetchGA4Data(propertyId, token);
      return res.status(200).json({
        source: 'ga4',
        propertyId,
        realtimeUsers: ga4.realtimeUsers,
        overview: ga4.overview,
        // Legacy fields for existing hub UI
        pageviews: {
          total: ga4.overview.pageviews,
          daily: ga4.daily.map(d => ({
            date: `${d.date.slice(6,8)} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(d.date.slice(4,6))-1]}`,
            views: d.views,
            users: d.users,
          })),
        },
        countries: ga4.countries,
        pages: ga4.pages,
        sources: ga4.sources,
        deployments: [],
      });
    } catch (err) {
      console.error('[hub-analytics] GA4 error:', err.message);
      // Fall through to placeholder with error note
      return res.status(200).json({ source: 'error', error: err.message, ...placeholderData() });
    }
  }

  // ── Placeholder (no credentials yet) ──────────────────────────────────────
  return res.status(200).json({
    source: 'placeholder',
    setupRequired: true,
    message: 'Add GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY to Vercel env vars to see real data.',
    ...placeholderData(),
  });
};

function placeholderData() {
  const labels = [];
  const values = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    labels.push(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
    values.push(Math.floor(10 + Math.random() * 60));
  }
  return {
    realtimeUsers: 0,
    overview: { activeUsers: 0, sessions: 0, pageviews: 0, bounceRate: 0, avgSessionDuration: 0, newUsers: 0 },
    pageviews: { total: values.reduce((a, b) => a + b, 0), daily: labels.map((l, i) => ({ date: l, views: values[i] })) },
    countries: [],
    pages: [],
    sources: [],
    deployments: [],
  };
}
