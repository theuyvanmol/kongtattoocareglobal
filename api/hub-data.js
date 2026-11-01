// KONG Hub — Data API
// GET/POST /api/hub-data?resource=...
// Resources: users, stock, todos, commission, team-create, stock-request, stock-approve

const { createHash, randomBytes } = require('crypto');

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
  }
}

async function kvKeys(pattern) {
  if (process.env.KV_REST_API_URL) {
    const r = await fetch(`${process.env.KV_REST_API_URL}/keys/${encodeURIComponent(pattern)}`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    });
    const j = await r.json();
    return j.result || [];
  }
  return Object.keys(memStore).filter(k => {
    const p = pattern.replace('*', '.*');
    return new RegExp('^' + p + '$').test(k);
  });
}

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=');
    if (k) out[k.trim()] = v.join('=');
  });
  return out;
}

function hash(str) {
  return createHash('sha256').update(str + 'kong_salt_2024').digest('hex');
}

async function getSession(req) {
  const cookies = parseCookies(req);
  const token = cookies['kong_session'];
  if (!token) return null;
  const session = await kvGet(`session:${token}`);
  if (!session) return null;
  return kvGet(`user:${session.userId}`);
}

function safeUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

async function getAllUsers() {
  const keys = await kvKeys('user:*');
  const users = await Promise.all(keys.map(k => kvGet(k)));
  return users.filter(Boolean).map(safeUser);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const me = await getSession(req);
  if (!me) return res.status(401).json({ error: 'Not authenticated' });

  const resource = req.query?.resource || req.body?.resource;

  // ── GET: users list (superadmin sees all, team sees their assigned) ─
  if (req.method === 'GET' && resource === 'users') {
    const all = await getAllUsers();
    if (me.role === 'superadmin') return res.json({ users: all });
    if (me.role === 'team') {
      const mine = all.filter(u => u.role === 'studio' && (me.assignedStudios || []).includes(u.id));
      return res.json({ users: mine });
    }
    return res.status(403).json({ error: 'Forbidden' });
  }

  // ── GET: my stock (studio) ──────────────────────────────────────────
  if (req.method === 'GET' && resource === 'my-stock') {
    if (me.role !== 'studio') return res.status(403).json({ error: 'Forbidden' });
    return res.json({ stock: me.stock || {}, orders: me.orders || [] });
  }

  // ── GET: all stock (superadmin/team) ────────────────────────────────
  if (req.method === 'GET' && resource === 'all-stock') {
    if (me.role === 'studio') return res.status(403).json({ error: 'Forbidden' });
    const all = await getAllUsers();
    const studios = all.filter(u => u.role === 'studio');
    const data = studios.map(u => ({ id: u.id, name: u.displayName, stock: u.stock || {}, orders: u.orders || [] }));
    return res.json({ studios: data });
  }

  // ── GET: stock requests (pending) ──────────────────────────────────
  if (req.method === 'GET' && resource === 'stock-requests') {
    const all = await getAllUsers();
    const requests = [];
    all.filter(u => u.role === 'studio').forEach(u => {
      (u.stockRequests || []).filter(r => r.status === 'pending').forEach(r => {
        requests.push({ ...r, studioId: u.id, studioName: u.displayName });
      });
    });
    return res.json({ requests });
  }

  // ── GET: commission (team or superadmin) ────────────────────────────
  if (req.method === 'GET' && resource === 'commission') {
    if (me.role === 'studio') return res.status(403).json({ error: 'Forbidden' });
    if (me.role === 'team') return res.json({ commission: me.commission || {}, teamCode: me.teamCode });
    // superadmin: all team members
    const all = await getAllUsers();
    const team = all.filter(u => u.role === 'team' || u.role === 'superadmin');
    return res.json({ team: team.map(u => ({ id: u.id, name: u.displayName, teamCode: u.teamCode, commission: u.commission || {} })) });
  }

  // ── GET: todos ──────────────────────────────────────────────────────
  if (req.method === 'GET' && resource === 'todos') {
    return res.json({ todos: me.todos || [] });
  }

  // ── POST: todo add/toggle/delete ────────────────────────────────────
  if (req.method === 'POST' && resource === 'todo') {
    const { action, text, todoId } = req.body;
    const user = await kvGet(`user:${me.id}`);
    user.todos = user.todos || [];

    if (action === 'add') {
      user.todos.push({ id: 'td_' + Date.now(), text, done: false, createdAt: new Date().toISOString() });
    } else if (action === 'toggle') {
      const t = user.todos.find(x => x.id === todoId);
      if (t) t.done = !t.done;
    } else if (action === 'delete') {
      user.todos = user.todos.filter(x => x.id !== todoId);
    }
    await kvSet(`user:${me.id}`, user);
    return res.json({ todos: user.todos });
  }

  // ── POST: request stock (studio) ─────────────────────────────────────
  if (req.method === 'POST' && resource === 'stock-request') {
    if (me.role !== 'studio') return res.status(403).json({ error: 'Forbidden' });
    const { product, qty, notes } = req.body;
    const user = await kvGet(`user:${me.id}`);
    user.stockRequests = user.stockRequests || [];
    const req_obj = { id: 'sr_' + Date.now(), product, qty: parseInt(qty), notes, status: 'pending', createdAt: new Date().toISOString() };
    user.stockRequests.push(req_obj);
    await kvSet(`user:${me.id}`, user);
    return res.json({ request: req_obj });
  }

  // ── POST: approve stock request (admin/team) ─────────────────────────
  if (req.method === 'POST' && resource === 'stock-approve') {
    if (me.role === 'studio') return res.status(403).json({ error: 'Forbidden' });
    const { studioId, requestId, approved } = req.body;
    const studio = await kvGet(`user:${studioId}`);
    if (!studio) return res.status(404).json({ error: 'Studio not found' });
    const request = (studio.stockRequests || []).find(r => r.id === requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    request.status = approved ? 'approved' : 'declined';
    request.resolvedAt = new Date().toISOString();
    if (approved) {
      studio.stock = studio.stock || {};
      studio.stock[request.product] = studio.stock[request.product] || { units: 0, sold: 0 };
      studio.stock[request.product].units += request.qty;
    }
    await kvSet(`user:${studioId}`, studio);
    return res.json({ ok: true });
  }

  // ── POST: create team member (superadmin only) ───────────────────────
  if (req.method === 'POST' && resource === 'team-create') {
    if (me.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' });
    const { displayName, email, password, teamCode } = req.body;
    if (!displayName || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const existing = await kvGet(`email:${email.toLowerCase()}`);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const id = 'u_' + randomBytes(8).toString('hex');
    const user = {
      id, role: 'team', displayName, email: email.toLowerCase(),
      passwordHash: hash(password), studioName: null, teamCode: teamCode || null,
      assignedStudios: [],
      commission: { newStudios: 0, stripeUses: 0, totalEarned: 0 },
      todos: [], createdAt: new Date().toISOString(),
    };
    await kvSet(`user:${id}`, user);
    await kvSet(`email:${email.toLowerCase()}`, id);
    return res.status(201).json({ user: safeUser(user) });
  }

  // ── POST: assign studio to team member (superadmin only) ─────────────
  if (req.method === 'POST' && resource === 'assign-studio') {
    if (me.role !== 'superadmin') return res.status(403).json({ error: 'Forbidden' });
    const { teamMemberId, studioId } = req.body;
    const tm = await kvGet(`user:${teamMemberId}`);
    if (!tm) return res.status(404).json({ error: 'Team member not found' });
    tm.assignedStudios = tm.assignedStudios || [];
    if (!tm.assignedStudios.includes(studioId)) tm.assignedStudios.push(studioId);
    await kvSet(`user:${teamMemberId}`, tm);
    return res.json({ ok: true });
  }

  // ── POST: record commission (called from webhook/payment-intent) ──────
  if (req.method === 'POST' && resource === 'commission-record') {
    // Internal — verify with a shared secret
    const secret = req.headers['x-kong-secret'];
    if (secret !== process.env.KONG_HUB_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    const { type, teamCode, amount } = req.body; // type: 'stripe_use' | 'new_studio'
    // Find team member with this code
    const all = await getAllUsers();
    const tm = all.find(u => u.teamCode && u.teamCode.toUpperCase() === (teamCode || '').toUpperCase());
    if (!tm) return res.json({ ok: true, note: 'No team member with that code' });
    const user = await kvGet(`user:${tm.id}`);
    user.commission = user.commission || { newStudios: 0, stripeUses: 0, totalEarned: 0 };
    if (type === 'stripe_use') { user.commission.stripeUses += 1; user.commission.totalEarned += (amount || 0); }
    if (type === 'new_studio') { user.commission.newStudios += 1; user.commission.totalEarned += (amount || 0); }
    await kvSet(`user:${user.id}`, user);
    return res.json({ ok: true });
  }

  return res.status(404).json({ error: 'Unknown resource' });
};
