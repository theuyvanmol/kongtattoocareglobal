// api/hub-db-migrate.js
// ONE-TIME migration: creates stock_dispatches + trade_orders tables.
// Protected by KONG_HUB_SECRET. DELETE THIS FILE after running.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const secret = process.env.KONG_HUB_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;

  if (!secret || !serviceKey || !supabaseUrl) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  const { auth_secret } = req.method === 'POST' ? (req.body || {}) : req.query;
  if (auth_secret !== secret) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const sql = `
CREATE TABLE IF NOT EXISTS stock_dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  qty integer NOT NULL CHECK (qty > 0),
  note text,
  dispatched_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_dispatches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_all_dispatches" ON stock_dispatches;
DROP POLICY IF EXISTS "studio_own_dispatches" ON stock_dispatches;

CREATE POLICY "admins_all_dispatches" ON stock_dispatches
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin','team'))
  );

CREATE POLICY "studio_own_dispatches" ON stock_dispatches
  FOR SELECT USING (studio_id = auth.uid());

CREATE TABLE IF NOT EXISTS trade_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]',
  total_gbp numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  admin_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trade_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "studio_own_orders" ON trade_orders;
DROP POLICY IF EXISTS "admins_all_orders" ON trade_orders;

CREATE POLICY "studio_own_orders" ON trade_orders
  FOR ALL USING (studio_id = auth.uid());

CREATE POLICY "admins_all_orders" ON trade_orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin','team'))
  );
`;

  try {
    const r = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    // Supabase doesn't have exec_sql by default — use pg via the management API instead
    // Try the Supabase management API (requires service key + project ref)
    const projectRef = 'ulhuyfqhtprjxdgvdkwx';
    const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    const mgmtText = await mgmtRes.text();
    let mgmtData;
    try { mgmtData = JSON.parse(mgmtText); } catch { mgmtData = mgmtText; }

    return res.status(200).json({
      mgmt_status: mgmtRes.status,
      mgmt_ok: mgmtRes.ok,
      result: mgmtData,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
