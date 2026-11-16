'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Page {
  id: number
  title: string
  handle: string
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  preview: string
  // detail
  body_html?: string
  seo_title?: string
  seo_description?: string
  seo_title_id?: number
  seo_desc_id?: number
}

export default function PagesAdmin() {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Page | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'preview'>('content')
  const [confirmDelete, setConfirmDelete] = useState<Page | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('kong_admin_auth') !== '1') {
      router.push('/admin/login'); return
    }
    fetchData()
  }, [router])

  async function fetchData() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/pages')
      const d = await r.json()
      if (d.error) setError(d.error)
      else setPages(d.pages || [])
    } catch { setError('Failed to load pages') }
    finally { setLoading(false) }
  }

  async function openEdit(p: Page) {
    setIsNew(false)
    setActiveTab('content')
    setSaveMsg('')
    setEditing({ ...p })
    setLoadingDetail(true)
    try {
      const r = await fetch(`/api/admin/pages?id=${p.id}`)
      const d = await r.json()
      if (d.page) setEditing(d.page)
    } catch {}
    finally { setLoadingDetail(false) }
  }

  function openNew() {
    setIsNew(true)
    setActiveTab('content')
    setSaveMsg('')
    setEditing({ id: 0, title: '', handle: '', published: true, published_at: null, created_at: '', updated_at: '', preview: '', body_html: '', seo_title: '', seo_description: '' })
    setLoadingDetail(false)
  }

  async function save() {
    if (!editing) return
    setSaving(true); setSaveMsg('')
    try {
      const r = await fetch('/api/admin/pages', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, title: editing.title, body_html: editing.body_html, published: editing.published, seo_title: editing.seo_title, seo_description: editing.seo_description, seo_title_id: editing.seo_title_id, seo_desc_id: editing.seo_desc_id }),
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

  async function deletePage(p: Page) {
    try {
      const r = await fetch('/api/admin/pages', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id }) })
      const d = await r.json()
      if (d.success) { setPages(prev => prev.filter(x => x.id !== p.id)); setConfirmDelete(null); if (editing?.id === p.id) setEditing(null) }
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#111', borderBottom: '1px solid #222', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Website Pages</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Edit About, FAQ, Policies and other pages</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={openNew} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}>+ New Page</button>
      </div>

      <div style={{ padding: 24 }}>
        {error && <div style={{ background: '#7f1d1d', border: '1px solid #991b1b', borderRadius: 8, padding: 12, marginBottom: 16, color: '#fca5a5' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#666', padding: 60 }}>Loading pages...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pages.map(p => (
              <div key={p.id} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, background: '#1a1a1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span>/{p.handle}</span>
                    <span style={{ color: p.published ? '#4ade80' : '#f59e0b' }}>● {p.published ? 'Published' : 'Hidden'}</span>
                    {p.updated_at && <span>Updated {new Date(p.updated_at).toLocaleDateString()}</span>}
                  </div>
                  {p.preview && <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>{p.preview}...</div>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <a href={`https://kongtattoocareglobal.com/pages/${p.handle}`} target="_blank" rel="noreferrer"
                    style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: 6, padding: '6px 10px', fontSize: 12, textDecoration: 'none' }}>View ↗</a>
                  <button onClick={() => setConfirmDelete(p)} style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                  <button onClick={() => openEdit(p)} style={{ background: '#7c3aed', border: 'none', color: '#fff', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Edit</button>
                </div>
              </div>
            ))}
            {pages.length === 0 && !loading && <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>No pages found</div>}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, width: '100%', maxWidth: 760, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{isNew ? 'New Page' : `Edit: ${editing.title}`}</div>
                {!isNew && <div style={{ fontSize: 12, color: '#666' }}>/{editing.handle}</div>}
              </div>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>

            {loadingDetail ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', padding: 40 }}>Loading...</div>
            ) : (
              <>
                <div style={{ display: 'flex', borderBottom: '1px solid #222' }}>
                  {(['content', 'seo', 'preview'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px', fontSize: 13,
                        color: activeTab === tab ? '#7c3aed' : '#666',
                        borderBottom: activeTab === tab ? '2px solid #7c3aed' : '2px solid transparent',
                        fontWeight: activeTab === tab ? 600 : 400, textTransform: 'capitalize' }}>
                      {tab}
                    </button>
                  ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                  {activeTab === 'content' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Page Title</label>
                        <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 15, fontWeight: 600, outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Visibility</label>
                        <select value={editing.published ? 'visible' : 'hidden'} onChange={e => setEditing({ ...editing, published: e.target.value === 'visible' })}
                          style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}>
                          <option value="visible">Visible (Published)</option>
                          <option value="hidden">Hidden (Draft)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Page Content <span style={{ color: '#555' }}>(HTML)</span></label>
                        <textarea value={editing.body_html || ''} onChange={e => setEditing({ ...editing, body_html: e.target.value })}
                          rows={16} placeholder="Enter page content... You can use HTML."
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '12px', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6 }} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'seo' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>
                          SEO Title <span style={{ marginLeft: 8, fontSize: 12, color: (editing.seo_title?.length || 0) > 60 ? '#ef4444' : '#666' }}>{editing.seo_title?.length || 0}/60</span>
                        </label>
                        <input value={editing.seo_title || ''} onChange={e => setEditing({ ...editing, seo_title: e.target.value })}
                          placeholder={editing.title} maxLength={80}
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>
                          Meta Description <span style={{ marginLeft: 8, fontSize: 12, color: (editing.seo_description?.length || 0) > 160 ? '#ef4444' : '#666' }}>{editing.seo_description?.length || 0}/160</span>
                        </label>
                        <textarea value={editing.seo_description || ''} onChange={e => setEditing({ ...editing, seo_description: e.target.value })}
                          rows={4} maxLength={200}
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical' }} />
                      </div>
                      <div style={{ background: '#fff', borderRadius: 8, padding: '14px 16px' }}>
                        <div style={{ fontSize: 18, color: '#1a0dab', marginBottom: 2 }}>{editing.seo_title || editing.title || 'Page Title'}</div>
                        <div style={{ fontSize: 13, color: '#006621', marginBottom: 4 }}>https://kongtattoocareglobal.com/pages/{editing.handle}</div>
                        <div style={{ fontSize: 13, color: '#545454' }}>{editing.seo_description || 'No meta description'}</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'preview' && (
                    <div>
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Content preview:</div>
                      <div style={{ background: '#fff', borderRadius: 8, padding: 24, minHeight: 200 }}>
                        <h1 style={{ marginTop: 0, fontSize: 24, color: '#111' }}>{editing.title}</h1>
                        <div style={{ color: '#333', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: editing.body_html || '<p style="color:#999">No content yet</p>' }} />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #222', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {saveMsg && <span style={{ fontSize: 13, color: saveMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>{saveMsg}</span>}
                  <div style={{ flex: 1 }} />
                  <button onClick={() => setEditing(null)} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={save} disabled={saving}
                    style={{ background: saving ? '#5b21b6' : '#7c3aed', border: 'none', color: '#fff', borderRadius: 8, padding: '10px 24px', fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                    {saving ? 'Saving...' : (isNew ? 'Create Page' : 'Save Changes')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: 12, padding: 28, maxWidth: 400, width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Delete Page?</div>
            <div style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>"{confirmDelete.title}" will be permanently deleted.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: 8, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => deletePage(confirmDelete)} style={{ background: '#dc2626', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
