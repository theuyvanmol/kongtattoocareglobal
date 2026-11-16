'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: number
  title: string
  status: string
  price: number
  inventory: number
  image: string | null
  type: string
  tags: string
  updated: string
  variantCount: number
  // Full detail fields (loaded on edit)
  body_html?: string
  variantId?: number
  seo_title?: string
  seo_description?: string
  seo_title_metafield_id?: number
  seo_desc_metafield_id?: number
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'seo'>('details')

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('kong_admin_auth') !== '1') {
      router.push('/admin/login')
      return
    }
    fetchProducts()
  }, [router])

  async function fetchProducts() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/products')
      const d = await r.json()
      if (d.error) setError(d.error)
      else setProducts(d.products || [])
    } catch {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  async function openEdit(p: Product) {
    setLoadingDetail(true)
    setEditing({ ...p })
    setActiveTab('details')
    setSaveMsg('')
    try {
      const r = await fetch(`/api/admin/products?id=${p.id}`)
      const d = await r.json()
      if (d.product) setEditing(d.product)
    } catch {
      // Keep basic data if detail fetch fails
    } finally {
      setLoadingDetail(false)
    }
  }

  async function saveProduct() {
    if (!editing) return
    setSaving(true)
    setSaveMsg('')
    try {
      const r = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing.id,
          title: editing.title,
          status: editing.status,
          price: editing.price,
          body_html: editing.body_html,
          tags: editing.tags,
          seo_title: editing.seo_title,
          seo_description: editing.seo_description,
          seo_title_metafield_id: editing.seo_title_metafield_id,
          seo_desc_metafield_id: editing.seo_desc_metafield_id,
        }),
      })
      const d = await r.json()
      if (d.success) {
        setSaveMsg('✓ Saved successfully')
        // Update in list
        setProducts(prev => prev.map(p =>
          p.id === editing.id ? { ...p, title: editing.title, status: editing.status, price: editing.price, tags: editing.tags } : p
        ))
        setTimeout(() => setSaveMsg(''), 3000)
      } else {
        setSaveMsg('✗ ' + (d.error || 'Save failed'))
      }
    } catch {
      setSaveMsg('✗ Network error')
    } finally {
      setSaving(false)
    }
  }

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.type || '').toLowerCase().includes(search.toLowerCase())
  )

  const statusColor = (s: string) => {
    if (s === 'active') return '#16a34a'
    if (s === 'draft') return '#d97706'
    return '#6b7280'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#111', borderBottom: '1px solid #222', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Products</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Manage your Shopify store products</p>
        </div>
        <div style={{ flex: 1 }} />
        <a
          href="https://admin.shopify.com/store/kongtattoocareglobal/products/new"
          target="_blank"
          rel="noreferrer"
          style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          + Add Product
        </a>
      </div>

      <div style={{ padding: 24 }}>
        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Total', value: products.length },
            { label: 'Active', value: products.filter(p => p.status === 'active').length },
            { label: 'Draft', value: products.filter(p => p.status === 'draft').length },
            { label: 'Archived', value: products.filter(p => p.status === 'archived').length },
          ].map(s => (
            <div key={s.label} style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px 20px', flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }}
          />
        </div>

        {error && <div style={{ background: '#7f1d1d', border: '1px solid #991b1b', borderRadius: 8, padding: 12, marginBottom: 16, color: '#fca5a5' }}>{error}</div>}

        {/* Product list */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#666', padding: 60 }}>Loading products...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(p => (
              <div key={p.id} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                {p.image ? (
                  <img src={p.image} alt={p.title} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: 8, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📦</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#aaa' }}>£{p.price.toFixed(2)}</span>
                    <span style={{ fontSize: 12, color: '#666' }}>Stock: {p.inventory}</span>
                    {p.type && <span style={{ fontSize: 12, color: '#666' }}>{p.type}</span>}
                    <span style={{ fontSize: 11, color: statusColor(p.status), background: statusColor(p.status) + '22', borderRadius: 4, padding: '1px 6px' }}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <a
                    href={`https://admin.shopify.com/store/kongtattoocareglobal/products/${p.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: 6, padding: '6px 10px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  >
                    Shopify ↗
                  </a>
                  <button
                    onClick={() => openEdit(p)}
                    style={{ background: '#7c3aed', border: 'none', color: '#fff', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && !loading && (
              <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>No products found</div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: 12 }}>
              {editing.image && (
                <img src={editing.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editing.title}</div>
                <div style={{ fontSize: 12, color: '#666' }}>ID: {editing.id}</div>
              </div>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 4 }}>×</button>
            </div>

            {loadingDetail ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', padding: 40 }}>
                Loading product details...
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #222' }}>
                  {(['details', 'seo'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '12px 24px', fontSize: 14,
                        color: activeTab === tab ? '#7c3aed' : '#666',
                        borderBottom: activeTab === tab ? '2px solid #7c3aed' : '2px solid transparent',
                        fontWeight: activeTab === tab ? 600 : 400,
                        textTransform: 'capitalize',
                      }}
                    >
                      {tab === 'details' ? 'Product Details' : 'SEO & Search'}
                    </button>
                  ))}
                </div>

                {/* Modal body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                  {activeTab === 'details' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      {/* Title */}
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Product Title</label>
                        <input
                          value={editing.title}
                          onChange={e => setEditing({ ...editing, title: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
                        />
                      </div>

                      {/* Price + Status row */}
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Price (£)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editing.price}
                            onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Status</label>
                          <select
                            value={editing.status}
                            onChange={e => setEditing({ ...editing, status: e.target.value })}
                            style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
                          >
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Tags <span style={{ color: '#555' }}>(comma separated)</span></label>
                        <input
                          value={editing.tags || ''}
                          onChange={e => setEditing({ ...editing, tags: e.target.value })}
                          placeholder="e.g. tattoo, aftercare, sensitive skin"
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>
                          Description <span style={{ color: '#555' }}>(HTML supported)</span>
                        </label>
                        <textarea
                          value={editing.body_html || ''}
                          onChange={e => setEditing({ ...editing, body_html: e.target.value })}
                          rows={8}
                          placeholder="Enter product description... You can use HTML tags like <b>, <ul>, <li>, <p>"
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.5 }}
                        />
                        {editing.body_html && (
                          <div style={{ marginTop: 8, padding: 12, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8 }}>
                            <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>Preview:</div>
                            <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: editing.body_html }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      <div style={{ background: '#0d1117', border: '1px solid #1e3a5f', borderRadius: 10, padding: 14 }}>
                        <div style={{ fontSize: 12, color: '#4a9eff', fontWeight: 600, marginBottom: 4 }}>💡 SEO Tips</div>
                        <div style={{ fontSize: 12, color: '#6e9ec0', lineHeight: 1.5 }}>
                          SEO Title: 50–60 characters. Include your main keyword early.<br />
                          Meta Description: 140–160 characters. Describe the product and include a call to action.
                        </div>
                      </div>

                      {/* SEO Title */}
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>
                          SEO Title
                          <span style={{ marginLeft: 8, fontSize: 12, color: (editing.seo_title?.length || 0) > 60 ? '#ef4444' : '#666' }}>
                            {editing.seo_title?.length || 0}/60
                          </span>
                        </label>
                        <input
                          value={editing.seo_title || ''}
                          onChange={e => setEditing({ ...editing, seo_title: e.target.value })}
                          placeholder={editing.title}
                          maxLength={80}
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}
                        />
                        <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Defaults to product title if empty</div>
                      </div>

                      {/* Meta Description */}
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>
                          Meta Description
                          <span style={{ marginLeft: 8, fontSize: 12, color: (editing.seo_description?.length || 0) > 160 ? '#ef4444' : '#666' }}>
                            {editing.seo_description?.length || 0}/160
                          </span>
                        </label>
                        <textarea
                          value={editing.seo_description || ''}
                          onChange={e => setEditing({ ...editing, seo_description: e.target.value })}
                          rows={4}
                          placeholder="Describe this product for search engines..."
                          maxLength={200}
                          style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
                        />
                      </div>

                      {/* Google preview */}
                      <div>
                        <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Google Search Preview</div>
                        <div style={{ background: '#fff', borderRadius: 8, padding: '14px 16px' }}>
                          <div style={{ fontSize: 18, color: '#1a0dab', fontFamily: 'Arial, sans-serif', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {editing.seo_title || editing.title || 'Product Title'}
                          </div>
                          <div style={{ fontSize: 13, color: '#006621', fontFamily: 'Arial, sans-serif', marginBottom: 4 }}>
                            https://kongtattoocareglobal.com/products/...
                          </div>
                          <div style={{ fontSize: 13, color: '#545454', fontFamily: 'Arial, sans-serif', lineHeight: 1.4 }}>
                            {editing.seo_description || 'No meta description set. Add one to improve your click-through rate from search results.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #222', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {saveMsg && (
                    <span style={{ flex: 1, fontSize: 13, color: saveMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>{saveMsg}</span>
                  )}
                  <div style={{ flex: 1 }} />
                  <a
                    href={`https://admin.shopify.com/store/kongtattoocareglobal/products/${editing.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#666', fontSize: 13, textDecoration: 'none' }}
                  >
                    View in Shopify ↗
                  </a>
                  <button
                    onClick={() => setEditing(null)}
                    style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProduct}
                    disabled={saving}
                    style={{ background: saving ? '#5b21b6' : '#7c3aed', border: 'none', color: '#fff', borderRadius: 8, padding: '10px 24px', fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
