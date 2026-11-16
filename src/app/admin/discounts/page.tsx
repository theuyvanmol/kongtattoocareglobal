'use client'
import { useEffect, useState } from 'react'

interface Discount {
  id: number
  title: string
  code: string
  status: string
  value_type: string
  value: string
  usage_count: number
  usage_limit: number | null
  starts_at: string
  ends_at: string | null
}

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', code: '', type: 'percentage', value: '', limit: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const d = await fetch('/api/admin/discounts').then(r => r.json())
    setDiscounts(d.discounts || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function create() {
    setSaving(true)
    const r = await fetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    setSaving(false)
    if (d.error) { setError(d.error); return }
    setModal(false)
    setForm({ title: '', code: '', type: 'percentage', value: '', limit: '' })
    load()
  }

  async function del(id: number) {
    if (!confirm('Delete this discount?')) return
    await fetch('/api/admin/discounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Discount codes</h1>
          <small>{discounts.length} codes</small>
        </div>
        <button className="adm-btn" onClick={() => setModal(true)}>+ Create discount</button>
      </div>

      {loading ? (
        <div className="adm-loading">Loading discounts…</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Discount</th>
                <th>Used</th>
                <th>Limit</th>
                <th>Expires</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {discounts.length === 0 ? (
                <tr><td colSpan={7}><div className="adm-empty">No discount codes yet</div></td></tr>
              ) : discounts.map(d => (
                <tr key={d.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', background: '#1a1a1a', padding: '3px 8px', borderRadius: 5, color: '#C8FF00', fontSize: 12, letterSpacing: 1 }}>
                      {d.code}
                    </span>
                  </td>
                  <td style={{ color: '#ccc' }}>{d.title}</td>
                  <td style={{ color: '#fff', fontWeight: 600 }}>
                    {d.value_type === 'percentage' ? `${d.value}%` : `£${d.value}`} off
                  </td>
                  <td className="adm-muted">{d.usage_count}</td>
                  <td className="adm-muted">{d.usage_limit || '∞'}</td>
                  <td className="adm-muted">{fmtDate(d.ends_at)}</td>
                  <td>
                    <button className="adm-btn ghost" style={{ padding: '5px 10px', fontSize: 11, color: '#E61E32', borderColor: '#E61E3240' }} onClick={() => del(d.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="adm-modal-bg" onClick={() => setModal(false)}>
          <div className="adm-modal adm-form" onClick={e => e.stopPropagation()}>
            <h2>Create discount code</h2>
            {error && <div className="adm-error">{error}</div>}
            <div className="adm-form-row">
              <div>
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Summer Sale 2024" />
              </div>
            </div>
            <div className="adm-form-row">
              <div>
                <label>Code</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
              </div>
            </div>
            <div className="adm-form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed amount</option>
                </select>
              </div>
              <div>
                <label>Value {form.type === 'percentage' ? '(%)' : '(£)'}</label>
                <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'percentage' ? '10' : '5'} />
              </div>
            </div>
            <div className="adm-form-row">
              <div>
                <label>Usage limit (blank = unlimited)</label>
                <input type="number" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} placeholder="Leave blank for unlimited" />
              </div>
            </div>
            <div className="adm-row" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="adm-btn ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="adm-btn" onClick={create} disabled={saving || !form.title || !form.code || !form.value}>{saving ? 'Creating…' : 'Create discount'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
