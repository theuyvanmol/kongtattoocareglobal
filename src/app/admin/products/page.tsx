'use client'
import { useEffect, useState } from 'react'

interface Product {
  id: number
  title: string
  status: string
  price: number
  inventory: number
  image: string | null
  type: string
  variantCount: number
  updated: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ title: '', status: '', price: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const d = await fetch('/api/admin/products').then(r => r.json())
    setProducts(d.products || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openEdit(p: Product) {
    setEditing(p)
    setForm({ title: p.title, status: p.status, price: String(p.price) })
  }

  async function saveProduct() {
    if (!editing) return
    setSaving(true)
    const r = await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, title: form.title, status: form.status, price: form.price }),
    })
    const d = await r.json()
    setSaving(false)
    if (d.error) { setError(d.error); return }
    setEditing(null)
    load()
  }

  const filtered = products.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.type?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Products</h1>
          <small>{filtered.length} products</small>
        </div>
        <a href="https://admin.shopify.com/store/kongtattoocareuk/products/new" target="_blank" rel="noopener" className="adm-btn">+ Add product</a>
      </div>

      {error && <div className="adm-error">{error}</div>}

      <div className="adm-filters">
        <input
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      {loading ? (
        <div className="adm-loading">Loading products…</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}></th>
                <th>Product</th>
                <th>Status</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Variants</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="adm-empty">No products found</div></td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.image ? (
                      <img src={p.image} alt="" className="adm-prod-img" />
                    ) : (
                      <div className="adm-prod-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 18 }}>📦</div>
                    )}
                  </td>
                  <td>
                    <div style={{ color: '#fff', fontWeight: 500 }}>{p.title}</div>
                    {p.type && <div className="adm-muted">{p.type}</div>}
                  </td>
                  <td><span className={`adm-badge ${p.status}`}>{p.status}</span></td>
                  <td style={{ color: '#C8FF00', fontWeight: 600 }}>£{p.price.toFixed(2)}</td>
                  <td style={{ color: p.inventory === 0 ? '#E61E32' : '#ccc' }}>{p.inventory}</td>
                  <td className="adm-muted">{p.variantCount}</td>
                  <td>
                    <button className="adm-btn ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => openEdit(p)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="adm-modal-bg" onClick={() => setEditing(null)}>
          <div className="adm-modal adm-form" onClick={e => e.stopPropagation()}>
            <h2>Edit product</h2>
            <div className="adm-form-row">
              <div>
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
            </div>
            <div className="adm-form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label>Price (£)</label>
                <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div className="adm-row" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button className="adm-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="adm-btn" onClick={saveProduct} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
