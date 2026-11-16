'use client'
import { useEffect, useState } from 'react'

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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/admin/orders')
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setOrders(d.orders || [])
    } catch (e) { setError(String(e)) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function fmt(n: number) {
    return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function fmtDate(s: string) {
    return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filtered = orders.filter(o => {
    if (!search) return true
    const q = search.toLowerCase()
    return o.name?.toLowerCase().includes(q) ||
      o.customer?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q)
  })

  return (
    <>
      <div className="adm-head">
        <h1>Orders</h1>
        <button onClick={load} className="adm-btn ghost" style={{ fontSize: 12 }}>↻ Refresh</button>
      </div>

      {error && (
        <div style={{ background: '#fde8e8', border: '1px solid #f5c2c2', borderRadius: 12, padding: '14px 18px', color: '#c0392b', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="adm-filters">
        <input
          placeholder="Search orders, customers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 260 }}
        />
        <span style={{ fontSize: 12, color: '#22382c66', marginLeft: 4 }}>
          {filtered.length} order{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="adm-table-wrap">
        {loading ? (
          <div className="adm-loading">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty">No orders found.</div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const fin = (o.financial || '').toLowerCase()
                const ful = (o.fulfillment || '').toLowerCase()
                const finCls = fin === 'paid' ? 'paid' : fin === 'refunded' ? 'refunded' : 'pending'
                const fulCls = ful === 'fulfilled' ? 'fulfilled' : 'unfulfilled'
                return (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 500 }}>{o.name}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{o.customer || 'Guest'}</div>
                      {o.email && <div style={{ fontSize: 11, color: '#22382c66' }}>{o.email}</div>}
                    </td>
                    <td>{o.items}</td>
                    <td style={{ fontWeight: 500 }}>{fmt(o.total)}</td>
                    <td><span className={`adm-badge ${finCls}`}>{o.financial || 'pending'}</span></td>
                    <td><span className={`adm-badge ${fulCls}`}>{o.fulfillment || 'unfulfilled'}</span></td>
                    <td style={{ color: '#22382c99', fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(o.created)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
