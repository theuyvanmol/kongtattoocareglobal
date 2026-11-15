'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

interface Profile {
  email: string
  full_name?: string
  role: string
}

export default function AccountPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user } } = await sb.auth.getUser()
        if (user) {
          const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).single()
          setProfile({ email: user.email || '', full_name: p?.full_name, role: p?.role || 'member' })
        }
      } catch {}
      setLoading(false)
    }
    init()
  }, [])

  const handleSignOut = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await sb.auth.signOut()
      window.location.href = '/'
    } catch {}
  }

  if (loading) return (
    <>
      <Nav />
      <div className="min-h-[80svh] flex items-center justify-center" style={{ paddingTop: 100 }}>
        <div className="hed text-3xl animate-pulse" style={{ color: 'var(--fg-40)' }}>Loading…</div>
      </div>
      <Footer />
    </>
  )

  if (!profile) return (
    <>
      <Nav />
      <div className="min-h-[80svh] flex items-center justify-center" style={{ paddingTop: 100 }}>
        <div className="text-center px-6">
          <span className="text-4xl block mb-4">👤</span>
          <h1 className="hed text-5xl mb-4">My Account</h1>
          <p className="mb-8" style={{ color: 'var(--fg-70)' }}>Sign in to access your account.</p>
          <a href="/login" className="btn btn-red px-8 py-4">Sign In →</a>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Nav />
      <div style={{ paddingTop: 100 }}>
        <div className="wrap-wide cap" style={{ paddingTop: 40, paddingBottom: 96 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <p className="lbl mb-2">Your Profile</p>
              <h1 className="hed text-[clamp(36px,6vw,56px)]">
                {profile.full_name ? `Hey, ${profile.full_name.split(' ')[0]}` : 'My Account'}
              </h1>
            </div>
            <button onClick={handleSignOut} className="btn btn-out text-xs">Sign Out</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Profile card */}
            <div className="p-6 rounded-xl sm:col-span-2 lg:col-span-1" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
              <h2 className="font-bold mb-4 text-lg" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>Account Details</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs" style={{ color: 'var(--fg-40)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>EMAIL</p>
                  <p className="text-sm mt-0.5">{profile.email}</p>
                </div>
                {profile.full_name && (
                  <div>
                    <p className="text-xs" style={{ color: 'var(--fg-40)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>NAME</p>
                    <p className="text-sm mt-0.5">{profile.full_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs" style={{ color: 'var(--fg-40)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>ROLE</p>
                  <p className="text-sm mt-0.5 capitalize" style={{ color: 'var(--lime)' }}>{profile.role}</p>
                </div>
              </div>
            </div>

            {/* Quick links */}
            {[
              { icon: '🛒', title: 'Start Shopping', desc: 'Browse our full range of aftercare products.', href: '/shop-all' },
              { icon: '🌍', title: 'Join the Kingdom', desc: 'Get exclusive drops, 10% off, and community access.', href: '/kong-kingdom' },
              ...(profile.role !== 'member' ? [{ icon: '⚙️', title: 'Artist Hub', desc: 'Access your hub, assets, and affiliate dashboard.', href: '/hub' }] : []),
            ].map(item => (
              <a key={item.title} href={item.href} className="group flex flex-col gap-2 p-6 rounded-xl hover:border-[var(--lime)] transition-all" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
                <span className="text-3xl">{item.icon}</span>
                <h3 className="font-bold group-hover:text-[var(--lime)] transition-colors" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{item.title}</h3>
                <p className="text-sm" style={{ color: 'var(--fg-70)' }}>{item.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
