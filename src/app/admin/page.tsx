'use client'
import { useEffect, useState, useRef } from 'react'
import LiveNow from '@/components/LiveNow'

interface StripeCharge {
  id: string
  amount: number
  currency: string
  status: string
  email: string
  name: string
  created: string
  refunded: boolean
  receipt_url: string | null
}

interface StripeBalance {
  available: number
  pending: number
}

export default function AdminDashboard() {
  const [charges, setCharges] = useState<StripeCharge[]>([])
  const [balance, setBalance] = useState<StripeBalance>({ available: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const globeRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetch('/api/admin/stripe')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return }
        setCharges(d.charges || [])
        setBalance(d.balance || { available: 0, pending: 0 })
        setLoading(false)
      })
      .catch(e => { setError(String(e)); setLoading(false) })
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

    const regions: [number, number][] = [
      ...Array.from({ length: 80 }, () => [35 + Math.random() * 25, -10 + Math.random() * 40] as [number, number]),
      ...Array.from({ length: 120 }, () => [25 + Math.random() * 50, -130 + Math.random() * 65] as [number, number]),
      ...Array.from({ length: 80 }, () => [-50 + Math.random() * 60, -80 + Math.random() * 35] as [number, number]),
      ...Array.from({ length: 100 }, () => [-35 + Math.random() * 72, -18 + Math.random() * 55] as [number, number]),
      ...Array.from({ length: 160 }, () => [5 + Math.random() * 65, 25 + Math.random() * 115] as [number, number]),
      ...Array.from({ length: 50 }, () => [-38 + Math.random() * 30, 115 + Math.random() * 40] as [number, number]),
      ...Array.from({ length: 20 }, () => [50 + Math.random() * 10, -8 + Math.random() * 10] as [number, number]),
    ]

    function draw() {
      ctx!.clearRect(0, 0, W, H)
      const grd = ctx!.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.1)
      grd.addColorStop(0, 'rgba(230,30,50,0.06)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = grd
      ctx!.beginPath()
      ctx!.arc(cx, cy, R * 1.1, 0, Math.PI * 2)
      ctx!.fill()

      ctx!.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.arc(cx, cy, R, 0, Math.PI * 2)
      ctx!.stroke()

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

      regions.forEach(([lat, lon]) => {
        const latRad = (lat * Math.PI) / 180
        const lonRad = ((lon + angle) * Math.PI) / 180
        const x3 = Math.cos(latRad) * Math.sin(lonRad)
        const y3 = Math.sin(latRad)
        const z3 = Math.cos(latRad) * Math.cos(lonRad)
        if (z3 < 0) return
        const px = cx + x3 * R
        const py = cy - y3 * R
        const brightness = 0.4 + z3 * 0.6
        const isUK = lat > 50 && lon > -8 && lon < 2
        ctx!.beginPath()
        ctx!.arc(px, py, z3 * 3 + 1, 0, Math.PI * 2)
        ctx!.fillStyle = isUK ? `rgba(230,30,50,${brightness})` : `rgba(200,255,0,${brightness * 0.6})`
        ctx!.fill()
      })

      angle -= 0.12
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  // Compute stats from Stripe charges
  const succeeded = charges.filter(c => c.status === 'succeeded' && !c.refunded)
  const totalRevenue = succeeded.reduce((s, c) => s + c.amount, 0)
  const avgOrder = succeeded.length > 0 ? totalRevenue / succeeded.length : 0

  const now = Date.now()
  const ms30d = 30 * 24 * 60 * 60 * 1000
  const ms7d = 7 * 24 * 60 * 60 * 1000
  const charges30d = succeeded.filter(c => now - new Date(c.created).getTime() < ms30d)
  const charges7d = succeeded.filter(c => now - new Date(c.created).getTime() < ms7d)
  const revenue30d = charges30d.reduce((s, c) => s + c.amount, 0)
  const revenue7d = charges7d.reduce((s, c) => s + c.amount, 0)

  // Daily revenue chart (last 14 days)
  const dailyMap: Record<string, number> = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000)
    dailyMap[d.toISOString().split('T')[0]] = 0
  }
  for (const c of charges30d) {
    const key = c.created.split('T')[0]
    if (key in dailyMap) dailyMap[key] += c.amount
  }
  const dailyRevenue = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }))

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

  return (
    <>
      <style>{`
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#E8E5DF;border:1px solid #E8E5DF;border-radius:10px;overflow:hidden;margin-bottom:16px}
        .g3b{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#E8E5DF;border:1px solid #E8E5DF;border-radius:10px;overflow:hidden;margin-bottom:20px}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .g-live{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
        .stat{background:#fff;padding:18px 20px;text-align:center}
        .stat b{display:block;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1;margin-bottom:4px}
        .stat span{font-size:12px;color:#888}
        .stat.green b{color:#2d7a4f} .stat.amber b{color:#b7701a}
        .live-panel{background:#fff;border:1px solid #E8E5DF;border-radius:10px;overflow:hidden}
        .live-head{padding:14px 16px;border-bottom:1px solid #E8E5DF;display:flex;align-items:center;gap:8px}
        .live-dot{width:7px;height:7px;background:#2d7a4f;border-radius:50%;animation:kpulse 2s infinite}
        @keyframes kpulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(45,122,79,.4)}50%{opacity:.8;box-shadow:0 0 0 5px rgba(45,122,79,0)}}
        .live-head-title{font-size:12px;font-weight:600;color:#555;letter-spacing:.5px;text-transform:uppercase}
        .globe-wrap{background:#1C2320;border-top:1px solid #E8E5DF;position:relative;height:200px;overflow:hidden;display:flex;align-items:center;justify-content:center}
        .globe-label{position:absolute;top:10px;right:12px;font-size:10px;color:#8a9e98;letter-spacing:.5px}
        canvas.globe{width:100%;height:100%}
        @media(max-width:720px){.g3,.g3b{grid-template-columns:1fr 1fr}.g2,.g-live{grid-template-columns:1fr}}
      `}</style>

      <div className="adm-content">
        <div className="adm-page-head" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="adm-page-title">Dashboard</h1>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <a href="/admin/orders" className="adm-btn secondary">View all orders</a>
        </div>

        {error && <div className="adm-error">{error}</div>}

        {loading ? (
          <div className="adm-loading">Loading Stripe data…</div>
        ) : (
          <>
            {/* All-time stats */}
            <div className="g3">
              <div className="stat">
                <b>{fmt(totalRevenue)}</b>
                <span>Total revenue</span>
              </div>
              <div className="stat green">
                <b>{succeeded.length}</b>
                <span>Total orders</span>
              </div>
              <div className="stat">
                <b>{fmt(avgOrder)}</b>
                <span>Avg order value</span>
              </div>
            </div>

            {/* Recent stats */}
            <div className="g3b">
              <div className="stat">
                <b>{fmt(revenue30d)}</b>
                <span>Revenue · 30 days</span>
              </div>
              <div className="stat">
                <b>{charges30d.length}</b>
                <span>Orders · 30 days</span>
              </div>
              <div className="stat amber">
                <b>{fmt(balance.available)}</b>
                <span>Stripe available</span>
              </div>
            </div>

            {/* Balance + sparkline */}
            <div className="g2">
              <div className="adm-card">
                <div className="adm-card-title">Revenue · last 14 days</div>
                <Sparkline data={dailyRevenue} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: '#aaa' }}>{dailyRevenue[0]?.date}</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}>Today</span>
                </div>
              </div>

              <div className="adm-card">
                <div className="adm-card-title">Stripe balance</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                  <div style={{ background: '#F5F3EE', borderRadius: 8, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#2d7a4f' }}>{fmt(balance.available)}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Available</div>
                  </div>
                  <div style={{ background: '#F5F3EE', borderRadius: 8, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#b7701a' }}>{fmt(balance.pending)}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Pending</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live view + globe */}
            <div className="g-live">
              <div className="live-panel">
                <div className="live-head">
                  <div className="live-dot" />
                  <span className="live-head-title">Live visitors</span>
                </div>
                <div style={{ padding: '16px' }}>
                  <LiveNow />
                </div>
              </div>
              <div className="live-panel">
                <div className="live-head">
                  <div className="live-dot" style={{ animationDelay: '.5s' }} />
                  <span className="live-head-title">Global reach</span>
                </div>
                <div className="globe-wrap">
                  <canvas ref={globeRef} className="globe" style={{ width: '100%', height: '100%' }} />
                  <span className="globe-label">🇬🇧 UK highlighted</span>
                </div>
              </div>
            </div>

            {/* Recent Stripe orders */}
            <div style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: 12 }}>Recent payments</div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.length === 0 ? (
                    <tr><td colSpan={6}><div className="adm-empty">No payments found</div></td></tr>
                  ) : charges.slice(0, 10).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 12, color: '#555' }}>{c.id.slice(-8)}</td>
                      <td style={{ color: '#555' }}>{c.name || c.email || '—'}</td>
                      <td style={{ color: '#888' }}>{fmtDate(c.created)}</td>
                      <td style={{ fontWeight: 600 }}>{fmt(c.amount)}</td>
                      <td><span className={`adm-badge ${c.status}`}>{c.refunded ? 'refunded' : c.status}</span></td>
                      <td>{c.receipt_url ? <a href={c.receipt_url} target="_blank" rel="noreferrer" style={{ color: '#1C2320', fontSize: 12 }}>View ↗</a> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  )
}
