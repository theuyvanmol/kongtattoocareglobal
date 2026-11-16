'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Article {
  id: number
  blogId: number
  blogTitle: string
  title: string
  author: string
  tags: string
  published: boolean
  published_at: string | null
  summary: string
  image: string | null
  handle: string
  created_at: string
  updated_at: string
  // detail fields
  body_html?: string
  summary_html?: string
}

interface Blog { id: number; title: string }

export default function BlogsPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Article | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [search, setSearch] = useState('')
  const [filterBlog, setFilterBlog] = useState('all')
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [confirmDelete, setConfirmDelete] = useState<Article | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('kong_admin_auth') !== '1') {
      router.push('/admin/login'); return
    }
    fetchData()
  }, [router])

  async function fetchData() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/blogs')
      const d = await r.json()
      if (d.error) setError(d.error)
      else { setBlogs(d.blogs || []); setArticles(d.articles || []) }
    } catch { setError('Failed to load blogs') }
    finally { setLoading(false) }
  }

  async function openEdit(a: Article) {
    setIsNew(false)
    setActiveTab('write')
    setSaveMsg('')
    setEditing({ ...a })
    setLoadingDetail(true)
    try {
      const r = await fetch(`/api/admin/blogs?blogId=${a.blogId}&articleId=${a.id}`)
      const d = await r.json()
      if (d.article) setEditing(d.article)
    } catch {}
    finally { setLoadingDetail(false) }
  }

  function openNew() {
    if (blogs.length === 0) return
    setIsNew(true)
    setActiveTab('write')
    setSaveMsg('')
    setEditing({
      id: 0, blogId: blogs[0].id, blogTitle: blogs[0].title,
      title: '', author: 'Kong Tattoo Care', tags: '', published: true,
      published_at: null, summary: '', image: null, handle: '',
      created_at: '', updated_at: '', body_html: '', summary_html: '',
    })
    setLoadingDetail(false)
  }

  async function save() {
    if (!editing) return
    setSaving(true); setSaveMsg('')
    try {
      const payload = { blogId: editing.blogId, articleId: editing.id, title: editing.title, body_html: editing.body_html, summary_html: editing.summary_html, author: editing.author, tags: editing.tags, published: editing.published }
      const r = await fetch('/api/admin/blogs', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await r.json()
      if (d.success) {
        setSaveMsg('✓ Saved')
        await fetchData()
        setTimeout(() => { setSaveMsg(''); if (isNew) setEditing(null) }, 2000)
      } else { setSaveMsg('✗ ' + (d.error || 'Failed')) }
    } catch { setSaveMsg('✗ Network error') }
    finally { setSaving(false) }
  }

  async function deleteArticle(a: Article) {
    try {
      const r = await fetch('/api/admin/blogs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blogId: a.blogId, articleId: a.id }) })
      const d = await r.json()
      if (d.success) { setArticles(prev => prev.filter(x => x.id !== a.id)); setConfirmDelete(null); if (editing?.id === a.id) setEditing(null) }
    } catch {}
  }

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.author.toLowerCase().includes(search.toLowerCase())
    const matchBlog = filterBlog === 'all' || String(a.blogId) === filterBlog
    return matchSearch && matchBlog
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#111', borderBottom: '1px solid #222', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Blog Posts</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Create and manage blog content</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={openNew} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}>+ New Post</button>
      </div>

      <div style={{ padding: 24 }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Total Posts', value: articles.length },
            { label: 'Published', value: articles.filter(a => a.published).length },
            { label: 'Drafts', value: articles.filter(a => !a.published).length },
            { label: 'Blogs', value: blogs.length },
          ].map(s => (
            <div key={s.label} style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px 20px', flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <input
            type="text" placeholder="Search posts..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: '#111', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
          <select
            value={filterBlog} onChange={e => setFilterBlog(e.target.value)}
            style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }}
          >
            <option value="all">All Blogs</option>
            {blogs.map(b => <option key={b.id} value={String(b.id)}>{b.title}</option>)}
          </select>
        </div>

        {error && <div style={{ background: '#7f1d1d', border: '1px solid #991b1b', borderRadius: 8, padding: 12, marginBottom: 16, color: '#fca5a5' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#666', padding: 60 }}>Loading...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(a => (
              <div key={a.id} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {a.image && <img src={a.image} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span>{a.blogTitle}</span>
                    <span>by {a.author || 'Unknown'}</span>
                    <span style={{ color: a.published ? '#4ade80' : '#f59e0b' }}>● {a.published ? 'Published' : 'Draft'}</span>
                    {a.published_at && <span>{new Date(a.published_at).toLocaleDateString()}</span>}
                  </div>
                  {a.summary && <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>{a.summary}...</div>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setConfirmDelete(a)} style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                  <button onClick={() => openEdit(a)} style={{ background: '#7c3aed', border: 'none', color: '#fff', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Edit</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && !loading && <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>{search ? 'No matching posts' : 'No blog posts yet'}</div>}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, width: '100%', maxWidth: 760, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Modal header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{isNew ? 'New Blog Post' : 'Edit Post'}</div>
                {!isNew && <div style={{ fontSize: 12, color: '#666' }}>ID: {editing.id} · {editing.blogTitle}</div>}
              </div>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>

            {loadingDetail ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', padding: 40 }}>Loading...</div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Title */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Post Title</label>
                      <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                        placeholder="Enter post title..."
                        style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 16, fontWeight: 600, outline: 'none' }} />
                    </div>

                    {/* Blog + Author + Status row */}
                    <div style={{ display: 'flex', gap: 12 }}>
                      {isNew && (
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Blog</label>
                          <select value={editing.blogId} onChange={e => setEditing({ ...editing, blogId: parseInt(e.target.value) })}
                            style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}>
                            {blogs.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                          </select>
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Author</label>
                        <input value={editing.author || ''} onChange={e => setEditing({ ...editing, author: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Status</label>
                        <select value={editing.published ? 'published' : 'draft'} onChange={e => setEditing({ ...editing, published: e.target.value === 'published' })}
                          style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}>
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Tags <span style={{ color: '#555' }}>(comma separated)</span></label>
                      <input value={editing.tags || ''} onChange={e => setEditing({ ...editing, tags: e.target.value })}
                        placeholder="tattoo, aftercare, tips"
                        style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }} />
                    </div>

                    {/* Body */}
                    <div>
                      <div style={{ display: 'flex', gap: 0, marginBottom: 8 }}>
                        {(['write', 'preview'] as const).map(t => (
                          <button key={t} onClick={() => setActiveTab(t)}
                            style={{ background: activeTab === t ? '#1a1a1a' : 'none', border: '1px solid #333', color: activeTab === t ? '#fff' : '#666', padding: '6px 16px', fontSize: 13, cursor: 'pointer', borderRadius: t === 'write' ? '6px 0 0 6px' : '0 6px 6px 0' }}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                        <span style={{ flex: 1 }} />
                        <span style={{ fontSize: 12, color: '#555', alignSelf: 'center' }}>HTML supported</span>
                      </div>
                      {activeTab === 'write' ? (
                        <textarea value={editing.body_html || ''} onChange={e => setEditing({ ...editing, body_html: e.target.value })}
                          rows={12} placeholder="Write your post content here... You can use HTML tags."
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '12px', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6 }} />
                      ) : (
                        <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: 16, minHeight: 200, fontSize: 14, color: '#ccc', lineHeight: 1.7 }}
                          dangerouslySetInnerHTML={{ __html: editing.body_html || '<p style="color:#555">Nothing to preview yet...</p>' }} />
                      )}
                    </div>

                    {/* Excerpt/Summary */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Excerpt / Summary <span style={{ color: '#555' }}>(optional)</span></label>
                      <textarea value={editing.summary_html || ''} onChange={e => setEditing({ ...editing, summary_html: e.target.value })}
                        rows={3} placeholder="Short description shown in blog listing..."
                        style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', lineHeight: 1.5 }} />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #222', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {saveMsg && <span style={{ fontSize: 13, color: saveMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>{saveMsg}</span>}
                  <div style={{ flex: 1 }} />
                  {!isNew && (
                    <a href={`https://kongtattoocareglobal.com/blogs/${editing.handle}`} target="_blank" rel="noreferrer"
                      style={{ color: '#666', fontSize: 13, textDecoration: 'none' }}>View post ↗</a>
                  )}
                  <button onClick={() => setEditing(null)} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={save} disabled={saving}
                    style={{ background: saving ? '#5b21b6' : '#7c3aed', border: 'none', color: '#fff', borderRadius: 8, padding: '10px 24px', fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                    {saving ? 'Saving...' : (isNew ? 'Publish Post' : 'Save Changes')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: 12, padding: 28, maxWidth: 400, width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Delete Post?</div>
            <div style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>"{confirmDelete.title}" will be permanently deleted from Shopify.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: 8, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => deleteArticle(confirmDelete)} style={{ background: '#dc2626', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
