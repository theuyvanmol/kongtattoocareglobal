'use client'
import { useEffect, useState } from 'react'

interface Analytics {
  revenue30d: number
  revenue7d: number
  orders30d: number
  orders7d: number
  newCustomers30d: number
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
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

  // Sparkline SVG
  function Sparkline({ data }: { data: { date: string; revenue: number }[] }) {
    if (!data || data.length < 2) return null
    const vals = data.map(d => d.revenue)
    const max = Math.max(...vals, 1)
    const W = 200, H = 40, P = 2
    const pts = vals.map((v, i) => {
      const x = P + (i / (vals.length - 1)) * (W - 2 * P)
      const y = H - P - (v / max) * (H - 2 * P)
      return `${x},${y}`
    }).join(' ')
    return (
      <svg width={W} height={H} style={{ display: 'block', marginTop: 8 }}>
        <polyline fill="none" stroke="#E61E32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      </svg>
    )
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <small>Welcome back — here&apos;s what&apos;s happening</small>
        </div>
        <small style={{ color: '#444' }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</small>
      </div>

      {error && <div className="adm-error">{error}</div>}
      {loading ? (
        <div className="adm-loading">Loading dashboard…</div>
      ) : analytics ? (
        <>
          <div className="adm-stats">
            <div className="adm-stat red">
              <b>{fmt(analytics.revenue30d)}</b>
              <span>Revenue · 30 days</span>
            </div>
            <div className="adm-stat">
              <b>{analytics.orders30d}</b>
              <span>Orders · 30 days</span>
            </div>
            <div className="adm-stat lime">
              <b>{analytics.orders7d}</b>
              <span>Orders · 7 days</span>
            </div>
            <div className="adm-stat">
              <b>{analytics.newCustomers30d}</b>
              <span>New customers · 30d</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div className="adm-card">
              <div className="adm-card-title">Revenue trend · 14 days</div>
              <Sparkline data={analytics.dailyRevenue.slice(-14)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span className="adm-muted">{analytics.dailyRevenue.length > 0 ? fmtDate(analytics.dailyRevenue[analytics.dailyRevenue.length - 14]?.date || '') : ''}</span>
                <span className="adm-muted">{analytics.dailyRevenue.length > 0 ? fmtDate(analytics.dailyRevenue[analytics.dailyRevenue.length - 1]?.date || '') : 'Today'}</span>
              </div>
            </div>
            <div className="adm-card">
              <div className="adm-card-title">Quick links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="/admin/orders" className="adm-btn ghost" style={{ justifyContent: 'space-between' }}>View all orders <span>→</span></a>
                <a href="/admin/payments" className="adm-btn ghost" style={{ justifyContent: 'space-between' }}>Stripe payments <span>→</span></a>
                <a href="/admin/products" className="adm-btn ghost" style={{ justifyContent: 'space-between' }}>Manage products <span>→</span></a>
                <a href="/admin/enquiries" className="adm-btn ghost" style={{ justifyContent: 'space-between' }}>Enquiries <span>→</span></a>
              </div>
            </div>
          </div>
        </>
      ) : null}

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
      {orders.length > 0 && (
        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <a href="/admin/orders" className="adm-btn ghost">View all orders →</a>
        </div>
      )}
    </>
  )
}
