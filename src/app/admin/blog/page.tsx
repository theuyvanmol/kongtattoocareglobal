'use client'
import { useEffect, useState, FormEvent } from 'react'

interface Article {
  id: string
  title: string
  author: string
  published_at: string
  status: string
  blogId: string
  blogTitle: string
}

export default function AdminBlog() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('Kong Team')
  const [posting, setPosting] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/admin/blog')
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setArticles(d.articles || [])
    } catch (e) { setError(String(e)) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!title || !content) return
    setPosting(true)
    setFormError('')
    try {
      const r = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, author, published: true }),
      })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setTitle(''); setContent(''); setAuthor('Kong Team')
      setShowModal(false)
      load()
    } catch (e) { setFormError(String(e)) }
    setPosting(false)
  }

  async function handleDelete(blogId: string, articleId: string) {
    setDeleting(articleId)
    try {
      await fetch('/api/admin/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blogId, articleId }) })
      load()
    } catch (e) { setError(String(e)) }
    setDeleting(null)
  }

  return (
    <>
      <div className="adm-head">
        <h1>Blog</h1>
        <button onClick={() => setShowModal(true)} className="adm-btn">+ New post</button>
      </div>

      {error && (
        <div style={{ background: '#fde8e8', border: '1px solid #f5c2c2', borderRadius: 12, padding: '14px 18px', color: '#c0392b', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="adm-loading">Loading posts…</div>
      ) : articles.length === 0 ? (
        <div className="adm-card">
          <div className="adm-empty" style={{ padding: '32px 0' }}>No blog posts yet. Write your first one.</div>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Blog</th>
                <th>Author</th>
                <th>Published</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.title}</td>
                  <td style={{ color: '#22382c99', fontSize: 12 }}>{a.blogTitle}</td>
                  <td style={{ color: '#22382c99', fontSize: 13 }}>{a.author}</td>
                  <td style={{ color: '#22382c99', fontSize: 12 }}>
                    {a.published_at ? new Date(a.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : (
                      <span className="adm-badge pending">Draft</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(a.blogId, a.id)}
                      disabled={deleting === a.id}
                      className="adm-btn danger"
                      style={{ fontSize: 11, padding: '5px 12px' }}
                    >
                      {deleting === a.id ? '…' : 'Delete'}
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
            <h2>New blog post</h2>
            <form className="adm-form" onSubmit={handleCreate}>
              <div>
                <label>Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" required style={{ font: '400 18px/1.3 Cormorant Garamond,Georgia,serif' }} />
              </div>
              <div>
                <label>Author</label>
                <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" />
              </div>
              <div>
                <label>Content (HTML supported)</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="<p>Write your post here…</p>" required style={{ minHeight: 160, fontFamily: 'monospace', fontSize: 13 }} />
              </div>
              {formError && <div style={{ fontSize: 12, color: '#c0392b', background: '#fde8e8', padding: '10px 14px', borderRadius: 8 }}>{formError}</div>}
              <div className="adm-row" style={{ marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} className="adm-btn ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="adm-btn" style={{ flex: 2 }} disabled={posting}>
                  {posting ? 'Publishing…' : 'Publish post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
