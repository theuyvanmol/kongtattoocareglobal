import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getProducts } from '@/lib/shopify'
import ProductCard from '@/components/ProductCard'
import { defaultMetadata } from '@/lib/metadata'
import type { ShopifyProduct } from '@/lib/types'
import NewsletterForm from '@/components/NewsletterForm'

export const metadata: Metadata = defaultMetadata

export const revalidate = 60

const COLLECTIONS = [
  { id: 'numb', label: 'Numb', desc: 'Before & during your session', emoji: '⚡', href: '/shop-all?c=numb' },
  { id: 'renew', label: 'Renew', desc: 'The first days after your tattoo', emoji: '🌿', href: '/shop-all?c=renew' },
  { id: 'glow', label: 'Glow', desc: 'Long-term colour protection', emoji: '✨', href: '/shop-all?c=glow' },
  { id: 'defend', label: 'Defend', desc: 'SPF & barrier protection', emoji: '🛡️', href: '/shop-all?c=defend' },
  { id: 'expert', label: 'Expert', desc: 'Professional studio essentials', emoji: '💉', href: '/shop-all?c=expert' },
]

export default async function HomePage() {
  let products: ShopifyProduct[] = []
  try {
    const data = await getProducts(8)
    products = data.slice(0, 4)
  } catch {}

  return (
    <>
      <Nav />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '100svh', background: 'var(--bg3)' }}>
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/img/img-home-1.webp"
            alt="KONG Tattoo Care — premium UK aftercare"
            fill
            priority
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,.3) 0%, rgba(10,10,10,.85) 100%)' }} />
        </div>

        <div className="relative z-10 wrap-wide cap flex flex-col justify-end" style={{ minHeight: '100svh', paddingBottom: 80, paddingTop: 160 }}>
          <p className="lbl mb-4" data-reveal>Premium UK Tattoo Aftercare</p>
          <h1 className="hed text-[clamp(60px,12vw,120px)] max-w-3xl mb-6" data-reveal data-d="1">
            Built for the<br /><span style={{ color: 'var(--red)' }}>Culture.</span>
          </h1>
          <p className="text-lg max-w-lg mb-10 leading-relaxed" style={{ color: 'rgba(240,240,240,.7)' }} data-reveal data-d="2">
            Artist-developed, dermatologist-tested. Five collections engineered to protect your ink from day one.
          </p>
          <div className="flex flex-col sm:flex-row gap-3" data-reveal data-d="3">
            <Link href="/shop-all" className="btn btn-red text-base px-8 py-4">Shop All Products</Link>
            <Link href="/about" className="btn btn-out text-base px-8 py-4">Our Story</Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mt-14" data-reveal data-d="4">
            {[
              { n: '50K+', l: 'Happy Customers' },
              { n: '5★', l: 'Average Rating' },
              { n: 'Free', l: 'UK Delivery Over £35' },
            ].map(b => (
              <div key={b.n} className="flex flex-col">
                <span className="hed text-3xl" style={{ color: 'var(--lime)' }}>{b.n}</span>
                <span style={{ color: 'rgba(240,240,240,.5)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', fontFamily: 'var(--font-barlow-condensed)' }}>{b.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────────── */}
      <div className="overflow-hidden py-3.5" style={{ background: 'var(--red)' }}>
        <div className="flex gap-10 whitespace-nowrap" style={{ animation: 'ticker 22s linear infinite' }}>
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="flex gap-10" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800, fontSize: 11, letterSpacing: '.22em', color: '#fff' }}>
              {['ARTIST DEVELOPED', 'DERMATOLOGIST TESTED', 'FREE UK DELIVERY OVER £35', 'USE CODE KONG10 · 10% OFF'].map(t => (
                <span key={t}>{t} &nbsp;·&nbsp;</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── COLLECTIONS ──────────────────────────────────────────────── */}
      <section id="collections" className="wrap-wide cap" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="lbl mb-2">Our Collections</p>
            <h2 className="hed text-[clamp(36px,6vw,56px)]">Every Stage.<br />One Brand.</h2>
          </div>
          <Link href="/shop-all" className="btn btn-out text-xs whitespace-nowrap">View All →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {COLLECTIONS.map((c, i) => (
            <Link
              key={c.id}
              href={c.href}
              className="group relative rounded-xl overflow-hidden flex flex-col items-start p-5"
              style={{ background: 'var(--bg2)', border: '1px solid var(--rule)', minHeight: 160, animationDelay: `${i * 0.07}s` }}
            >
              <span className="text-3xl mb-3">{c.emoji}</span>
              <span className="hed text-2xl block mb-1 group-hover:text-[var(--lime)] transition-colors">{c.label}</span>
              <span className="text-xs" style={{ color: 'var(--fg-70)' }}>{c.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────── */}
      {products.length > 0 && (
        <section className="wrap-wide cap" style={{ paddingBottom: 96 }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="lbl mb-2">Top Sellers</p>
              <h2 className="hed text-[clamp(36px,6vw,56px)]">Bestsellers</h2>
            </div>
            <Link href="/shop-all" className="btn btn-out text-xs whitespace-nowrap">Shop All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p, idx) => (
              <ProductCard key={p.id} product={p} priority={idx < 2} />
            ))}
          </div>
        </section>
      )}

      {/* ── USP STRIP ────────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBottom: 96 }}>
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x" style={{ '--tw-divide-opacity': '1', borderColor: 'var(--rule)' } as React.CSSProperties}>
            {[
              { icon: '🎨', title: 'Artist Developed', body: 'Created with working tattoo artists for real-world results.' },
              { icon: '🔬', title: 'Dermatologist Tested', body: 'Clinically tested formulas, proven safe on fresh ink.' },
              { icon: '🚚', title: 'Free UK Delivery', body: 'On all orders over £35. Fast dispatch, tracked shipping.' },
              { icon: '♻️', title: 'Sustainable', body: 'Eco-conscious packaging. Because the planet matters too.' },
            ].map(u => (
              <div key={u.title} className="flex flex-col gap-2 p-6 md:p-8">
                <span className="text-3xl">{u.icon}</span>
                <h3 className="font-bold text-base" style={{ fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.03em' }}>{u.title}</h3>
                <p className="text-sm" style={{ color: 'var(--fg-70)', lineHeight: 1.65 }}>{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBottom: 96 }}>
        <div className="rounded-2xl flex flex-col md:flex-row items-center gap-8 p-10 md:p-14" style={{ background: 'var(--red)' }}>
          <div className="flex-1">
            <h2 className="hed text-[clamp(36px,6vw,56px)] text-white mb-3">Join the Kingdom</h2>
            <p className="text-white/80 text-base max-w-md">Subscribe for exclusive drops, artist collabs, early access and 10% off your first order.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <Footer />

      {/* Reveal scroll observer */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          if(!('IntersectionObserver' in window)) return;
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('on'); });
          }, { threshold: 0.1 });
          document.querySelectorAll('[data-reveal]').forEach(function(el){ io.observe(el); });
        })();
      ` }} />
    </>
  )
}
