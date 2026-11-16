'use client'
import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setStatus('loading')
    try {
      // Shopify newsletter subscription via Klaviyo / customer list
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.12)', borderRadius: 14, padding: '14px 24px', border: '1px solid rgba(255,255,255,.3)' }}>
        <span style={{ fontSize: 20 }}>✓</span>
        <span style={{ color: '#fff', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 15, letterSpacing: '.06em' }}>You&apos;re in! Check your inbox for 10% off.</span>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="rounded-xl px-4 h-12 text-sm outline-none flex-1 md:w-56"
        style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', color: '#fff' }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn h-12 px-6 whitespace-nowrap"
        style={{ background: '#fff', color: 'var(--red)', opacity: status === 'loading' ? 0.7 : 1 }}
      >
        {status === 'loading' ? 'Subscribing…' : 'Subscribe →'}
      </button>
      {status === 'error' && <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, marginTop: 4 }}>Something went wrong. Try again.</p>}
    </form>
  )
}
