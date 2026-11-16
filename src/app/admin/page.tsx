'use client'
import { useEffect, useState, useRef } from 'react'

interface Analytics {
  totalOrders: number
  revenueAllTime: number
  revenue30d: number
  orders30d: number
  orders7d: number
  newCustomers30d: number
  avgOrderValue: number
  dailyRevenue: { date: string; revenue: number }[]
}

interface Order {
  id: number
  name: string
  email: string
  total: string
  status: string
  financial_status: string
  fulfillment_status: string
  created_at: string
}

interface Discount {
  id: number
  title: string
  value: string
  valueType: string
  usageCount: number
  usageLimit: number | null
  endsAt: string | null
  codes: { id: number; code: string; usageCount: number }[]
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const globeRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics').then(r => r.json()),
      fetch('/api/admin/orders').then(r => r.json()),
      fetch('/api/admin/discounts').then(r => r.json()),
    ]).then(([a, o, d]) => {
      if (a.error) setError(a.error)
      else setAnalytics(a)
      setOrders((o.orders || []).slice(0, 5))
      setDiscounts(d.discounts || [])
      setLoading(false)
    }).catch(e => { setError(String(e)); setLoading(false) })
  }, [])

  // Animated 3D dot globe
  useEffect(() => {
    const canvas = globeRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width = canvas.offsetWidth * 2
    const H = canvas.height = canvas.offsetHeight * 2
    canvas.style.width = canvas.offsetWidth + 'px'
    canvas.style.height = canvas.offsetHeight + 'px'

    const cx = W / 2, cy = H / 2
    const R = Math.min(W, H) * 0.42
    let angle = 0
    let raf: number

    // Dot positions (simplified land masses as lat/lon clusters)
    const landDots: [number, number][] = []
    // Generate dots that approximate continents
    const regions = [
      // Europe
      ...Array.from({ length: 80 }, () => [35 + Math.random() * 25, -10 + Math.random() * 40] as [number, number]),
      // North America
      ...Array.from({ length: 120 }, () => [25 + Math.random() * 50, -130 + Math.random() * 65] as [number, number]),
      // South America
      ...Array.from({ length: 80 }, () => [-50 + Math.random() * 60, -80 + Math.random() * 35] as [number, number]),
      // Africa
      ...Array.from({ length: 100 }, () => [-35 + Math.random() * 72, -18 + Math.random() * 55] as [number, number]),
      // Asia
      ...Array.from({ length: 160 }, () => [5 + Math.random() * 65, 25 + Math.random() * 115] as [number, number]),
      // Australia
      ...Array.from({ length: 50 }, () => [-38 + Math.random() * 30, 115 + Math.random() * 40] as [number, number]),
      // UK/Ireland (highlight for Kong)
      ...Array.from({ length: 20 }, () => [50 + Math.random() * 10, -8 + Math.random() * 10] as [number, number]),
    ]

    function draw() {
      ctx!.clearRect(0, 0, W, H)

      // Glow
      const grd = ctx!.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.1)
      grd.addColorStop(0, 'rgba(230,30,50,0.06)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = grd
      ctx!.beginPath()
      ctx!.arc(cx, cy, R * 1.1, 0, Math.PI * 2)
      ctx!.fill()

      // Globe outline
      ctx!.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.arc(cx, cy, R, 0, Math.PI * 2)
      ctx!.stroke()

      // Lat/lon grid lines
      ctx!.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx!.lineWidth = 0.5
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180
        const ry = Math.cos(latRad) * R
        const ys = cy + Math.sin(latRad) * R
        ctx!.beginPath()
        ctx!.ellipse(cx, ys, ry, ry * 0.15, 0, 0, Math.PI * 2)
        ctx!.stroke()
      }

      // Land dots
      regions.forEach(([lat, lon]) => {
        const latRad = (lat * Math.PI) / 180
        const lonRad = ((lon + angle) * Math.PI) / 180
        const x3 = Math.cos(latRad) * Math.sin(lonRad)
        const y3 = Math.sin(latRad)
        const z3 = Math.cos(latRad) * Math.cos(lonRad)
        if (z3 < 0) return // back face

        const px = cx + x3 * R
        const py = cy - y3 * R
        const brightness = 0.4 + z3 * 0.6
        const isUK = lat > 50 && lon > -8 && lon < 2

        ctx!.beginPath()
        ctx!.arc(px, py, z3 * 3 + 1, 0, Math.PI * 2)
        ctx!.fillStyle = isUK
          ? `rgba(230,30,50,${brightness})`
          : `rgba(200,255,0,${brightness * 0.6})`
        ctx!.fill()
      })

      // Longitude meridians (faint)
      for (let lon = 0; lon < 360; lon += 30) {
        const lonRad = ((lon + angle) * Math.PI) / 180
        const cosL = Math.cos(lonRad)
        if (cosL < 0) continue
        ctx!.strokeStyle = `rgba(255,255,255,${cosL * 0.03})`
        ctx!.lineWidth = 0.5
        ctx!.beginPath()
        for (let la = -80; la <= 80; la += 5) {
          const laRad = (la * Math.PI) / 180
          const x3 = Math.cos(laRad) * Math.sin(lonRad)
          const y3 = Math.sin(laRad)
          const z3 = Math.cos(laRad) * Math.cos(lonRad)
          if (z3 < 0) continue
          const px = cx + x3 * R
          const py = cy - y3 * R
          la === -80 ? ctx!.moveTo(px, py) : ctx!.lineTo(px, py)
        }
        ctx!.stroke()
      }

      angle -= 0.12
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

  function Sparkline({ data }: { data: { date: string; revenue: number }[] }) {
    if (!data || data.length < 2) return null
    const vals = data.map(d => d.revenue)
    const max = Math.max(...vals, 1)
    const W = 300, H = 48, P = 2
    const pts = vals.map((v, i) => {
      const x = P + (i / (vals.length - 1)) * (W - 2 * P)
      const y = H - P - (v / max) * (H - 2 * P)
      return `${x},${y}`
    }).join(' ')
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', marginTop: 8 }}>
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E61E32" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E61E32" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#spark-fill)" points={`${pts} ${W - P},${H} ${P},${H}`} />
        <polyline fill="none" stroke="#E61E32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      </svg>
    )
  }

  const activeDiscounts = discounts.filter(d => !d.endsAt || new Date(d.endsAt) > new Date())

  return (
    <>
      <style>{`
        .dash{max-width:1100px;margin:0 auto}
        .dash-h{text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #1e1e1e}
        .dash-h h1{font-size:28px;font-weight:700;color:#fff;letter-spacing:-.5px;margin-bottom:4px}
        .dash-h small{font-size:12px;color:#555}
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px}
        .g3b{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
        .g-live{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
        .stat{background:#161616;border:1px solid #222;border-radius:12px;padding:16px 18px;text-align:center}
        .stat b{display:block;font-size:26px;font-weight:700;color:#fff;line-height:1.1;margin-bottom:4px}
        .stat span{font-size:11px;color:#555;letter-spacing:.3px}
        .stat.red{border-color:#E61E3240} .stat.red b{color:#E61E32}
        .stat.lime{border-color:#C8FF0040} .stat.lime b{color:#C8FF00}
        .live-panel{background:#161616;border:1px solid #222;border-radius:12px;overflow:hidden}
        .live-head{padding:14px 16px;border-bottom:1px solid #1e1e1e;display:flex;align-items:center;gap:8px}
        .live-dot{width:8px;height:8px;background:#C8FF00;border-radius:50%;animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 #C8FF0060}50%{opacity:.8;box-shadow:0 0 0 6px #C8FF0000}}
        .live-head-title{font-size:12px;font-weight:600;color:#ccc;letter-spacing:.5px;text-transform:uppercase}
        .live-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:#1e1e1e}
        .live-stat{background:#161616;padding:14px 16px;text-align:center}
        .live-stat b{display:block;font-size:22px;font-weight:700;color:#fff}
        .live-stat span{font-size:10px;color:#555;letter-spacing:.5px;text-transform:uppercase}
        .globe-wrap{background:#0a0a0a;border-top:1px solid #1e1e1e;position:relative;height:200px;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .globe-label{position:absolute;top:10px;right:12px;font-size:10px;color:#333;letter-spacing:.5px}
        canvas.globe{width:100%;height:100%}
        .disc-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #1a1a1a}
        .disc-row:last-child{border-bottom:0}
        .disc-code{font-family:monospace;background:#1a1a1a;padding:4px 10px;border-radius:6px;color:#C8FF00;font-size:12px;letter-spacing:1px;flex-shrink:0}
        .disc-bar-wrap{flex:1;height:4px;background:#1a1a1a;border-radius:2px;overflow:hidden}
        .disc-bar{height:100%;background:#E61E32;border-radius:2px;transition:width .4s}
        .disc-usage{font-size:11px;color:#555;white-space:nowrap}
        @media(max-width:720px){.g3,.g3b{grid-template-columns:1fr 1fr}.g2,.g-live{grid-template-columns:1fr}}
      `}</style>

      <div className="dash">
        <div className="dash-h">
          <h1>Dashboard</h1>
          <small>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</small>
        </div>

        {error && <div className="adm-error">{error}</div>}

        {loading ? (
          <div className="adm-loading">Loading Shopify data…</div>
        ) : analytics ? (
          <>
            {/* All-time stats */}
            <div className="g3">
              <div className="stat red">
                <b>{fmt(analytics.revenueAllTime)}</b>
                <span>Total revenue</span>
              </div>
              <div className="stat lime">
                <b>{analytics.totalOrders}</b>
                <span>Total orders</span>
              </div>
              <div className="stat">
                <b>{fmt(analytics.avgOrderValue)}</b>
                <span>Avg order value</span>
              </div>
            </div>

            {/* Recent stats */}
            <div className="g3b">
              <div className="stat">
                <b>{fmt(analytics.revenue30d)}</b>
                <span>Revenue · 30 days</span>
              </div>
              <div className="stat">
                <b>{analytics.orders30d}</b>
                <span>Orders · 30 days</span>
              </div>
              <div className="stat">
                <b>{analytics.newCustomers30d}</b>
                <span>New customers · 30d</span>
              </div>
            </div>

            {/* Revenue sparkline + discount codes */}
            <div className="g2">
              <div className="adm-card">
                <div className="adm-card-title">Revenue · last 14 days</div>
                <Sparkline data={analytics.dailyRevenue} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span className="adm-muted">{analytics.dailyRevenue[0]?.date}</span>
                  <span className="adm-muted">Today</span>
                </div>
              </div>

              <div className="adm-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div className="adm-card-title" style={{ marginBottom: 0 }}>Active discount codes</div>
                  <a href="/admin/discounts" className="adm-btn ghost" style={{ padding: '4px 10px', fontSize: 11 }}>Manage →</a>
                </div>
                {activeDiscounts.length === 0 ? (
                  <div className="adm-muted" style={{ fontSize: 12 }}>No active codes</div>
                ) : activeDiscounts.flatMap(d => d.codes).slice(0, 6).map((c, i) => {
                  const rule = discounts.find(d => d.codes.some(dc => dc.id === c.id))
                  const limit = rule?.usageLimit
                  const pct = limit ? Math.min((c.usageCount / limit) * 100, 100) : 0
                  return (
                    <div key={c.id} className="disc-row">
                      <span className="disc-code">{c.code}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
                          {rule ? (rule.valueType === 'percentage' ? `${Math.abs(parseFloat(rule.value))}% off` : `£${Math.abs(parseFloat(rule.value))} off`) : ''}
                        </div>
                        {limit ? (
                          <div className="disc-bar-wrap">
                            <div className="disc-bar" style={{ width: `${pct}%` }} />
                          </div>
                        ) : null}
                      </div>
                      <span className="disc-usage">{c.usageCount}{limit ? `/${limit}` : ''} uses</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Live view + globe */}
            <div className="g-live">
              {/* Shopify Live View embed */}
              <div className="live-panel">
                <div className="live-head">
                  <div className="live-dot" />
                  <span className="live-head-title">Live visitors</span>
                  <a href="https://admin.shopify.com/store/kongtattoocareuk/live_view" target="_blank" rel="noopener" style={{ marginLeft: 'auto', fontSize: 11, color: '#555', textDecoration: 'none' }}>Open in Shopify ↗</a>
                </div>
                <div style={{ padding: '20px 16px' }}>
                  <LiveVisitors />
                </div>
              </div>

              {/* 3D Globe */}
              <div className="live-panel">
                <div className="live-head">
                  <div className="live-dot" style={{ background: '#E61E32', animationDelay: '.5s' }} />
                  <span className="live-head-title">Global reach</span>
                </div>
                <div className="globe-wrap">
                  <canvas ref={globeRef} className="globe" style={{ width: '100%', height: '100%' }} />
                  <span className="globe-label">🇬🇧 UK highlighted</span>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Recent orders */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="adm-card-title">Recent orders</div>
          <a href="/admin/orders" className="adm-btn ghost" style={{ padding: '5px 12px', fontSize: 11 }}>View all →</a>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6}><div className="adm-empty">No orders found</div></td></tr>
              ) : orders.map(o => (
                <tr key={o.id}>
                  <td style={{ color: '#fff', fontWeight: 600 }}>{o.name}</td>
                  <td className="adm-muted">{o.email || '—'}</td>
                  <td className="adm-muted">{fmtDate(o.created_at)}</td>
                  <td style={{ color: '#C8FF00', fontWeight: 600 }}>£{parseFloat(o.total || '0').toFixed(2)}</td>
                  <td><span className={`adm-badge ${o.financial_status}`}>{o.financial_status}</span></td>
                  <td><span className={`adm-badge ${o.fulfillment_status || 'unfulfilled'}`}>{o.fulfillment_status || 'unfulfilled'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// Live visitors widget — polls Shopify Analytics API
function LiveVisitors() {
  const [data, setData] = useState<{ visitors: number; sessions: number; activeCarts: number; checkingOut: number } | null>(null)

  useEffect(() => {
    async function poll() {
      try {
        const r = await fetch('/api/admin/live')
        if (r.ok) {
          const d = await r.json()
          setData(d)
        }
      } catch {}
    }
    poll()
    const id = setInterval(poll, 30000) // poll every 30s
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {[
        { label: 'Visitors now', value: data?.visitors ?? '—' },
        { label: 'Sessions', value: data?.sessions ?? '—' },
        { label: 'Active carts', value: data?.activeCarts ?? '—' },
        { label: 'Checking out', value: data?.checkingOut ?? '—' },
      ].map(s => (
        <div key={s.label} style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{s.value}</div>
          <div style={{ fontSize: 10, color: '#555', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>{s.label}</div>
        </div>
      ))}
      <div style={{ gridColumn: '1/-1', textAlign: 'center', marginTop: 4 }}>
        <a href="https://admin.shopify.com/store/kongtattoocareuk/live_view" target="_blank" rel="noopener" className="adm-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
          Open full Live View in Shopify →
        </a>
      </div>
    </div>
  )
}
