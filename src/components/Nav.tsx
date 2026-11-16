'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const LINKS = [
  { href: '/shop-all', label: 'Shop' },
  { href: '/#collections', label: 'Collections' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Journal' },
  { href: '/kong-kingdom', label: 'Kingdom' },
]

export default function Nav({ active }: { active?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const updateCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('kong-cart-v2') || '[]')
        setCartCount(cart.reduce((n: number, x: { qty?: number }) => n + (x.qty || 1), 0))
      } catch {}
    }
    updateCart()
    window.addEventListener('kong:cart-updated', updateCart)
    window.addEventListener('storage', updateCart)
    return () => {
      window.removeEventListener('kong:cart-updated', updateCart)
      window.removeEventListener('storage', updateCart)
    }
  }, [])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile overlay menu */}
      {mobileOpen && (
        <nav
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-2"
          style={{ background: 'var(--bg)' }}
          aria-label="Mobile navigation"
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-5 right-5 text-3xl p-2"
            aria-label="Close navigation"
          >✕</button>
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="hed text-[clamp(44px,11vw,72px)] hover:text-[var(--red)]"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setMobileOpen(false)} className="mt-2 text-lg" style={{ color: 'var(--fg-70)' }}>Login →</Link>
          <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-base" style={{ color: 'var(--fg-40)' }}>Admin →</Link>
          <Link href="/checkout" onClick={() => setMobileOpen(false)} className="text-lg font-bold" style={{ color: 'var(--lime)' }}>Checkout →</Link>
        </nav>
      )}

      {/* Top bar */}
      <div
        className="text-center py-2.5 px-5 relative z-[60] text-white text-[11px] tracking-[.22em] uppercase font-bold"
        style={{ background: 'var(--red)', fontFamily: 'var(--font-barlow-condensed)' }}
      >
        Free UK delivery over £35 &nbsp;·&nbsp; Use code <strong>KONG10</strong> for 10% off &nbsp;·&nbsp; Artist-developed · Dermatologist-tested
      </div>

      {/* Main nav */}
      <nav
        id="main-nav"
        className="fixed left-0 right-0 z-[80] transition-all duration-300"
        style={{
          top: 0,
          paddingTop: scrolled ? 'env(safe-area-inset-top, 0px)' : 'calc(36px + env(safe-area-inset-top, 0px))',
          background: scrolled ? 'var(--bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(28px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(28px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--rule)' : '1px solid transparent',
        }}
        aria-label="Main navigation"
      >
        <div className="wrap-wide cap flex items-center gap-7 py-3.5">
          {/* Logo */}
          <Link href="/" aria-label="KONG Tattoo Care UK home" className="flex-shrink-0">
            <Image
              src="/assets/img/img-home-1.webp"
              alt="KONG Tattoo Care"
              width={80}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex gap-6 list-none m-0 mx-auto" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-70)' }}>
            {LINKS.map(l => (
              <li key={l.href}>
                <Link href={l.href} className={`hover:text-[var(--lime)] transition-colors ${active === l.href ? 'text-[var(--lime)]' : ''}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-auto md:ml-0">
            {/* Admin — desktop only, subtle */}
            <Link href="/admin" className="hidden md:flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg" style={{ color: 'var(--fg-40)', border: '1px solid var(--rule)', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Admin
            </Link>
            {/* Login — desktop only */}
            <Link href="/login" className="hidden md:flex btn btn-out text-[11px] py-2 px-4">Login</Link>
            {/* Shop CTA — desktop only */}
            <Link href="/shop-all" className="hidden md:flex btn btn-red text-[11px] py-2 px-4">Shop Now</Link>
            {/* Cart */}
            <Link href="/checkout" className="relative flex items-center gap-1.5 p-2 touch-manipulation" aria-label="Go to checkout" style={{ color: 'var(--fg-70)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black grid place-items:center" style={{ background: 'var(--lime)', color: '#0a0a0a', fontFamily: 'var(--font-barlow-condensed)', display: 'grid', placeItems: 'center' }}>
                  {cartCount}
                </span>
              )}
            </Link>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex md:hidden flex-col gap-[5px] p-1.5 touch-manipulation"
              aria-label="Open mobile menu"
              aria-expanded={mobileOpen}
            >
              <span className="block w-5.5 h-[1.5px]" style={{ background: 'var(--fg)' }} />
              <span className="block w-5.5 h-[1.5px]" style={{ background: 'var(--fg)' }} />
              <span className="block w-5.5 h-[1.5px]" style={{ background: 'var(--fg)' }} />
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
