'use client'
import { useEffect, useState } from 'react'

interface Charge {
  id: string
  amount: number
  currency: string
  status: string
  description: string
  email: string
  name: string
  created: string
  refunded: boolean
  receipt_url: string
}

interface Balance {
  available: number
  pending: number
}

export default function AdminPayments() {
  const [charges, setCharges] = useState<Charge[]>([])
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/stripe').then(r => r.json()).then(d => {
      if (d.error) setError(d.error)
      else {
        setCharges(d.charges || [])
        setBalance(d.balance || null)
      }
      setLoading(false)
    }).catch(e => { setError(String(e)); setLoading(false) })
  }, [])

  const filtered = charges.filter(c =>
    !search || c.email?.toLowerCase().includes(search.toLowerCase()) || c.name?.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search)
  )

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Stripe Payments</h1>
          <small>Live payment data</small>
        </div>
        <a href="https://dashboard.stripe.com" target="_blank" rel="noopener" className="adm-btn ghost">
          Stripe Dashboard ↗
        </a>
      </div>

      {balance && (
        <div className="adm-stats" style={{ gridTemplateColumns: 'repeat(2,minmax(0,1fr))' }}>
          <div className="adm-stat lime">
            <b>{fmt(balance.available)}</b>
            <span>Available balance (GBP)</span>
          </div>
          <div className="adm-stat">
            <b>{fmt(balance.pending)}</b>
            <span>Pending balance (GBP)</span>
          </div>
        </div>
      )}

      {error && <div className="adm-error">{error}</div>}

      <div className="adm-filters">
        <input
          placeholder="Search by email, name or charge ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <span className="adm-muted">{filtered.length} charges</span>
      </div>

      {loading ? (
        <div className="adm-loading">Loading Stripe payments…</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Description</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="adm-empty">{error ? 'Failed to load' : 'No charges found'}</div></td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>{c.id.slice(0, 16)}…</td>
                  <td>
                    <div style={{ color: '#ccc' }}>{c.name || '—'}</div>
                    <div className="adm-muted">{c.email || ''}</div>
                  </td>
                  <td className="adm-muted">{fmtDate(c.created)}</td>
                  <td style={{ color: '#C8FF00', fontWeight: 600 }}>{fmt(c.amount)}</td>
                  <td><span className={`adm-badge ${c.refunded ? 'refunded' : c.status}`}>{c.refunded ? 'refunded' : c.status}</span></td>
                  <td className="adm-muted" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description || '—'}</td>
                  <td>
                    {c.receipt_url ? (
                      <a href={c.receipt_url} target="_blank" rel="noopener" className="adm-btn ghost" style={{ padding: '4px 10px', fontSize: 11 }}>View</a>
                    ) : '—'}
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
