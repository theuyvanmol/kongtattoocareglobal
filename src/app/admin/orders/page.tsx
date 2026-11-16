'use client'
import { useEffect, useState } from 'react'

interface Order {
  id: number
  name: string
  email: string
  phone: string
  total: string
  financial_status: string
  fulfillment_status: string
  created_at: string
  line_items: { title: string; quantity: number; price: string }[]
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filtered, setFiltered] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/orders').then(r => r.json()).then(d => {
      setOrders(d.orders || [])
      setFiltered(d.orders || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let list = orders
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(o => o.name.toLowerCase().includes(q) || (o.email || '').toLowerCase().includes(q))
    }
    if (status !== 'all') list = list.filter(o => o.financial_status === status || o.fulfillment_status === status)
    setFiltered(list)
  }, [search, status, orders])

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Orders</h1>
          <small>{filtered.length} of {orders.length} orders</small>
        </div>
      </div>

      <div className="adm-filters">
        <input
          placeholder="Search by order # or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="unfulfilled">Unfulfilled</option>
        </select>
      </div>

      {loading ? (
        <div className="adm-loading">Loading orders…</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="adm-empty">No orders found</div></td></tr>
              ) : filtered.map(o => (
                <>
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    <td style={{ color: '#fff', fontWeight: 600 }}>{o.name}</td>
                    <td>
                      <div style={{ color: '#ccc' }}>{o.email || '—'}</div>
                      {o.phone && <div className="adm-muted">{o.phone}</div>}
                    </td>
                    <td className="adm-muted">{fmtDate(o.created_at)}</td>
                    <td className="adm-muted">{(o.line_items || []).length} item{(o.line_items || []).length !== 1 ? 's' : ''}</td>
                    <td style={{ color: '#C8FF00', fontWeight: 600 }}>£{parseFloat(o.total || '0').toFixed(2)}</td>
                    <td><span className={`adm-badge ${o.financial_status}`}>{o.financial_status}</span></td>
                    <td><span className={`adm-badge ${o.fulfillment_status || 'unfulfilled'}`}>{o.fulfillment_status || 'unfulfilled'}</span></td>
                  </tr>
                  {expanded === o.id && (
                    <tr key={`${o.id}-exp`}>
                      <td colSpan={7} style={{ background: '#1a1a1a', padding: '12px 14px' }}>
                        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Line items</div>
                        {(o.line_items || []).map((li, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#ccc', padding: '4px 0', borderBottom: '1px solid #222' }}>
                            <span>{li.title}</span>
                            <span style={{ color: '#666' }}>×{li.quantity} · £{parseFloat(li.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
