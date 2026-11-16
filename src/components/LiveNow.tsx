'use client'
import { useEffect, useState } from 'react'

interface LiveData {
  visitors: number
  pages: { path: string; count: number }[]
  countries: { cc: string; count: number }[]
  points: { lat: number; lon: number; cc: string; city: string }[]
  todayPv: number
  todayUv: number
  todayAtc: number
  todayCheckout: number
}

export default function LiveNow() {
  const [data, setData] = useState<LiveData | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const d = await fetch('/api/admin/live').then(r => r.json())
      setData(d)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15_000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="adm-card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{
          display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
          background: '#C8FF00', boxShadow: '0 0 8px #C8FF00',
          animation: 'pulse 2s infinite',
        }} />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>Live Now</h3>
        {loading && <span style={{ fontSize: 11, color: '#666' }}>Loading…</span>}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Live visitors', value: data?.visitors ?? '—', accent: '#C8FF00' },
          { label: 'Today PVs', value: data?.todayPv ?? '—' },
          { label: 'Add to cart', value: data?.todayAtc ?? '—' },
          { label: 'Checkouts', value: data?.todayCheckout ?? '—' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#1a1a1a', borderRadius: 8, padding: '12px 14px',
            border: '1px solid #2a2a2a',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.accent || '#fff', letterSpacing: '-0.5px' }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {data && data.countries.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {data.countries.slice(0, 8).map(c => (
            <span key={c.cc} style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4,
              padding: '3px 8px', fontSize: 11, color: '#ccc',
            }}>
              {c.cc} <span style={{ color: '#666' }}>{c.count}</span>
            </span>
          ))}
        </div>
      )}

      {(!data || (data.visitors === 0 && !loading)) && (
        <div style={{ fontSize: 12, color: '#555', textAlign: 'center', padding: '8px 0' }}>
          No active visitors right now — visit the site to see tracking in action
        </div>
      )}
    </div>
  )
}
