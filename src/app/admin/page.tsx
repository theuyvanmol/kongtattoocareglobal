'use client'
import { useEffect, useState } from 'react'

interface Analytics {
  revenue30d: number
  orders30d: number
  orders7d: number
  paidOrders30d: number
  newCustomers30d: number
  avgOrderValue: number
  dailyRevenue: { date: string; revenue: number }[]
}

interface Order {
  id: number
  name: string
  total: number
  financial: string
  fulfillment: string | null
  email: string
  customer: string
  created: string
  items: number
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
      if (!o.error) setOrders((o.orders || []).slice(0, 5))
      setLoading(false)
    }).catch(() => {
      setError('Failed to load data')
      setLoading(false)
    })
  }, [])

  function fmt(n: number) {
    return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function fmtDate(s: string) {
    return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function statusBadge(financial: string) {
    const f = (financial || '').toLowerCase()
    const cls = f === 'paid' ? 'paid' : f === 'refunded' ? 'refunded' : 'pending'
    return <span className={`adm-badge ${cls}`}>{financial || '—'}</span>
  }

  return (
    <>
      <div className="adm-head">
        <h1>Dashboard</h1>
        <span style={{ fontSize: 13, color: '#22382c99' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {loading ? (
        <div className="adm-loading">Loading…</div>
      ) : error ? (
        <div style={{ background: '#fde8e8', border: '1px solid #f5c2c2', borderRadius: 12, padding: '14px 18px', color: '#c0392b', fontSize: 13 }}>
          Error: {error}
        </div>
      ) : analytics ? (
        <>
          <div className="adm-stats">
            <div className="adm-stat">
              <b>{fmt(analytics.revenue30d)}</b>
              <span>Revenue · 30 days</span>
            </div>
            <div className="adm-stat">
              <b>{analytics.orders30d}</b>
              <span>Orders · 30 days</span>
            </div>
            <div className="adm-stat">
              <b>{analytics.orders7d}</b>
              <span>Orders · 7 days</span>
            </div>
            <div className="adm-stat">
              <b>{analytics.newCustomers30d}</b>
              <span>New customers · 30d</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
            <div className="adm-card">
              <div className="adm-card-title">Average order value</div>
              <div style={{ font: '400 28px/1 Cormorant Garamond,Georgia,serif', color: '#22382c' }}>{fmt(analytics.avgOrderValue)}</div>
            </div>
            <div className="adm-card">
              <div className="adm-card-title">Paid orders · 30 days</div>
              <div style={{ font: '400 28px/1 Cormorant Garamond,Georgia,serif', color: '#22382c' }}>{analytics.paidOrders30d}</div>
            </div>
          </div>

          {analytics.dailyRevenue.length > 0 && (
            <div className="adm-card" style={{ marginBottom: 28 }}>
              <div className="adm-card-title">Daily revenue · 14 days</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, paddingTop: 4 }}>
                {(() => {
                  const max = Math.max(...analytics.dailyRevenue.map(d => d.revenue), 1)
                  return analytics.dailyRevenue.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <div title={`${d.date}: ${fmt(d.revenue)}`} style={{ width: '100%', height: `${Math.max((d.revenue / max) * 52, d.revenue > 0 ? 4 : 2)}px`, background: d.revenue > 0 ? '#254936' : '#e0ddd4', borderRadius: 3 }} />
                    </div>
                  ))
                })()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#22382c66', marginTop: 4 }}>
                <span>{analytics.dailyRevenue[0]?.date?.slice(5)}</span>
                <span>{analytics.dailyRevenue[analytics.dailyRevenue.length - 1]?.date?.slice(5)}</span>
              </div>
            </div>
          )}
        </>
      ) : null}

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#22382c99', fontWeight: 500 }}>Recent orders</div>
        <a href="/admin/orders" className="adm-btn ghost" style={{ fontSize: 11, padding: '7px 14px' }}>View all</a>
      </div>
      <div className="adm-table-wrap">
        {orders.length === 0 ? (
          <div className="adm-empty">{loading ? 'Loading…' : 'No orders found.'}</div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 500 }}>{o.name}</td>
                  <td>{o.customer || o.email || 'Guest'}</td>
                  <td style={{ color: '#22382c99', fontSize: 12 }}>{fmtDate(o.created)}</td>
                  <td style={{ fontWeight: 500 }}>{fmt(o.total)}</td>
                  <td>{statusBadge(o.financial)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
