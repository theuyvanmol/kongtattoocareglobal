'use client'
import { useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error: authError } = await sb.auth.signInWithPassword({ email, password })
      if (authError) { setError(authError.message); return }
      window.location.href = '/account'
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Nav />
      <div style={{ paddingTop: 100 }} className="min-h-[90svh] flex items-center justify-center">
        <div className="wrap cap w-full max-w-md py-16">
          <p className="lbl mb-3 text-center">Members Area</p>
          <h1 className="hed text-5xl text-center mb-10">Sign In</h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--fg-70)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all"
                style={{ background: 'var(--bg2)', border: '1.5px solid var(--rule)', color: 'var(--fg)' }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--fg-70)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full h-12 rounded-xl px-4 text-sm outline-none transition-all"
                style={{ background: 'var(--bg2)', border: '1.5px solid var(--rule)', color: 'var(--fg)' }}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm p-3 rounded-lg" style={{ background: 'rgba(230,30,50,.1)', color: 'var(--red)' }}>{error}</p>
            )}
            <button type="submit" disabled={loading} className="btn btn-red text-base py-4 mt-2">
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-8 text-center flex flex-col gap-2">
            <p className="text-sm" style={{ color: 'var(--fg-40)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/kong-kingdom" style={{ color: 'var(--lime)' }}>Join the Kingdom</Link>
            </p>
            <Link href="/hub" className="text-sm" style={{ color: 'var(--fg-40)' }}>Artist? Access the Hub →</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
