// KONG Hub — Auth API
// POST /api/hub-auth  { action: 'login'|'logout'|'me', ...fields }
// Uses Vercel KV for storage; falls back to in-memory for local dev.

const { createHash, randomBytes } = require('crypto');

// ── In-memory fallback (dev / no KV) ────────────────────────────────
const memStore = {};

async function kvGet(key) {
  if (process.env.KV_REST_API_URL) {
    const r = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    });
    const j = await r.json();
    return j.result ? JSON.parse(j.result) : null;
  }
  return memStore[key] ?? null;
}

async function kvSet(key, value, exSeconds) {
  const v = JSON.stringify(value);
  if (process.env.KV_REST_API_URL) {
    const url = exSeconds
      ? `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}?ex=${exSeconds}`
      : `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`;
    await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(v),
    });
  } else {
    memStore[key] = value;
    if (exSeconds) setTimeout(() => delete memStore[key], exSeconds * 1000);
  }
}

async function kvDel(key) {
  if (process.env.KV_REST_API_URL) {
    await fetch(`${process.env.KV_REST_API_URL}/del/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    });
  } else {
    delete memStore[key];
  }
}

// ── Seed default users on first boot ─────────────────────────────────
const DEFAULT_USERS = [
  {
    id: 'u_admin',
    role: 'superadmin',
    displayName: 'KONG Admin',
    email: 'admin@kongtattoocareglobal.com',
    passwordHash: hash('KongAdmin2024!'),
    studioName: null,
    teamCode: null,        // promo code this team member earns on
    assignedStudios: [],   // superadmin sees all
    commission: { newStudios: 0, stripeUses: 0, totalEarned: 0 },
    todos: [],
    createdAt: new Date().toISOString(),
  },
];

function hash(str) {
  return createHash('sha256').update(str + 'kong_salt_2024').digest('hex');
}

async function seedIfNeeded() {
  const exists = await kvGet('user:u_admin');
  if (!exists) {
    for (const u of DEFAULT_USERS) {
      await kvSet(`user:${u.id}`, u);
      await kvSet(`email:${u.email}`, u.id);
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────
function setCookie(res, name, value, maxAge = 86400 * 7) {
  res.setHeader('Set-Cookie', `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`);
}

function clearCookie(res, name) {
  res.setHeader('Set-Cookie', `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=');
    if (k) out[k.trim()] = v.join('=');
  });
  return out;
}

function safeUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// ── Main handler ──────────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  await seedIfNeeded();

  const action = req.method === 'GET' ? 'me' : (req.body?.action || 'me');
  const cookies = parseCookies(req);

  // ── GET /me ───────────────────────────────────────────────────────
  if (action === 'me') {
    const token = cookies['kong_session'];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const session = await kvGet(`session:${token}`);
    if (!session) return res.status(401).json({ error: 'Session expired' });
    const user = await kvGet(`user:${session.userId}`);
    if (!user) return res.status(401).json({ error: 'User not found' });
    return res.json({ user: safeUser(user) });
  }

  // ── LOGIN ─────────────────────────────────────────────────────────
  if (action === 'login') {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const userId = await kvGet(`email:${email.toLowerCase()}`);
    if (!userId) return res.status(401).json({ error: 'Invalid email or password' });

    const user = await kvGet(`user:${userId}`);
    if (!user || user.passwordHash !== hash(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = randomBytes(32).toString('hex');
    await kvSet(`session:${token}`, { userId: user.id }, 86400 * 7);
    setCookie(res, 'kong_session', token, 86400 * 7);
    return res.json({ user: safeUser(user) });
  }

  // ── LOGOUT ────────────────────────────────────────────────────────
  if (action === 'logout') {
    const token = cookies['kong_session'];
    if (token) await kvDel(`session:${token}`);
    clearCookie(res, 'kong_session');
    return res.json({ ok: true });
  }

  // ── REGISTER (studio/artist) ──────────────────────────────────────
  if (action === 'register') {
    const { studioName, email, password } = req.body;
    if (!studioName || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = await kvGet(`email:${email.toLowerCase()}`);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const id = 'u_' + randomBytes(8).toString('hex');
    const user = {
      id,
      role: 'studio',
      displayName: studioName,
      email: email.toLowerCase(),
      passwordHash: hash(password),
      studioName,
      teamCode: null,
      assignedStudios: [],
      commission: { newStudios: 0, stripeUses: 0, totalEarned: 0 },
      todos: [],
      stock: {
        'Numb Spray 100ml': { units: 0, sold: 0 },
        'Numb Cream 60g':   { units: 0, sold: 0 },
        'Glow Balm 30ml':   { units: 0, sold: 0 },
        'Renew Butter 50ml':{ units: 0, sold: 0 },
      },
      orders: [],
      createdAt: new Date().toISOString(),
    };
    await kvSet(`user:${id}`, user);
    await kvSet(`email:${email.toLowerCase()}`, id);

    // auto-login
    const token = randomBytes(32).toString('hex');
    await kvSet(`session:${token}`, { userId: id }, 86400 * 7);
    setCookie(res, 'kong_session', token, 86400 * 7);
    return res.status(201).json({ user: safeUser(user) });
  }

  return res.status(400).json({ error: 'Unknown action' });
};
