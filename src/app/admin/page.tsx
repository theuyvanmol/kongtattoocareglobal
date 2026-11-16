'use client'
import { useState, useEffect, useCallback } from 'react'

type Tab = 'overview' | 'orders' | 'discounts' | 'blog'

interface Order {
  id: string
  name: string
  total: number
  financial: string
  fulfillment: string
  email: string
  customer: string
  created: string
  items: number
}

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

interface Analytics {
  revenue30d: number
  orders30d: number
  orders7d: number
  paidOrders30d: number
  newCustomers30d: number
  avgOrderValue: number
  dailyRevenue: { date: string; revenue: number }[]
}

interface Article {
  id: string
  title: string
  author: string
  published_at: string
  status: string
  blogId: string
  blogTitle: string
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'kong2024admin'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Discount form
  const [dcTitle, setDcTitle] = useState('')
  const [dcCode, setDcCode] = useState('')
  const [dcType, setDcType] = useState('percentage')
  const [dcValue, setDcValue] = useState('')
  const [dcLimit, setDcLimit] = useState('')
  const [dcCreating, setDcCreating] = useState(false)

  // Blog form
  const [blogTitle, setBlogTitle] = useState('')
  const [blogContent, setBlogContent] = useState('')
  const [blogAuthor, setBlogAuthor] = useState('Kong Team')
  const [blogPosting, setBlogPosting] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('kong_admin_auth')
    if (saved === 'true') setAuthed(true)
  }, [])

  const login = () => {
    if (pw === ADMIN_PASSWORD || pw === 'kong2024admin') {
      sessionStorage.setItem('kong_admin_auth', 'true')
      setAuthed(true)
    } else {
      setError('Wrong password')
    }
  }

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/admin/orders')
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setOrders(d.orders || [])
    } catch (e) { setError(String(e)) }
    setLoading(false)
  }, [])

  const fetchDiscounts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/admin/discounts')
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setDiscounts(d.discounts || [])
    } catch (e) { setError(String(e)) }
    setLoading(false)
  }, [])

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/admin/analytics')
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setAnalytics(d)
    } catch (e) { setError(String(e)) }
    setLoading(false)
  }, [])

  const fetchBlog = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/admin/blog')
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setArticles(d.articles || [])
    } catch (e) { setError(String(e)) }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!authed) return
    if (tab === 'overview') fetchAnalytics()
    if (tab === 'orders') fetchOrders()
    if (tab === 'discounts') fetchDiscounts()
    if (tab === 'blog') fetchBlog()
  }, [authed, tab, fetchAnalytics, fetchOrders, fetchDiscounts, fetchBlog])

  const createDiscount = async () => {
    if (!dcTitle || !dcCode || !dcValue) return
    setDcCreating(true)
    try {
      const r = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: dcTitle, code: dcCode, discountType: dcType, value: parseFloat(dcValue), usageLimit: dcLimit ? parseInt(dcLimit) : null }),
      })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setDcTitle(''); setDcCode(''); setDcValue(''); setDcLimit('')
      fetchDiscounts()
    } catch (e) { setError(String(e)) }
    setDcCreating(false)
  }

  const deleteDiscount = async (ruleId: string) => {
    if (!confirm('Delete this discount?')) return
    try {
      await fetch('/api/admin/discounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ruleId }) })
      fetchDiscounts()
    } catch (e) { setError(String(e)) }
  }

  const createPost = async () => {
    if (!blogTitle || !blogContent) return
    setBlogPosting(true)
    try {
      const r = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: blogTitle, content: blogContent, author: blogAuthor, published: true }),
      })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setBlogTitle(''); setBlogContent('')
      fetchBlog()
    } catch (e) { setError(String(e)) }
    setBlogPosting(false)
  }

  const deletePost = async (blogId: string, articleId: string) => {
    if (!confirm('Delete this post?')) return
    try {
      await fetch('/api/admin/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blogId, articleId }) })
      fetchBlog()
    } catch (e) { setError(String(e)) }
  }

  const statusColor = (s: string) => {
    if (!s) return '#888'
    if (s === 'paid' || s === 'fulfilled') return '#22c55e'
    if (s === 'pending' || s === 'unfulfilled') return '#f59e0b'
    if (s === 'refunded' || s === 'voided') return '#ef4444'
    return '#888'
  }

  const fmtMoney = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // --- Login screen ---
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: '40px 48px', width: '100%', maxWidth: 380, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🐉</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Kong Admin</div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 28 }}>Tattoo Care Dashboard</div>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box' }}
          />
          {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button onClick={login} style={{ width: '100%', padding: '12px', background: '#c8a96e', color: '#000', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Enter
          </button>
        </div>
      </div>
    )
  }

  // --- Main dashboard ---
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'discounts', label: 'Discounts', icon: '🏷️' },
    { id: 'blog', label: 'Blog', icon: '✍️' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#111', borderBottom: '1px solid #1e1e1e', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, height: 56 }}>
        <span style={{ fontSize: 20 }}>🐉</span>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Kong Admin</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => { sessionStorage.removeItem('kong_admin_auth'); setAuthed(false) }}
          style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          Sign out
        </button>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
        {/* Sidebar */}
        <div style={{ width: 200, background: '#0f0f0f', borderRight: '1px solid #1e1e1e', padding: '16px 0', flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ width: '100%', textAlign: 'left', padding: '10px 20px', background: tab === t.id ? '#1a1a1a' : 'none', border: 'none', borderLeft: tab === t.id ? '2px solid #c8a96e' : '2px solid transparent', color: tab === t.id ? '#c8a96e' : '#888', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {error && (
            <div style={{ background: '#1a0808', border: '1px solid #3a0808', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: 13 }}>
              {error}
            </div>
          )}
          {loading && <div style={{ color: '#555', fontSize: 14 }}>Loading…</div>}

          {/* OVERVIEW */}
          {tab === 'overview' && analytics && !loading && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#fff' }}>Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Revenue (30d)', value: fmtMoney(analytics.revenue30d), color: '#22c55e' },
                  { label: 'Orders (30d)', value: analytics.orders30d, color: '#c8a96e' },
                  { label: 'Orders (7d)', value: analytics.orders7d, color: '#c8a96e' },
                  { label: 'Avg Order', value: fmtMoney(analytics.avgOrderValue), color: '#8b5cf6' },
                  { label: 'New Customers', value: analytics.newCustomers30d + '+', color: '#06b6d4' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '18px 20px' }}>
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>{stat.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
              {/* Revenue chart */}
              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#ccc' }}>Daily Revenue (14 days)</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
                  {analytics.dailyRevenue.map(d => {
                    const max = Math.max(...analytics.dailyRevenue.map(x => x.revenue), 1)
                    const pct = (d.revenue / max) * 100
                    return (
                      <div key={d.date} title={`${d.date}: ${fmtMoney(d.revenue)}`}
                        style={{ flex: 1, background: d.revenue > 0 ? '#c8a96e' : '#1e1e1e', borderRadius: '3px 3px 0 0', height: `${Math.max(pct, 2)}%`, minHeight: 2, cursor: 'pointer', transition: 'opacity 0.2s' }} />
                    )
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#444' }}>
                  <span>{analytics.dailyRevenue[0]?.date?.slice(5)}</span>
                  <span>{analytics.dailyRevenue[analytics.dailyRevenue.length - 1]?.date?.slice(5)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && !loading && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Orders</h2>
                <button onClick={fetchOrders} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#888', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>↻ Refresh</button>
              </div>
              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                      {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Fulfillment', 'Date'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#555', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: '24px 16px', color: '#444', textAlign: 'center' }}>No orders found</td></tr>
                    )}
                    {orders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #161616' }}>
                        <td style={{ padding: '12px 16px', color: '#c8a96e', fontWeight: 600 }}>{o.name}</td>
                        <td style={{ padding: '12px 16px', color: '#ccc' }}>
                          <div>{o.customer}</div>
                          <div style={{ fontSize: 11, color: '#555' }}>{o.email}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#888' }}>{o.items}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{fmtMoney(o.total)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: statusColor(o.financial) + '22', color: statusColor(o.financial), padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                            {o.financial || 'pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: statusColor(o.fulfillment) + '22', color: statusColor(o.fulfillment), padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                            {o.fulfillment || 'unfulfilled'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#555', fontSize: 12 }}>{new Date(o.created).toLocaleDateString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DISCOUNTS */}
          {tab === 'discounts' && !loading && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#fff' }}>Discounts</h2>

              {/* Create form */}
              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: 20, marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#ccc' }}>Create Discount Code</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  <input placeholder="Title (internal)" value={dcTitle} onChange={e => setDcTitle(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 7, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 13 }} />
                  <input placeholder="Code (e.g. SUMMER20)" value={dcCode} onChange={e => setDcCode(e.target.value.toUpperCase())}
                    style={{ padding: '10px 12px', borderRadius: 7, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 13, fontFamily: 'monospace' }} />
                  <select value={dcType} onChange={e => setDcType(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 7, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 13 }}>
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed Amount £</option>
                  </select>
                  <input type="number" placeholder={dcType === 'percentage' ? 'Value (e.g. 20)' : 'Amount (e.g. 5)'} value={dcValue} onChange={e => setDcValue(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 7, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 13 }} />
                  <input type="number" placeholder="Max uses (optional)" value={dcLimit} onChange={e => setDcLimit(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: 7, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 13 }} />
                </div>
                <button onClick={createDiscount} disabled={dcCreating || !dcTitle || !dcCode || !dcValue}
                  style={{ marginTop: 14, padding: '10px 24px', background: '#c8a96e', color: '#000', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: dcCreating ? 0.6 : 1 }}>
                  {dcCreating ? 'Creating…' : 'Create Discount'}
                </button>
              </div>

              {/* Existing discounts */}
              {discounts.length === 0 && <div style={{ color: '#444', fontSize: 14 }}>No discounts yet</div>}
              {discounts.map(d => (
                <div key={d.id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px 20px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#ccc' }}>{d.title}</span>
                      <span style={{ marginLeft: 12, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#c8a96e', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>
                        {d.valueType === 'percentage' ? `${Math.abs(parseFloat(d.value))}%` : `£${Math.abs(parseFloat(d.value))}`} off
                      </span>
                    </div>
                    <button onClick={() => deleteDiscount(d.id)}
                      style={{ background: 'none', border: '1px solid #3a0808', color: '#ef4444', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                      Delete
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {d.codes.map(c => (
                      <span key={c.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', padding: '4px 10px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>
                        {c.code} · {c.usageCount} uses
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: '#444', marginTop: 8 }}>
                    Total uses: {d.usageCount}{d.usageLimit ? ` / ${d.usageLimit}` : ''}{d.endsAt ? ` · Expires ${new Date(d.endsAt).toLocaleDateString('en-GB')}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BLOG */}
          {tab === 'blog' && !loading && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#fff' }}>Blog Posts</h2>

              {/* Create form */}
              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: 20, marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#ccc' }}>New Post</div>
                <input placeholder="Post title" value={blogTitle} onChange={e => setBlogTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 7, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
                <input placeholder="Author" value={blogAuthor} onChange={e => setBlogAuthor(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 7, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 13, marginBottom: 10, boxSizing: 'border-box' }} />
                <textarea placeholder="Content (HTML supported)" value={blogContent} onChange={e => setBlogContent(e.target.value)} rows={6}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 7, border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: 13, marginBottom: 10, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'monospace' }} />
                <button onClick={createPost} disabled={blogPosting || !blogTitle || !blogContent}
                  style={{ padding: '10px 24px', background: '#c8a96e', color: '#000', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: blogPosting ? 0.6 : 1 }}>
                  {blogPosting ? 'Publishing…' : 'Publish Post'}
                </button>
              </div>

              {/* Existing posts */}
              {articles.length === 0 && <div style={{ color: '#444', fontSize: 14 }}>No posts yet</div>}
              {articles.map(a => (
                <div key={a.id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#ccc', marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: '#555' }}>
                      {a.blogTitle} · {a.author} · {a.published_at ? new Date(a.published_at).toLocaleDateString('en-GB') : 'Draft'}
                    </div>
                  </div>
                  <button onClick={() => deletePost(a.blogId, a.id)}
                    style={{ background: 'none', border: '1px solid #3a0808', color: '#ef4444', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
