'use client'
import { useEffect, useState } from 'react'

interface Analytics {
  totalOrders: number
  revenueAllTime: number
  revenue30d: number
  orders30d: number
  orders7d: number
  newCustomers30d: number
  avgOrderValue: number
  dailyRevenue: { date: string; revenue: number }[]
}

interface Order {
  id: number
  name: string
  email: string
  total: string
  status: string
  financial_status: string
  created_at: string
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics').then(r => r.json()),
      fetch('/api/admin/orders').then(r => r.json()),
    ]).then(([a, o]) => {
      if (a.error) setError(a.error)
      else setAnalytics(a)
      setOrders((o.orders || []).slice(0, 6))
      setLoading(false)
    }).catch(e => { setError(String(e)); setLoading(false) })
  }, [])

  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  function Sparkline({ data }: { data: { date: string; revenue: number }[] }) {
    if (!data || data.length < 2) return null
    const vals = data.map(d => d.revenue)
    const max = Math.max(...vals, 1)
    const W = 300, H = 50, P = 2
    const pts = vals.map((v, i) => {
      const x = P + (i / (vals.length - 1)) * (W - 2 * P)
      const y = H - P - (v / max) * (H - 2 * P)
      return `${x},${y}`
    }).join(' ')
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', marginTop: 10 }}>
        <polyline fill="none" stroke="#E61E32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      </svg>
    )
  }

  return (
    <>
      <style>{`
        .dash-wrap{max-width:900px;margin:0 auto}
        .dash-grid6{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
        .dash-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
        @media(max-width:700px){.dash-grid6{grid-template-columns:1fr 1fr}.dash-grid2{grid-template-columns:1fr}}
      `}</style>

      <div className="dash-wrap">
        <div className="adm-head" style={{ textAlign: 'center', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <h1>Dashboard</h1>
          <small>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</small>
        </div>

        {error && <div className="adm-error">{error}</div>}

        {loading ? (
          <div className="adm-loading">Loading Shopify data…</div>
        ) : analytics ? (
          <>
            {/* Row 1 — all-time + avg */}
            <div className="dash-grid6">
              <div className="adm-stat red" style={{ textAlign: 'center' }}>
                <b>{analytics.totalOrders}</b>
                <span>Total orders (all time)</span>
              </div>
              <div className="adm-stat lime" style={{ textAlign: 'center' }}>
                <b>{fmt(analytics.revenueAllTime)}</b>
                <span>Total revenue (all time)</span>
              </div>
              <div className="adm-stat" style={{ textAlign: 'center' }}>
                <b>{fmt(analytics.avgOrderValue)}</b>
                <span>Avg order value</span>
              </div>
            </div>

            {/* Row 2 — recent */}
            <div className="dash-grid6">
              <div className="adm-stat" style={{ textAlign: 'center' }}>
                <b>{analytics.orders30d}</b>
                <span>Orders · last 30 days</span>
              </div>
              <div className="adm-stat" style={{ textAlign: 'center' }}>
                <b>{analytics.orders7d}</b>
                <span>Orders · last 7 days</span>
              </div>
              <div className="adm-stat" style={{ textAlign: 'center' }}>
                <b>{analytics.newCustomers30d}</b>
                <span>New customers · 30d</span>
              </div>
            </div>

            {/* Charts row */}
            <div className="dash-grid2">
              <div className="adm-card" style={{ textAlign: 'center' }}>
                <div className="adm-card-title">Revenue · last 14 days</div>
                <Sparkline data={analytics.dailyRevenue} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span className="adm-muted">{analytics.dailyRevenue[0]?.date}</span>
                  <span className="adm-muted">Today</span>
                </div>
              </div>
              <div className="adm-card">
                <div className="adm-card-title" style={{ textAlign: 'center' }}>Quick links</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href="/admin/orders" className="adm-btn ghost" style={{ justifyContent: 'space-between' }}>All orders <span>→</span></a>
                  <a href="/admin/payments" className="adm-btn ghost" style={{ justifyContent: 'space-between' }}>Stripe payments <span>→</span></a>
                  <a href="/admin/products" className="adm-btn ghost" style={{ justifyContent: 'space-between' }}>Products <span>→</span></a>
                  <a href="/admin/customers" className="adm-btn ghost" style={{ justifyContent: 'space-between' }}>Customers <span>→</span></a>
                  <a href="/admin/enquiries" className="adm-btn ghost" style={{ justifyContent: 'space-between' }}>Enquiries <span>→</span></a>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Recent orders */}
        <div className="adm-card-title" style={{ marginBottom: 10 }}>Recent orders</div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6}><div className="adm-empty">No orders found</div></td></tr>
              ) : orders.map(o => (
                <tr key={o.id}>
                  <td style={{ color: '#fff', fontWeight: 600 }}>{o.name}</td>
                  <td>{o.email || '—'}</td>
                  <td className="adm-muted">{fmtDate(o.created_at)}</td>
                  <td style={{ color: '#C8FF00', fontWeight: 600 }}>£{parseFloat(o.total || '0').toFixed(2)}</td>
                  <td><span className={`adm-badge ${o.financial_status}`}>{o.financial_status}</span></td>
                  <td><span className={`adm-badge ${o.status}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <a href="/admin/orders" className="adm-btn ghost">View all orders →</a>
        </div>
      </div>
    </>
  )
}
