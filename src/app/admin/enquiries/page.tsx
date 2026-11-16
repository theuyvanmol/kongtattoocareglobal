'use client'
import { useEffect, useState } from 'react'

interface Enquiry {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  read: boolean
  created_at: string
  subject?: string
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [note, setNote] = useState('')

  async function load() {
    const d = await fetch('/api/admin/enquiries').then(r => r.json())
    setEnquiries(d.enquiries || [])
    if (d.note) setNote(d.note)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function markRead(id: string, read: boolean) {
    await fetch('/api/admin/enquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read }),
    })
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, read } : e))
  }

  async function deleteEnquiry(id: string) {
    if (!confirm('Delete this enquiry?')) return
    await fetch('/api/admin/enquiries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setEnquiries(prev => prev.filter(e => e.id !== id))
  }

  const filtered = filter === 'unread' ? enquiries.filter(e => !e.read) : enquiries
  const unreadCount = enquiries.filter(e => !e.read).length
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Enquiries</h1>
          <small>{unreadCount} unread</small>
        </div>
      </div>

      {note && (
        <div className="adm-error" style={{ background: '#ff990015', borderColor: '#ff990040', color: '#ff9900' }}>
          {note} — Set up Supabase to receive enquiries from your contact forms.
        </div>
      )}

      <div className="adm-filters">
        <button className={`adm-btn ${filter === 'all' ? '' : 'ghost'}`} onClick={() => setFilter('all')}>All ({enquiries.length})</button>
        <button className={`adm-btn ${filter === 'unread' ? '' : 'ghost'}`} onClick={() => setFilter('unread')}>Unread ({unreadCount})</button>
      </div>

      {loading ? (
        <div className="adm-loading">Loading enquiries…</div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">No enquiries {filter === 'unread' ? 'unread' : 'yet'}</div>
      ) : (
        filtered.map(e => (
          <div key={e.id} className={`adm-enq-item ${!e.read ? 'unread' : ''}`}>
            <div className="adm-enq-head">
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: !e.read ? 700 : 500, fontSize: 14 }}>{e.name}</div>
                {e.subject && <div className="adm-muted">{e.subject}</div>}
              </div>
              {!e.read && <span className="adm-badge" style={{ background: '#E61E3220', color: '#E61E32', border: '1px solid #E61E3240', fontSize: 10 }}>NEW</span>}
              <span className="adm-muted">{fmtDate(e.created_at)}</span>
            </div>
            <div className="adm-enq-msg">{e.message}</div>
            <div className="adm-enq-foot">
              <a href={`mailto:${e.email}`}>{e.email}</a>
              {e.phone && <a href={`tel:${e.phone}`}>{e.phone}</a>}
              <span style={{ flex: 1 }} />
              {!e.read ? (
                <button className="adm-btn ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => markRead(e.id, true)}>Mark read</button>
              ) : (
                <button className="adm-btn ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => markRead(e.id, false)}>Mark unread</button>
              )}
              <a href={`mailto:${e.email}?subject=Re: ${encodeURIComponent(e.subject || 'Your enquiry')}`} className="adm-btn" style={{ padding: '4px 10px', fontSize: 11 }}>Reply</a>
              <button className="adm-btn ghost" style={{ padding: '4px 10px', fontSize: 11, color: '#E61E32', borderColor: '#E61E3240' }} onClick={() => deleteEnquiry(e.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </>
  )
}
