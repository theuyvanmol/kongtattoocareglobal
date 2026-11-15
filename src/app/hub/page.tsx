'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function HubPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { user: authUser } } = await sb.auth.getUser()
        if (authUser) {
          const { data: profile } = await sb.from('profiles').select('role').eq('id', authUser.id).single()
          setUser({ email: authUser.email || '', role: profile?.role || 'member' })
        }
      } catch {}
      setLoading(false)
    }
    checkAuth()
  }, [])

  if (loading) {
    return (
      <>
        <Nav />
        <div className="min-h-[80svh] flex items-center justify-center" style={{ paddingTop: 100 }}>
          <div className="hed text-3xl animate-pulse" style={{ color: 'var(--fg-40)' }}>Loading…</div>
        </div>
        <Footer />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Nav />
        <div className="min-h-[80svh] flex items-center justify-center" style={{ paddingTop: 100 }}>
          <div className="text-center px-6 max-w-md">
            <span className="text-4xl block mb-4">🔒</span>
            <h1 className="hed text-5xl mb-4">Artist Hub</h1>
            <p className="mb-8" style={{ color: 'var(--fg-70)' }}>This area is for verified KONG artists and stockists only. Sign in to access your hub.</p>
            <a href="/login" className="btn btn-red px-8 py-4">Sign In →</a>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Nav />
      <div style={{ paddingTop: 100 }}>
        <div className="wrap-wide cap" style={{ paddingTop: 40, paddingBottom: 96 }}>
          <p className="lbl mb-2">Welcome back</p>
          <h1 className="hed text-[clamp(40px,7vw,70px)] mb-2">Artist Hub</h1>
          <p className="mb-10" style={{ color: 'var(--fg-70)' }}>{user.email} · <span style={{ color: 'var(--lime)', textTransform: 'capitalize' }}>{user.role}</span></p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '📦', title: 'Order History', desc: 'View your past orders and track deliveries.', href: '/account' },
              { icon: '🎨', title: 'Assets & Downloads', desc: 'Brand assets, marketing materials, and product imagery.', href: '#' },
              { icon: '💰', title: 'Affiliate Dashboard', desc: 'Your referral link, commissions, and payment history.', href: '#' },
              { icon: '📋', title: 'Product Knowledge', desc: 'Technical data sheets, ingredient lists, and training materials.', href: '#' },
              { icon: '🛒', title: 'Trade Ordering', desc: 'Bulk pricing for verified studios and stockists.', href: '/shop-all' },
              { icon: '📊', title: 'Usage Analytics', desc: 'Track your affiliate performance and audience insights.', href: '#' },
            ].map(item => (
              <a key={item.title} href={item.href} className="group flex flex-col gap-3 p-6 rounded-xl transition-all hover:border-[var(--lime)]" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
                <span className="text-3xl">{item.icon}</span>
                <h2 className="font-bold text-lg group-hover:text-[var(--lime)] transition-colors" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{item.title}</h2>
                <p className="text-sm" style={{ color: 'var(--fg-70)' }}>{item.desc}</p>
              </a>
            ))}
          </div>

          {(user.role === 'admin' || user.role === 'owner') && (
            <div className="mt-10">
              <h2 className="hed text-3xl mb-5" style={{ color: 'var(--red)' }}>Admin Access</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <a href="/admin" className="flex items-center gap-4 p-5 rounded-xl" style={{ background: 'rgba(230,30,50,.08)', border: '1px solid rgba(230,30,50,.2)' }}>
                  <span className="text-3xl">⚙️</span>
                  <div>
                    <h3 className="font-bold" style={{ fontFamily: 'var(--font-barlow-condensed)', color: 'var(--red)' }}>Admin Dashboard</h3>
                    <p className="text-sm" style={{ color: 'var(--fg-70)' }}>Orders, analytics, team management</p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
