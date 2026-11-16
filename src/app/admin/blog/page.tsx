'use client'
import { useEffect, useState } from 'react'

interface Article {
  id: number
  title: string
  author: string
  published_at: string
  status: string
  summary_html: string
}

export default function AdminBlog() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', author: '', body: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const d = await fetch('/api/admin/blog').then(r => r.json())
    setArticles(d.articles || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function publish() {
    setSaving(true)
    const r = await fetch('/api/admin/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    setSaving(false)
    if (d.error) { setError(d.error); return }
    setModal(false)
    setForm({ title: '', author: '', body: '' })
    load()
  }

  async function del(id: number) {
    if (!confirm('Delete this article?')) return
    await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Blog</h1>
          <small>{articles.length} articles</small>
        </div>
        <button className="adm-btn" onClick={() => setModal(true)}>+ New article</button>
      </div>

      {loading ? (
        <div className="adm-loading">Loading articles…</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Published</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr><td colSpan={5}><div className="adm-empty">No articles yet</div></td></tr>
              ) : articles.map(a => (
                <tr key={a.id}>
                  <td style={{ color: '#fff', fontWeight: 500 }}>{a.title}</td>
                  <td className="adm-muted">{a.author}</td>
                  <td className="adm-muted">{fmtDate(a.published_at)}</td>
                  <td><span className="adm-badge active">Published</span></td>
                  <td>
                    <button className="adm-btn ghost" style={{ padding: '5px 10px', fontSize: 11, color: '#E61E32', borderColor: '#E61E3240' }} onClick={() => del(a.id)}>Delete</button>
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
            <h2>New article</h2>
            {error && <div className="adm-error">{error}</div>}
            <div className="adm-form-row">
              <div>
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Article title…" />
              </div>
            </div>
            <div className="adm-form-row">
              <div>
                <label>Author</label>
                <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Kong Tattoo Care" />
              </div>
            </div>
            <div className="adm-form-row">
              <div>
                <label>Content (HTML)</label>
                <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="<p>Article content here...</p>" style={{ minHeight: 160 }} />
              </div>
            </div>
            <div className="adm-row" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="adm-btn ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="adm-btn" onClick={publish} disabled={saving || !form.title || !form.body}>{saving ? 'Publishing…' : 'Publish'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
