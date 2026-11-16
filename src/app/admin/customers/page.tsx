'use client'
import { useEffect, useState } from 'react'

interface Customer {
  id: number
  email: string
  name: string
  ordersCount: number
  totalSpent: number
  created: string
  acceptsMarketing: boolean
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/customers').then(r => r.json()).then(d => {
      setCustomers(d.customers || [])
      setLoading(false)
    })
  }, [])

  const filtered = customers.filter(c => {
    if (search) {
      const q = search.toLowerCase()
      if (!c.email?.toLowerCase().includes(q) && !c.name?.toLowerCase().includes(q)) return false
    }
    if (filter === 'marketing') return c.acceptsMarketing
    if (filter === 'repeat') return c.ordersCount > 1
    return true
  })

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const totalSpentAll = customers.reduce((s, c) => s + c.totalSpent, 0)
  const marketingCount = customers.filter(c => c.acceptsMarketing).length

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Customers</h1>
          <small>{filtered.length} of {customers.length} customers</small>
        </div>
      </div>

      <div className="adm-stats" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
        <div className="adm-stat">
          <b>{customers.length}</b>
          <span>Total customers</span>
        </div>
        <div className="adm-stat lime">
          <b>{marketingCount}</b>
          <span>Marketing subscribers</span>
        </div>
        <div className="adm-stat red">
          <b>£{totalSpentAll.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
          <span>Total lifetime revenue</span>
        </div>
      </div>

      <div className="adm-filters">
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All customers</option>
          <option value="marketing">Marketing subscribers</option>
          <option value="repeat">Repeat buyers</option>
        </select>
      </div>

      {loading ? (
        <div className="adm-loading">Loading customers…</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Orders</th>
                <th>Total spent</th>
                <th>Marketing</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="adm-empty">No customers found</div></td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ color: '#fff', fontWeight: 500 }}>{c.name || 'Guest'}</td>
                  <td className="adm-muted">{c.email}</td>
                  <td className="adm-muted">{fmtDate(c.created)}</td>
                  <td style={{ color: c.ordersCount > 1 ? '#C8FF00' : '#ccc' }}>{c.ordersCount}</td>
                  <td style={{ color: '#C8FF00', fontWeight: 600 }}>£{c.totalSpent.toFixed(2)}</td>
                  <td>
                    {c.acceptsMarketing
                      ? <span className="adm-badge active">Subscribed</span>
                      : <span className="adm-badge archived">No</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
