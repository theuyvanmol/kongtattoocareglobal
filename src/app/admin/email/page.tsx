'use client'
import { useEffect, useState } from 'react'

interface Customer {
  id: number
  email: string
  name: string
  acceptsMarketing: boolean
  ordersCount: number
}

export default function AdminEmail() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [segment, setSegment] = useState('all')
  const [preview, setPreview] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/admin/customers').then(r => r.json()).then(d => {
      setCustomers(d.customers || [])
      setLoading(false)
    })
  }, [])

  const recipients = customers.filter(c => {
    if (!c.email) return false
    if (segment === 'marketing') return c.acceptsMarketing
    if (segment === 'buyers') return c.ordersCount > 0
    if (segment === 'repeat') return c.ordersCount > 1
    return true
  })

  function buildMailto() {
    const emails = recipients.map(c => c.email).join(',')
    return `mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  async function copyList() {
    const text = recipients.map(c => `${c.name} <${c.email}>`).join('\n')
    await navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const templates = [
    { label: 'Product launch', subject: '🖤 New arrival at Kong Tattoo Care', body: `Hi [Name],\n\nWe've just launched something new and we think you'll love it.\n\n[Product name & link]\n\n[Description]\n\nShop now: https://kongtattoocare.com\n\n—\nKong Tattoo Care Team` },
    { label: 'Discount offer', subject: 'Exclusive offer for you — Kong Tattoo Care', body: `Hi [Name],\n\nAs a valued customer, we're giving you an exclusive discount.\n\nUse code: KONG10 for 10% off your next order.\n\nValid until: [date]\n\nShop: https://kongtattoocare.com\n\n—\nKong Tattoo Care` },
    { label: 'Newsletter', subject: 'Kong Tattoo Care — What\'s new', body: `Hi [Name],\n\n[Main story or update here]\n\n📦 New products: [link]\n📰 Blog: [link]\n🎯 Featured: [link]\n\nThanks for being part of the Kong community.\n\n—\nKong Tattoo Care` },
  ]

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Email campaigns</h1>
          <small>Compose and send via your email client</small>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="adm-card adm-form">
            <div className="adm-card-title" style={{ marginBottom: 16 }}>Compose</div>
            <div className="adm-form-row">
              <div>
                <label>Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject line…" />
              </div>
            </div>
            <div className="adm-form-row">
              <div>
                <label>Body</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Email body…" style={{ minHeight: 200 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="adm-btn" onClick={() => setPreview(!preview)}>
                {preview ? 'Edit' : 'Preview'}
              </button>
              <a href={buildMailto()} className="adm-btn lime" style={{ color: '#000' }}>
                Open in email client ({recipients.length})
              </a>
              <button className="adm-btn ghost" onClick={copyList}>
                {copied ? 'Copied!' : 'Copy email list'}
              </button>
            </div>
          </div>

          {preview && subject && body && (
            <div className="adm-card">
              <div className="adm-card-title">Preview</div>
              <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 20, border: '1px solid #1a1a1a' }}>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>Subject: <span style={{ color: '#ccc' }}>{subject}</span></div>
                <pre style={{ color: '#ccc', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{body}</pre>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="adm-card">
            <div className="adm-card-title">Segment</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { v: 'all', label: 'All customers' },
                { v: 'marketing', label: 'Marketing subscribers' },
                { v: 'buyers', label: 'All buyers' },
                { v: 'repeat', label: 'Repeat buyers' },
              ].map(opt => (
                <button
                  key={opt.v}
                  className={`adm-btn ${segment === opt.v ? '' : 'ghost'}`}
                  style={{ justifyContent: 'space-between', padding: '8px 12px' }}
                  onClick={() => setSegment(opt.v)}
                >
                  {opt.label}
                  <span style={{ opacity: .6 }}>
                    {loading ? '…' : customers.filter(c => {
                      if (opt.v === 'marketing') return c.acceptsMarketing
                      if (opt.v === 'buyers') return c.ordersCount > 0
                      if (opt.v === 'repeat') return c.ordersCount > 1
                      return true
                    }).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card-title">Templates</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {templates.map(t => (
                <button
                  key={t.label}
                  className="adm-btn ghost"
                  style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: 12 }}
                  onClick={() => { setSubject(t.subject); setBody(t.body) }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
