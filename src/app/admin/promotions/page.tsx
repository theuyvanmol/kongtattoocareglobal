'use client'
import { useState, useEffect } from 'react'

type Promotion = {
  id: string
  type: 'promotion' | 'event'
  category: string
  title: string
  subtitle?: string
  startDate: string
  endDate: string
  active: boolean
  createdAt?: string
}

function statusFor(p: Promotion): 'coming_soon' | 'live' | 'ended' | 'off' {
  if (!p.active) return 'off'
  const now = Date.now()
  const start = new Date(p.startDate).getTime()
  const end = new Date(p.endDate).getTime()
  if (now < start) return 'coming_soon'
  if (now >= start && now <= end) return 'live'
  return 'ended'
}

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')
}

const BLANK: Partial<Promotion> = {
  type: 'promotion',
  category: '',
  title: '',
  subtitle: '',
  startDate: '',
  endDate: '',
  active: true,
}

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [form, setForm] = useState<Partial<Promotion>>(BLANK)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const r = await fetch('/api/admin/promotions')
    const d = await r.json()
    setPromos(d.promotions || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm({ ...BLANK })
    setModal(true)
    setError('')
  }

  function openEdit(p: Promotion) {
    setEditing(p)
    setForm({ ...p })
    setModal(true)
    setError('')
  }

  async function save() {
    if (!form.title || !form.startDate || !form.endDate) {
      setError('Title, start date and end date are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await fetch('/api/admin/promotions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, promotion: form }),
        })
      } else {
        await fetch('/api/admin/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promotion: form }),
        })
      }
      setModal(false)
      load()
    } catch {
      setError('Failed to save.')
    }
    setSaving(false)
  }

  async function toggleActive(p: Promotion) {
    await fetch('/api/admin/promotions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, promotion: { active: !p.active } }),
    })
    load()
  }

  async function confirmDelete() {
    if (!deleteId) return
    await fetch('/api/admin/promotions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteId }),
    })
    setDeleteId(null)
    load()
  }

  const active = promos.filter(p => p.active && new Date(p.endDate).getTime() > Date.now())

  return (
    <div className="adm-content">
      <div className="adm-page-head">
        <div>
          <div className="adm-page-eyebrow">Homepage Band</div>
          <h1 className="adm-page-title">Promotions &amp; events</h1>
        </div>
        <button className="adm-btn" onClick={openCreate}>Add promotion or event +</button>
      </div>

      <div className="adm-info">
        Live promotions show in a full-width animated band under the homepage hero, with a countdown to the end date. Events can show early as &ldquo;coming soon&rdquo;. Everything appears and disappears on its dates automatically.
      </div>

      {active.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: 12 }}>On the homepage now</div>
          {active.map(p => {
            const st = statusFor(p)
            return (
              <div className="adm-promo-item" key={p.id}>
                <div className={`adm-promo-icon${p.type === 'event' ? ' event' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    {p.type === 'event'
                      ? <path d="M10 2v8l5 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                      : <path d="M4 10l4 4 8-8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>}
                  </svg>
                </div>
                <div className="adm-promo-body">
                  <div className="adm-promo-label">{p.type === 'event' ? 'Event' : 'Promotion'}{p.category ? ` · ${p.category}` : ''}</div>
                  <div className="adm-promo-title">{p.title}</div>
                  <div className="adm-promo-dates">{formatDate(p.startDate)} → {formatDate(p.endDate)}</div>
                </div>
                <div className="adm-promo-actions">
                  {st === 'coming_soon' && <span className="adm-coming-soon">Showing as &ldquo;coming soon&rdquo;</span>}
                  {st === 'live' && <span className="adm-live-badge">Live now</span>}
                  <button className="adm-btn secondary small" onClick={() => openEdit(p)}>Edit</button>
                  <button className="adm-btn secondary small" onClick={() => toggleActive(p)}>Switch off</button>
                </div>
              </div>
            )
          })}
        </>
      )}

      {promos.filter(p => !active.includes(p)).length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.8px', textTransform: 'uppercase', margin: '24px 0 12px' }}>Past &amp; inactive</div>
          {promos.filter(p => !active.includes(p)).map(p => (
            <div className="adm-promo-item" key={p.id} style={{ opacity: .6 }}>
              <div className="adm-promo-icon" style={{ background: '#ccc' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="adm-promo-body">
                <div className="adm-promo-label">{p.type === 'event' ? 'Event' : 'Promotion'}{p.category ? ` · ${p.category}` : ''}</div>
                <div className="adm-promo-title">{p.title}</div>
                <div className="adm-promo-dates">{formatDate(p.startDate)} → {formatDate(p.endDate)}</div>
              </div>
              <div className="adm-promo-actions">
                <span className="adm-badge inactive">Ended</span>
                <button className="adm-btn secondary small" onClick={() => openEdit(p)}>Edit</button>
                <button className="adm-btn danger small" onClick={() => setDeleteId(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </>
      )}

      {!loading && promos.length === 0 && (
        <div className="adm-empty">No promotions or events yet. Add one to show a band on the homepage.</div>
      )}
      {loading && <div className="adm-loading">Loading…</div>}

      {/* Create/Edit modal */}
      {modal && (
        <div className="adm-modal-bg" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="adm-modal">
            <button className="adm-modal-close" onClick={() => setModal(false)}>×</button>
            <h2>{editing ? 'Edit' : 'New'} promotion or event</h2>
            {error && <div className="adm-error">{error}</div>}
            <div className="adm-form-group">
              <label>Type</label>
              <select className="adm-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'promotion' | 'event' }))}>
                <option value="promotion">Promotion</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div className="adm-form-group">
              <label>Category <span style={{ fontWeight: 400, color: '#aaa' }}>(e.g. Black Friday, Summer Sale)</span></label>
              <input className="adm-input" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Black Friday" />
            </div>
            <div className="adm-form-group">
              <label>Title</label>
              <input className="adm-input" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="The Black Friday Sale" />
            </div>
            <div className="adm-form-group">
              <label>Subtitle <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span></label>
              <input className="adm-input" value={form.subtitle || ''} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Up to 30% off everything" />
            </div>
            <div className="adm-row">
              <div className="adm-form-group">
                <label>Start date & time</label>
                <input type="datetime-local" className="adm-input" value={form.startDate ? form.startDate.slice(0, 16) : ''} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="adm-form-group">
                <label>End date & time</label>
                <input type="datetime-local" className="adm-input" value={form.endDate ? form.endDate.slice(0, 16) : ''} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="adm-form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                Active (shows on homepage when dates match)
              </label>
            </div>
            <div className="adm-modal-foot">
              {editing && <button className="adm-btn danger" style={{ marginRight: 'auto' }} onClick={() => { setDeleteId(editing.id); setModal(false) }}>Delete</button>}
              <button className="adm-btn secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="adm-btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="adm-modal-bg">
          <div className="adm-modal" style={{ maxWidth: 420 }}>
            <h2>Delete this promotion?</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>This cannot be undone. It will be removed from the homepage band immediately.</p>
            <div className="adm-modal-foot">
              <button className="adm-btn secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="adm-btn danger" onClick={confirmDelete}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
