-- ============================================================
-- KONG Tattoo Care — Supabase Row Level Security Migration
-- Run this entire script in the Supabase SQL Editor
-- Project: ulhuyfqhtprjxdgvdkwx (ap-southeast-2)
-- ============================================================

-- ============================================================
-- STEP 1: Enable RLS on every table
-- ============================================================

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_dispatches    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_orders        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Drop existing policies to start fresh (idempotent)
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "profiles_select_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_superadmin_all"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_team_all"        ON public.profiles;

-- stock_items
DROP POLICY IF EXISTS "stock_items_superadmin_all" ON public.stock_items;
DROP POLICY IF EXISTS "stock_items_team_all"       ON public.stock_items;
DROP POLICY IF EXISTS "stock_items_studio_select"  ON public.stock_items;

-- stock_requests
DROP POLICY IF EXISTS "stock_requests_studio_own"     ON public.stock_requests;
DROP POLICY IF EXISTS "stock_requests_superadmin_all" ON public.stock_requests;
DROP POLICY IF EXISTS "stock_requests_team_all"       ON public.stock_requests;

-- stock_dispatches
DROP POLICY IF EXISTS "stock_dispatches_superadmin_all" ON public.stock_dispatches;
DROP POLICY IF EXISTS "stock_dispatches_team_all"       ON public.stock_dispatches;
DROP POLICY IF EXISTS "stock_dispatches_studio_select"  ON public.stock_dispatches;

-- studio_assignments
DROP POLICY IF EXISTS "studio_assignments_superadmin_all" ON public.studio_assignments;
DROP POLICY IF EXISTS "studio_assignments_team_all"       ON public.studio_assignments;
DROP POLICY IF EXISTS "studio_assignments_studio_select"  ON public.studio_assignments;

-- todos
DROP POLICY IF EXISTS "todos_superadmin_all" ON public.todos;
DROP POLICY IF EXISTS "todos_team_own"       ON public.todos;

-- trade_orders
DROP POLICY IF EXISTS "trade_orders_studio_own"     ON public.trade_orders;
DROP POLICY IF EXISTS "trade_orders_superadmin_all" ON public.trade_orders;
DROP POLICY IF EXISTS "trade_orders_team_all"       ON public.trade_orders;

-- ============================================================
-- STEP 3: Create a helper to get the current user's role
-- (avoids round-trip; reads from profiles using auth.uid())
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- STEP 4: PROFILES policies
-- ============================================================

-- Superadmin: full access to all profiles
CREATE POLICY "profiles_superadmin_all" ON public.profiles
  FOR ALL
  USING (public.get_my_role() = 'superadmin')
  WITH CHECK (public.get_my_role() = 'superadmin');

-- Team: read all profiles, update own
CREATE POLICY "profiles_team_select" ON public.profiles
  FOR SELECT
  USING (public.get_my_role() = 'team');

CREATE POLICY "profiles_team_update_own" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid() AND public.get_my_role() = 'team')
  WITH CHECK (id = auth.uid() AND public.get_my_role() = 'team');

-- Studio: read and update own profile only
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid() AND public.get_my_role() = 'studio')
  WITH CHECK (id = auth.uid() AND public.get_my_role() = 'studio');

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- STEP 5: STOCK_ITEMS policies
-- (product catalogue — studios can browse, admins manage)
-- ============================================================

-- Superadmin: full access
CREATE POLICY "stock_items_superadmin_all" ON public.stock_items
  FOR ALL
  USING (public.get_my_role() = 'superadmin')
  WITH CHECK (public.get_my_role() = 'superadmin');

-- Team: full access
CREATE POLICY "stock_items_team_all" ON public.stock_items
  FOR ALL
  USING (public.get_my_role() = 'team')
  WITH CHECK (public.get_my_role() = 'team');

-- Studio: read-only (to browse products for ordering)
CREATE POLICY "stock_items_studio_select" ON public.stock_items
  FOR SELECT
  USING (public.get_my_role() = 'studio');

-- ============================================================
-- STEP 6: STOCK_REQUESTS policies
-- (studios raise requests; admins manage all)
-- ============================================================

-- Superadmin: full access to all requests
CREATE POLICY "stock_requests_superadmin_all" ON public.stock_requests
  FOR ALL
  USING (public.get_my_role() = 'superadmin')
  WITH CHECK (public.get_my_role() = 'superadmin');

-- Team: full access
CREATE POLICY "stock_requests_team_all" ON public.stock_requests
  FOR ALL
  USING (public.get_my_role() = 'team')
  WITH CHECK (public.get_my_role() = 'team');

-- Studio: own requests only (insert, select, update to cancel)
CREATE POLICY "stock_requests_studio_own" ON public.stock_requests
  FOR ALL
  USING (studio_id = auth.uid() AND public.get_my_role() = 'studio')
  WITH CHECK (studio_id = auth.uid() AND public.get_my_role() = 'studio');

-- ============================================================
-- STEP 7: STOCK_DISPATCHES policies
-- (admins dispatch; studios see dispatches for their requests)
-- ============================================================

-- Superadmin: full access
CREATE POLICY "stock_dispatches_superadmin_all" ON public.stock_dispatches
  FOR ALL
  USING (public.get_my_role() = 'superadmin')
  WITH CHECK (public.get_my_role() = 'superadmin');

-- Team: full access
CREATE POLICY "stock_dispatches_team_all" ON public.stock_dispatches
  FOR ALL
  USING (public.get_my_role() = 'team')
  WITH CHECK (public.get_my_role() = 'team');

-- Studio: read dispatches linked to their own requests
CREATE POLICY "stock_dispatches_studio_select" ON public.stock_dispatches
  FOR SELECT
  USING (
    public.get_my_role() = 'studio'
    AND request_id IN (
      SELECT id FROM public.stock_requests WHERE studio_id = auth.uid()
    )
  );

-- ============================================================
-- STEP 8: STUDIO_ASSIGNMENTS policies
-- ============================================================

-- Superadmin: full access
CREATE POLICY "studio_assignments_superadmin_all" ON public.studio_assignments
  FOR ALL
  USING (public.get_my_role() = 'superadmin')
  WITH CHECK (public.get_my_role() = 'superadmin');

-- Team: full access
CREATE POLICY "studio_assignments_team_all" ON public.studio_assignments
  FOR ALL
  USING (public.get_my_role() = 'team')
  WITH CHECK (public.get_my_role() = 'team');

-- Studio: see their own assignments only
CREATE POLICY "studio_assignments_studio_select" ON public.studio_assignments
  FOR SELECT
  USING (studio_id = auth.uid() AND public.get_my_role() = 'studio');

-- ============================================================
-- STEP 9: TODOS policies
-- ============================================================

-- Superadmin: full access to all todos
CREATE POLICY "todos_superadmin_all" ON public.todos
  FOR ALL
  USING (public.get_my_role() = 'superadmin')
  WITH CHECK (public.get_my_role() = 'superadmin');

-- Team: manage their own todos
CREATE POLICY "todos_team_own" ON public.todos
  FOR ALL
  USING (
    public.get_my_role() = 'team'
    AND (assigned_to = auth.uid() OR created_by = auth.uid())
  )
  WITH CHECK (
    public.get_my_role() = 'team'
    AND (assigned_to = auth.uid() OR created_by = auth.uid())
  );

-- ============================================================
-- STEP 10: TRADE_ORDERS policies
-- (studios place orders via Stripe; webhook inserts via service role)
-- ============================================================

-- Superadmin: full access
CREATE POLICY "trade_orders_superadmin_all" ON public.trade_orders
  FOR ALL
  USING (public.get_my_role() = 'superadmin')
  WITH CHECK (public.get_my_role() = 'superadmin');

-- Team: full access
CREATE POLICY "trade_orders_team_all" ON public.trade_orders
  FOR ALL
  USING (public.get_my_role() = 'team')
  WITH CHECK (public.get_my_role() = 'team');

-- Studio: own orders only (select + update to cancel)
CREATE POLICY "trade_orders_studio_own" ON public.trade_orders
  FOR ALL
  USING (studio_id = auth.uid() AND public.get_my_role() = 'studio')
  WITH CHECK (studio_id = auth.uid() AND public.get_my_role() = 'studio');

-- ============================================================
-- STEP 11: Fix trade_orders status constraint
-- (add 'cancelled' and 'paid' to allowed statuses)
-- ============================================================

ALTER TABLE public.trade_orders DROP CONSTRAINT IF EXISTS trade_orders_status_check;
ALTER TABLE public.trade_orders ADD CONSTRAINT trade_orders_status_check
  CHECK (status = ANY (ARRAY['pending', 'approved', 'declined', 'cancelled', 'paid']));

-- ============================================================
-- STEP 12: Verify RLS is enabled on all tables
-- ============================================================

SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'stock_items', 'stock_requests',
    'stock_dispatches', 'studio_assignments', 'todos', 'trade_orders'
  )
ORDER BY tablename;

-- ============================================================
-- NOTES:
-- • The Stripe webhook (api/webhook.js) uses SUPABASE_SERVICE_ROLE_KEY
--   which bypasses RLS — this is intentional and correct.
-- • The hub (hub.html) uses the anon key + user JWT — RLS enforces
--   that each user only sees their own data.
-- • The todos table policy assumes columns 'assigned_to' and 'created_by'.
--   If your todos table uses different column names, adjust STEP 9.
-- • The stock_dispatches policy assumes a 'request_id' column.
--   Adjust if your schema differs.
-- ============================================================
