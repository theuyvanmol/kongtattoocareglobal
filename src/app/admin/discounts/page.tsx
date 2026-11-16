'use client'
import { useEffect, useState, FormEvent } from 'react'

interface Discount {
  id: string
  title: string
  value: string
  valueType: string
  usageCount: number
  usageLimit: number | null
  endsAt: string | null
  codes: { id: string; code: string; usageCount: number }[]
}

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState('percentage')
  const [value, setValue] = useState('')
  const [limit, setLimit] = useState('')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  // Delete confirm
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/admin/discounts')
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setDiscounts(d.discounts || [])
    } catch (e) { setError(String(e)) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!title || !code || !value) return
    setCreating(true)
    setFormError('')
    try {
      const r = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, code, discountType: type, value: parseFloat(value), usageLimit: limit ? parseInt(limit) : null }),
      })
      const d = await r.json()
      if (d.error) throw new Error(d.detail || d.error)
      setTitle(''); setCode(''); setValue(''); setLimit('')
      setShowModal(false)
      load()
    } catch (e) { setFormError(String(e)) }
    setCreating(false)
  }

  async function handleDelete(ruleId: string) {
    setDeleting(ruleId)
    try {
      await fetch('/api/admin/discounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ruleId }) })
      load()
    } catch (e) { setError(String(e)) }
    setDeleting(null)
  }

  return (
    <>
      <div className="adm-head">
        <h1>Discounts</h1>
        <button onClick={() => setShowModal(true)} className="adm-btn">+ New discount</button>
      </div>

      {error && (
        <div style={{ background: '#fde8e8', border: '1px solid #f5c2c2', borderRadius: 12, padding: '14px 18px', color: '#c0392b', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="adm-loading">Loading discounts…</div>
      ) : discounts.length === 0 ? (
        <div className="adm-card">
          <div className="adm-empty" style={{ padding: '32px 0' }}>No discounts yet. Create your first one.</div>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Code(s)</th>
                <th>Discount</th>
                <th>Uses</th>
                <th>Expires</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {discounts.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>{d.title}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {d.codes.map(c => (
                        <span key={c.id} style={{ fontFamily: 'monospace', fontSize: 12, background: '#f0ede6', padding: '2px 8px', borderRadius: 6 }}>
                          {c.code}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="adm-badge paid" style={{ background: '#e9f4ee', color: '#254936' }}>
                      {d.valueType === 'percentage' ? `${Math.abs(parseFloat(d.value))}% off` : `£${Math.abs(parseFloat(d.value))} off`}
                    </span>
                  </td>
                  <td style={{ color: '#22382c99', fontSize: 13 }}>
                    {d.usageCount}{d.usageLimit ? ` / ${d.usageLimit}` : ''}
                  </td>
                  <td style={{ color: '#22382c99', fontSize: 12 }}>
                    {d.endsAt ? new Date(d.endsAt).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(d.id)}
                      disabled={deleting === d.id}
                      className="adm-btn danger"
                      style={{ fontSize: 11, padding: '5px 12px' }}
                    >
                      {deleting === d.id ? '…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="adm-modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="adm-modal">
            <h2>New discount code</h2>
            <form className="adm-form" onSubmit={handleCreate}>
              <div>
                <label>Title (internal)</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer sale 20%" required />
              </div>
              <div>
                <label>Code</label>
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER20" required style={{ fontFamily: 'monospace', letterSpacing: 1 }} />
              </div>
              <div className="adm-row">
                <div style={{ flex: 1 }}>
                  <label>Type</label>
                  <select value={type} onChange={e => setType(e.target.value)}>
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed £</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Value</label>
                  <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder={type === 'percentage' ? '20' : '5.00'} required min="0" step="0.01" />
                </div>
              </div>
              <div>
                <label>Max uses (optional)</label>
                <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Leave blank for unlimited" min="1" />
              </div>
              {formError && <div style={{ fontSize: 12, color: '#c0392b', background: '#fde8e8', padding: '10px 14px', borderRadius: 8 }}>{formError}</div>}
              <div className="adm-row" style={{ marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} className="adm-btn ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="adm-btn" style={{ flex: 2 }} disabled={creating}>
                  {creating ? 'Creating…' : 'Create discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
