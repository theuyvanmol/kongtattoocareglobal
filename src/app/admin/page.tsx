'use client'
import { useState, useEffect, useCallback } from 'react'

// Admin dashboard — mirrors Replica Landscapes admin at replicalandscapes.vercel.app/admin
// Requires owner or admin role in Supabase profiles table

interface Order {
  id: string
  amount: number
  status: string
  customer: string
  email: string
  created: number
  items: number
}

interface DiscountCode {
  id: string
  code: string
  off: number
  active: boolean
  redemptions: number
}

interface Analytics {
  activeUsers: number
  sessions7d: number
  pageviews7d: number
  revenue30d: number
  orders30d: number
  dailyPageviews: Array<{ date: string; views: number }>
}

type Tab = 'overview' | 'orders' | 'discounts' | 'team'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [token, setToken] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [error, setError] = useState('')

  // ── Auth check ──────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // Get hub-auth tokens
        const r = await fetch('/api/hub-auth')
        const d = await r.json()
        if (!d.url) { setLoading(false); return }

        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(d.url, d.anon || d.anonKey)
        const { data: { session } } = await sb.auth.getSession()
        if (!session) { setLoading(false); return }

        const { data: profile } = await sb.from('profiles').select('role').eq('id', session.user.id).single()
        if (profile?.role === 'admin' || profile?.role === 'owner') {
          setToken(session.access_token)
          setAuthed(true)
          loadAll(session.access_token)
        }
      } catch {}
      setLoading(false)
    }
    init()
  }, [])

  const loadAll = useCallback(async (tok: string) => {
    const headers = { Authorization: `Bearer ${tok}` }
    try {
      const [oRes, dRes, aRes] = await Promise.all([
        fetch('/api/hub-stripe?type=orders', { headers }),
        fetch('/api/hub-stripe?type=discounts', { headers }),
        fetch('/api/hub-analytics', { headers }),
      ])
      const [oData, dData, aData] = await Promise.all([oRes.json(), dRes.json(), aRes.json()])
      if (oData.orders) setOrders(oData.orders)
      if (dData.coupons) setDiscounts(dData.coupons)
      if (aData.overview) {
        setAnalytics({
          activeUsers: aData.overview.activeUsers || 0,
          sessions7d: aData.overview.sessions || 0,
          pageviews7d: aData.overview.screenPageViews || 0,
          revenue30d: oData.revenue?.amount || 0,
          orders30d: oData.total || 0,
          dailyPageviews: aData.pageviews?.daily || [],
        })
      }
    } catch (e) {
      setError('Failed to load some data.')
    }
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="hed text-3xl animate-pulse" style={{ fontFamily: 'var(--font-barlow-condensed)', color: 'var(--fg-40)' }}>Loading…</div>
    </div>
  )

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="text-center px-6 max-w-sm">
        <span className="text-5xl block mb-4">🔒</span>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>Admin Access Required</h1>
        <p className="mb-6" style={{ color: 'var(--fg-70)' }}>This page requires admin or owner privileges.</p>
        <a href="/login" className="btn btn-red px-6 py-3">Sign In →</a>
      </div>
    </div>
  )

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'discounts', label: 'Discounts', icon: '🏷️' },
    { id: 'team', label: 'Team', icon: '👥' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--font-barlow), system-ui, sans-serif' }}>
      {/* Top nav */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3.5" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--rule)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-4">
          <span className="font-black text-lg" style={{ fontFamily: 'var(--font-barlow-condensed)', color: 'var(--red)' }}>KONG</span>
          <span className="text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(230,30,50,.12)', color: 'var(--red)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>ADMIN</span>
        </div>
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hidden sm:flex items-center gap-1.5"
              style={tab === t.id
                ? { background: 'var(--lime)', color: '#0a0a0a', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.08em' }
                : { color: 'var(--fg-70)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.08em' }}
            >
              <span>{t.icon}</span> {t.label.toUpperCase()}
            </button>
          ))}
        </div>
        <a href="/hub" className="text-xs" style={{ color: 'var(--fg-40)' }}>← Back to Hub</a>
      </div>

      {/* Mobile tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden" style={{ background: 'var(--bg)', borderTop: '1px solid var(--rule)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold" style={{ color: tab === t.id ? 'var(--lime)' : 'var(--fg-40)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>
            <span className="text-lg">{t.icon}</span>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ paddingTop: 60, paddingBottom: 80 }}>
        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="wrap-wide cap" style={{ paddingTop: 32, paddingBottom: 32 }}>
            <h1 className="hed text-5xl mb-8">Dashboard</h1>
            {analytics && (
              <>
                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Live Visitors', value: analytics.activeUsers, color: 'var(--lime)' },
                    { label: 'Sessions (7d)', value: analytics.sessions7d.toLocaleString(), color: 'var(--fg)' },
                    { label: 'Pageviews (7d)', value: analytics.pageviews7d.toLocaleString(), color: 'var(--fg)' },
                    { label: 'Orders (30d)', value: analytics.orders30d, color: 'var(--red)' },
                  ].map(kpi => (
                    <div key={kpi.label} className="p-5 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
                      <p className="text-xs mb-2" style={{ color: 'var(--fg-40)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.12em' }}>{kpi.label.toUpperCase()}</p>
                      <p className="text-3xl font-black" style={{ fontFamily: 'var(--font-barlow-condensed)', color: kpi.color }}>{kpi.value}</p>
                    </div>
                  ))}
                </div>
                {/* Revenue */}
                <div className="p-5 rounded-xl mb-8" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--fg-40)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.12em' }}>REVENUE (30 DAYS)</p>
                  <p className="text-4xl font-black" style={{ fontFamily: 'var(--font-barlow-condensed)', color: 'var(--lime)' }}>
                    £{analytics.revenue30d.toFixed(2)}
                  </p>
                </div>
              </>
            )}
            {error && <p className="text-sm mb-4 p-3 rounded-lg" style={{ background: 'rgba(230,30,50,.1)', color: 'var(--red)' }}>{error}</p>}
          </div>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="wrap-wide cap" style={{ paddingTop: 32 }}>
            <h1 className="hed text-5xl mb-8">Orders</h1>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--fg-40)' }}>No orders found. Check your Stripe connection.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--rule)' }}>
                <table className="w-full text-sm" style={{ background: 'var(--bg2)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--rule)' }}>
                      {['Order ID', 'Customer', 'Amount', 'Items', 'Status', 'Date'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs" style={{ color: 'var(--fg-40)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--rule)' }}>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-40)', fontFamily: 'monospace' }}>{o.id.slice(-8)}</td>
                        <td className="px-4 py-3">{o.customer || o.email}</td>
                        <td className="px-4 py-3 font-bold" style={{ color: 'var(--lime)', fontFamily: 'var(--font-barlow-condensed)' }}>£{o.amount.toFixed(2)}</td>
                        <td className="px-4 py-3">{o.items}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: o.status === 'paid' ? 'rgba(200,255,0,.15)' : 'rgba(240,240,240,.1)', color: o.status === 'paid' ? 'var(--lime)' : 'var(--fg-70)' }}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-40)' }}>{new Date(o.created * 1000).toLocaleDateString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Discounts tab */}
        {tab === 'discounts' && (
          <div className="wrap-wide cap" style={{ paddingTop: 32 }}>
            <h1 className="hed text-5xl mb-8">Discounts</h1>
            {discounts.length === 0 ? (
              <p style={{ color: 'var(--fg-40)' }}>No discount codes found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {discounts.map(d => (
                  <div key={d.id} className="p-5 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-lg font-black" style={{ fontFamily: 'var(--font-barlow-condensed)', color: 'var(--lime)' }}>{d.code}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: d.active ? 'rgba(200,255,0,.15)' : 'rgba(240,240,240,.1)', color: d.active ? 'var(--lime)' : 'var(--fg-40)' }}>
                        {d.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <p className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-barlow-condensed)', color: 'var(--red)' }}>{d.off}% OFF</p>
                    <p className="text-xs" style={{ color: 'var(--fg-40)' }}>{d.redemptions} redemptions</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team tab */}
        {tab === 'team' && (
          <div className="wrap-wide cap" style={{ paddingTop: 32 }}>
            <h1 className="hed text-5xl mb-8">Team</h1>
            <div className="p-6 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)', maxWidth: 480 }}>
              <h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 20 }}>Add Team Member</h2>
              <TeamForm token={token} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TeamForm({ token }: { token: string }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('artist')
  const [msg, setMsg] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('')
    try {
      const r = await fetch('/api/hub-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'add_team', email, role }),
      })
      const d = await r.json()
      setMsg(d.ok ? '✅ Team member added!' : `❌ ${d.error}`)
      if (d.ok) { setEmail(''); setRole('artist') }
    } catch { setMsg('❌ Failed to add team member') }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="artist@example.com"
        required
        className="h-11 rounded-xl px-4 text-sm outline-none"
        style={{ background: 'var(--bg3)', border: '1.5px solid var(--rule)', color: 'var(--fg)' }}
      />
      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        className="h-11 rounded-xl px-4 text-sm outline-none appearance-none"
        style={{ background: 'var(--bg3)', border: '1.5px solid var(--rule)', color: 'var(--fg)' }}
      >
        <option value="artist">Artist</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" className="btn btn-lime py-3">Add Team Member</button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  )
}
