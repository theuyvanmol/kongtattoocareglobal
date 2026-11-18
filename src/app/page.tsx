import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getProducts, getCollection } from '@/lib/shopify'
import ProductCard from '@/components/ProductCard'
import { defaultMetadata } from '@/lib/metadata'
import type { ShopifyProduct } from '@/lib/types'
import NewsletterForm from '@/components/NewsletterForm'

export const metadata: Metadata = defaultMetadata
export const revalidate = 60

// ── Collection metadata (fallback images for when Shopify collection has no image) ──
const COLLECTION_META: Record<string, { label: string; desc: string; fallbackImg: string; href: string }> = {
  numb:   { label: 'Numb',   desc: 'Pre-session pain relief',  fallbackImg: '/assets/img/img-home-4.webp',  href: '/shop-all?c=numb'   },
  renew:  { label: 'Renew',  desc: 'Healing & repair',         fallbackImg: '/assets/img/img-home-5.webp',  href: '/shop-all?c=renew'  },
  glow:   { label: 'Glow',   desc: 'Vibrance & brightness',    fallbackImg: '/assets/img/img-home-11.webp', href: '/shop-all?c=glow'   },
  defend: { label: 'Defend', desc: 'SPF & protection',         fallbackImg: '/assets/img/img-home-7.webp',  href: '/shop-all?c=defend' },
  expert: { label: 'Expert', desc: 'Studio-grade pro',         fallbackImg: '/assets/img/img-home-8.webp',  href: '/shop-all?c=expert' },
}

const REVIEWS = [
  { name: 'James K.', location: 'Manchester', title: 'Best tattoo aftercare I\'ve tried', body: '"My sleeve healed in record time. No peeling, no itching, the colours came out so clean. The Renew Butter is now a permanent part of my kit."', product: 'Tattoo Butter · Renew Collection' },
  { name: 'Lauren S.', location: 'London', title: 'The Numb Cream is a game changer', body: '"Sat 6 hours for my back piece. The Numb Cream meant I could relax and my artist could focus. This is now what I recommend to everyone at our studio."', product: 'Numb Cream · Numb Collection' },
  { name: 'Priya M.', location: 'Birmingham', title: 'My old tattoos actually look new again', body: '"Been using the Glow Serum on tattoos I got 5 years ago and the difference is unreal. The colours are so much more vivid now. KONG is the real deal."', product: 'Glow Serum · Glow Collection' },
]

const STEPS = [
  { n: '01', t: 'Numb',           d: 'Apply our Numb Cream 45 minutes before your session. Reduces discomfort for longer sittings, so your artist can do their best work.' },
  { n: '02', t: 'Cleanse & Renew', d: 'Within 3 hours of your session, gently cleanse with our Foam Cleanser. Follow with Tattoo Butter while skin is still damp.' },
  { n: '03', t: 'Glow',           d: 'Once healed (2–4 weeks), introduce our Glow Serum. Vitamin C complex brightens and maintains colour saturation long-term.' },
  { n: '04', t: 'Defend',         d: 'Daily SPF protection with our Defend range. UV is ink\'s #1 enemy — protect your investment and keep your art looking fresh.' },
]

const GALLERY_IMGS = [
  { img: '/assets/img/real-tattoo-studio-1.jpg', big: true  },
  { img: '/assets/img/real-barbell-kong.png',    big: false },
  { img: '/assets/img/real-boxing-kong.png',     big: false },
  { img: '/assets/img/real-products-studio.jpg', big: false },
  { img: '/assets/img/real-defend-your-ink.jpg', big: false },
  { img: '/assets/img/real-tattoo-studio-2.jpg', big: false },
]

export default async function HomePage() {
  let products: ShopifyProduct[] = []
  try {
    products = await getProducts(20)
  } catch {}

  // Featured = first 8 real products
  const featured = products.slice(0, 8)
  // Upsell = top 3 real products
  const upsell = products.slice(0, Math.min(3, products.length))

  // Fetch product counts per collection from Shopify
  const collectionHandles = ['numb', 'renew', 'glow', 'defend', 'expert']
  const collectionData = await Promise.all(
    collectionHandles.map(async (handle) => {
      const meta = COLLECTION_META[handle]
      try {
        const coll = await getCollection(handle)
        const count = coll?.products?.edges?.length ?? 0
        return {
          id: handle,
          label: meta.label,
          // Always use local curated image — Shopify collection images aren't set
          img: meta.fallbackImg,
          desc: count > 0 ? `${meta.desc} · ${count} product${count !== 1 ? 's' : ''}` : meta.desc,
          href: meta.href,
        }
      } catch {
        return { id: handle, label: meta.label, desc: meta.desc, img: meta.fallbackImg, href: meta.href }
      }
    })
  )

  return (
    <>
      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        style={{
          position: 'relative',
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          background: '#0a0a0a',
        }}
      >
        {/* Parallax background */}
        <div id="hero-bg" style={{ position: 'absolute', inset: '-20%', willChange: 'transform' }}>
          <Image
            src="/assets/img/real-hero-gym.png"
            alt="KONG Tattoo Care — premium UK aftercare"
            fill
            priority
            className="object-cover object-center"
            style={{ opacity: 0.55 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg,rgba(10,10,10,.96) 0%,rgba(10,10,10,.55) 55%,rgba(10,10,10,.15) 100%),linear-gradient(0deg,rgba(10,10,10,.99) 0%,rgba(10,10,10,.4) 32%,transparent 60%)' }} />
        </div>

        <div className="wrap-wide cap" style={{ position: 'relative', zIndex: 2, paddingBlock: '0 90px', width: '100%', paddingTop: 160 }}>
          <p className="lbl hero-reveal" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 28, height: 1.5, background: 'var(--red)', flexShrink: 0 }} />
            <span style={{ color: 'var(--lime)' }}>Premium Tattoo Care · UK Made</span>
          </p>
          <h1 className="hed hero-reveal hero-reveal-2" style={{ fontSize: 'clamp(52px,11vw,160px)', marginBottom: 20 }}>
            MADE FOR<br />
            <em style={{ color: 'var(--lime)' }}>YOUR</em><br />
            <strong style={{ color: 'var(--red)' }}>ART</strong>
          </h1>
          <p className="hero-reveal hero-reveal-3" style={{ maxWidth: 380, marginBottom: 32, fontSize: 15, lineHeight: 1.75, color: 'rgba(240,240,240,.7)' }}>
            Artist-developed, dermatologist-tested. Five collections engineered to protect your ink from day one.
          </p>
          <div className="hero-reveal hero-reveal-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/shop-all" className="btn btn-red" style={{ fontSize: 14, padding: '14px 28px' }}>Shop All Products</Link>
            <Link href="/about" className="btn btn-out" style={{ fontSize: 14, padding: '14px 28px' }}>Our Story</Link>
          </div>
          <div className="hero-reveal hero-reveal-5" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28 }}>
            <span style={{ color: 'var(--lime)', fontSize: 16, letterSpacing: 1 }}>★★★★★</span>
            <span style={{ fontSize: 12, color: 'rgba(240,240,240,.4)', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, letterSpacing: '.08em' }}>
              4.9 / 5 · <span style={{ color: 'var(--lime)' }}>2,400+ UK reviews</span>
            </span>
          </div>
        </div>

        {/* Scroll indicator — hidden on mobile via CSS */}
        <div className="hero-reveal hero-reveal-5 scroll-indicator" style={{ position: 'absolute', bottom: 32, right: 40, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: 'var(--fg-40)', writingMode: 'vertical-rl' }}>Scroll</div>
          <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, var(--fg-40), transparent)', animation: 'scrollPulse 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ── TICKER ────────────────────────────────────────────────────────── */}
      <div style={{ overflow: 'hidden', borderBlock: '1px solid var(--rule)', background: 'var(--bg2)' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'ticker 40s linear infinite' }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: 'flex' }}>
              {['Free UK Delivery Over £35','Artist-Developed Formula','Dermatologist Tested','No Parabens · No SLS','UK-Made Since 2019','30,000+ Happy Customers','Cruelty Free · Vegan'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 30px', borderRight: '1px solid var(--rule)', whiteSpace: 'nowrap' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--lime)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--fg-40)' }}>{t}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── COLLECTION TABS ───────────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--rule)', position: 'sticky', top: 0, zIndex: 70 }}>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', paddingLeft: 'max(40px,env(safe-area-inset-left,0px))', paddingRight: 'max(40px,env(safe-area-inset-right,0px))' }}>
          {['All Products','Numb','Renew','Glow','Defend','Expert','Bundles'].map((tab, i) => (
            <Link
              key={tab}
              href={i === 0 ? '/shop-all' : `/shop-all?c=${tab.toLowerCase()}`}
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', padding: '14px 20px', borderBottom: i === 0 ? '2px solid var(--lime)' : '2px solid transparent', color: i === 0 ? 'var(--lime)' : 'var(--fg-40)', whiteSpace: 'nowrap', transition: 'all .2s' }}
            >
              {tab}
            </Link>
          ))}
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="wrap-wide cap reveal-section" style={{ paddingBlock: '80px 96px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 40 }}>
            <p className="lbl reveal-child">Top Sellers</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <h2 className="hed reveal-child" style={{ fontSize: 'clamp(36px,6vw,56px)' }}>Bestsellers</h2>
              <Link href="/shop-all" className="btn btn-out reveal-child" style={{ fontSize: 11, padding: '9px 18px' }}>Shop All →</Link>
            </div>
          </div>
          <div className="product-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
            {featured.map((p, idx) => (
              <div key={p.id} className="product-reveal" style={{ '--delay': `${idx * 60}ms` } as React.CSSProperties}>
                <ProductCard product={p} priority={idx < 2} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── UPSELL GRID (Complete Your Routine) ───────────────────────────── */}
      <section className="wrap-wide cap reveal-section" style={{ paddingBlock: '72px 96px', background: 'var(--bg2)' }}>
        <p className="lbl reveal-child">Frequently Bought Together</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginTop: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <h2 className="hed reveal-child" style={{ fontSize: 'clamp(36px,4vw,52px)' }}>Complete Your <em style={{ color: 'var(--lime)' }}>Routine</em></h2>
        </div>
        <p className="reveal-child" style={{ fontSize: 14, color: 'var(--fg-70)', marginBottom: 40 }}>Customers love pairing these products together for the best results.</p>
        <div className="upsell-grid-resp" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginBottom: 40 }}>
          {upsell.map((item, i) => {
            const img = item.images?.edges?.[0]?.node?.url || '/assets/img/real-products-studio.jpg'
            const price = item.priceRange?.minVariantPrice?.amount
              ? `£${parseFloat(item.priceRange.minVariantPrice.amount).toFixed(2)}`
              : ''
            const coll = item.collections?.edges?.[0]?.node?.title || ''
            return (
              <Link
                key={item.id}
                href={`/products/${item.handle}`}
                style={{ background: 'var(--bg)', border: `1px solid ${i === 0 ? 'var(--lime)' : 'var(--rule)'}`, borderRadius: 14, overflow: 'hidden', position: 'relative', display: 'block', transition: 'border-color .3s,transform .25s' }}
                className="upsell-card"
              >
                {i === 0 && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--lime)', color: '#0a0a0a', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 5, zIndex: 2 }}>
                    Most Popular
                  </div>
                )}
                <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg3)', position: 'relative' }}>
                  <Image src={img} alt={item.title} fill className="object-cover" />
                </div>
                <div style={{ padding: 18 }}>
                  {coll && <div style={{ fontSize: 10, color: 'var(--red)', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 6 }}>{coll}</div>}
                  <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontStyle: 'italic', fontSize: 20, textTransform: 'uppercase', marginBottom: 4 }}>{item.title}</div>
                  {item.description && <p style={{ fontSize: 12, color: 'var(--fg-70)', lineHeight: 1.5, marginBottom: 14 }}>{item.description.slice(0, 90)}{item.description.length > 90 ? '…' : ''}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 22, color: 'var(--lime)' }}>{price}</span>
                    <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', padding: '7px 13px', borderRadius: 7, border: '1px solid rgba(200,255,0,.4)', color: 'var(--lime)' }}>+ View</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        {/* Bundle CTA */}
        <div className="reveal-child" style={{ background: 'var(--bg3)', border: '1px solid var(--rule)', borderRadius: 16, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h3 className="hed" style={{ fontSize: 28, marginBottom: 4 }}>The Complete Starter Kit</h3>
            <p style={{ fontSize: 13, color: 'var(--fg-70)' }}>All essentials in one bundle. Save 20% vs. buying separately.</p>
          </div>
          <Link href="/shop-all" className="btn btn-lime">Shop the Bundle →</Link>
        </div>
      </section>

      {/* ── COLLECTIONS GRID ──────────────────────────────────────────────── */}
      <section className="reveal-section" style={{ paddingBlock: 100, background: 'var(--bg)', overflow: 'hidden' }}>
        <div className="wrap-wide cap">
          <p className="lbl reveal-child">Shop by Collection</p>
          <h2 className="hed reveal-child" style={{ fontSize: 'clamp(44px,6vw,88px)', marginTop: 10, marginBottom: 48 }}>Shop by <em style={{ color: 'var(--lime)' }}>Collection</em></h2>
        </div>
        <div className="wrap-wide cap coll-grid-resp" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }} id="coll-grid">
          {collectionData.map((c, i) => (
            <Link
              key={c.id}
              href={c.href}
              style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--rule)', aspectRatio: '3/4', display: 'block', transform: 'translateY(60px)', opacity: 0, transition: `transform .7s cubic-bezier(.16,1,.3,1) ${i*80}ms, opacity .6s ease ${i*80}ms` }}
              className="coll-card-hover coll-card-anim"
            >
              <Image src={c.img} alt={c.label} fill className="object-contain" style={{ transition: 'transform .6s cubic-bezier(.16,1,.3,1)', transform: 'scale(1)', padding: '12px 12px 60px' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(10,10,10,.96) 0%,rgba(10,10,10,.3) 55%,transparent 80%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
                <div className="hed" style={{ fontSize: 26, marginBottom: 3 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-40)', letterSpacing: '.05em' }}>{c.desc}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, background: 'var(--lime)', transform: 'scaleX(0)', transition: 'transform .35s cubic-bezier(.16,1,.3,1)' }} className="coll-line" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── VIDEO SECTION — Instagram Reels ───────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg3)', paddingBlock: 100 }}>
        <div className="parallax-deco" data-speed="0.3" style={{ position: 'absolute', top: '-15%', right: '-5%', width: '55%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,30,50,.06) 0%, transparent 70%)', pointerEvents: 'none', willChange: 'transform' }} />
        <div className="wrap-wide cap reveal-section">
          <p className="lbl reveal-child">Studio Stories</p>
          <h2 className="hed reveal-child" style={{ fontSize: 'clamp(44px,6vw,88px)', marginTop: 10, marginBottom: 48 }}>See It In <em style={{ color: 'var(--red)' }}>Action</em></h2>
          {/* 5 Reels grid — clean video tiles, no Instagram chrome */}
          {(() => {
            const reels = [
              { url: 'https://www.instagram.com/p/Dfu0zViKx-2/', img: '/assets/img/real-tattoo-studio-1.jpg', big: true },
              { url: 'https://www.instagram.com/p/DfVCAM8Nckr/', img: '/assets/img/real-barbell-kong.png', big: false },
              { url: 'https://www.instagram.com/p/DfM76LKqWnH/', img: '/assets/img/real-tattoo-studio-2.jpg', big: false },
              { url: 'https://www.instagram.com/p/DfB8Cruttbb/', img: '/assets/img/real-products-studio.jpg', big: false },
              { url: 'https://www.instagram.com/p/DfPBhDeNhAS/', img: '/assets/img/real-defend-your-ink.jpg', big: false },
            ];
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }} className="ig-grid-resp">
                {reels.map(({ url, img, big }, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank" rel="noopener noreferrer"
                    className="reveal-child ig-card"
                    style={{
                      borderRadius: 16, overflow: 'hidden', background: '#000',
                      position: 'relative', display: 'block', aspectRatio: '9/16',
                      gridColumn: big ? 'span 1' : 'span 1',
                      gridRow: big ? 'span 2' : 'span 1',
                      ...(i === 0 ? { gridColumn: 'span 1', gridRow: 'span 2' } : {}),
                    } as React.CSSProperties}
                  >
                    <Image src={img} alt="KONG Reel" fill className="object-cover" style={{ transition: 'transform .5s ease', opacity: .85 }} />
                    {/* Dark overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(0,0,0,.55) 0%,transparent 50%)' }} />
                    {/* Play icon */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,.35)', transition: 'transform .2s ease, background .2s ease' }} className="ig-play-btn">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6 4l9 5-9 5V4z" fill="#fff"/></svg>
                      </div>
                    </div>
                    {/* Reel label bottom */}
                    <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.5"/><circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="white"/></svg>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Watch Reel</span>
                    </div>
                  </a>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── PHOTO GALLERY ─────────────────────────────────────────────────── */}
      <section className="wrap-wide cap reveal-section" style={{ paddingBlock: 100, background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div>
            <p className="lbl reveal-child">Community Gallery</p>
            <h2 className="hed reveal-child" style={{ fontSize: 'clamp(36px,5vw,72px)', marginTop: 8 }}>Your Ink,<br /><em style={{ color: 'var(--lime)' }}>Your Kong</em></h2>
          </div>
          <a href="https://instagram.com/kongtattoocare_uk" target="_blank" rel="noopener noreferrer" className="btn btn-out reveal-child" style={{ fontSize: 11, padding: '9px 18px' }}>Follow @kongtattoocare_uk</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }} className="gal-grid-resp">
          {GALLERY_IMGS.map(({ img, big }, gi) => (
            <div
              key={img}
              className="gal-item-hover gal-reveal"
              style={{
                overflow: 'hidden', borderRadius: 12, border: '1px solid var(--rule)', position: 'relative',
                ...(big ? { gridColumn: 'span 2', gridRow: 'span 2', aspectRatio: '1/1' } : { gridColumn: 'span 2', aspectRatio: '4/3' }),
                transform: 'scale(.95)', opacity: 0,
                transition: `transform .6s cubic-bezier(.16,1,.3,1) ${gi*60}ms, opacity .5s ease ${gi*60}ms`,
              }}
            >
              <Image src={img} alt="KONG community" fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" style={{ transition: 'transform .6s cubic-bezier(.16,1,.3,1)' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESS STEPS ─────────────────────────────────────────────────── */}
      <section style={{ paddingBlock: 100, background: 'var(--bg3)', position: 'relative', overflow: 'hidden' }}>
        {/* Animated lime line */}
        <div className="parallax-deco" data-speed="0.2" style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '70%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,255,0,.04) 0%, transparent 70%)', pointerEvents: 'none', willChange: 'transform' }} />
        <div className="wrap-wide cap reveal-section">
          <p className="lbl reveal-child">How It Works</p>
          <h2 className="hed reveal-child" style={{ fontSize: 'clamp(44px,6vw,88px)', marginTop: 10, marginBottom: 52 }}>The Kong <em style={{ color: 'var(--lime)' }}>Method</em></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 28, position: 'relative' }} className="steps-grid-resp">
            <div style={{ position: 'absolute', top: 27, left: 'calc(12.5% + 28px)', right: 'calc(12.5% + 28px)', height: 2, background: 'linear-gradient(90deg,var(--red) 0%,var(--red) 50%,var(--lime) 100%)', zIndex: 0 }} className="steps-line-resp" />
            {STEPS.map((s, si) => (
              <div key={s.n} className="reveal-child" style={{ position: 'relative', zIndex: 1, '--delay': `${si*120}ms` } as React.CSSProperties}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--red)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 20, color: '#fff', marginBottom: 18, transition: 'transform .3s, box-shadow .3s' }} className="step-num">
                  {s.n}
                </div>
                <h3 className="hed" style={{ fontSize: 20, marginBottom: 8 }}>{s.t}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--fg-70)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--red)', paddingBlock: 60, overflow: 'hidden', position: 'relative' }}>
        <div className="parallax-deco" data-speed="-0.15" style={{ position: 'absolute', top: '-80%', right: '-5%', width: '40%', aspectRatio: '1', borderRadius: '50%', background: 'rgba(0,0,0,.12)', pointerEvents: 'none', willChange: 'transform' }} />
        <div className="wrap-wide cap stats-grid-resp" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {[
            { n: '30K+', l: 'Happy UK Customers' },
            { n: '97%',  l: 'Satisfaction Rate'  },
            { n: '5',    l: 'Years Perfecting'   },
            { n: '2,400+', l: 'Verified Reviews' },
          ].map((s, si) => (
            <div key={s.l} className="stat-reveal" style={{ transform: 'translateY(30px)', opacity: 0, transition: `transform .6s cubic-bezier(.16,1,.3,1) ${si*100}ms, opacity .5s ease ${si*100}ms` }}>
              <div className="hed" style={{ fontSize: 'clamp(44px,5vw,72px)', color: '#fff', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── REVIEWS ───────────────────────────────────────────────────────── */}
      <section className="wrap-wide cap reveal-section" style={{ paddingBlock: 100, background: 'var(--bg2)' }}>
        <p className="lbl reveal-child">Customer Reviews</p>
        <h2 className="hed reveal-child" style={{ fontSize: 'clamp(44px,6vw,88px)', marginTop: 10, marginBottom: 52 }}>What UK <em style={{ color: 'var(--lime)' }}>Customers</em> Say</h2>
        <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start', marginBottom: 52, flexWrap: 'wrap' }}>
          <div className="reveal-child">
            <div className="hed" style={{ fontSize: 96, color: 'var(--lime)', lineHeight: 1 }}>4.9</div>
            <div style={{ color: '#FFB700', fontSize: 22, letterSpacing: 2 }}>★★★★★</div>
            <div style={{ fontSize: 13, color: 'var(--fg-40)', marginTop: 6, fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, letterSpacing: '.08em' }}>From 2,400+ verified reviews</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }} className="reveal-child">
            {[['5★','88%'],['4★','9%'],['3★','2%'],['2★','1%'],['1★','0%']].map(([lbl, pct]) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 11, letterSpacing: '.1em', color: 'var(--fg-40)', width: 36, textAlign: 'right', flexShrink: 0 }}>{lbl}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--rule)', borderRadius: 3, overflow: 'hidden' }}>
                  <div className="bar-fill" style={{ height: '100%', background: 'var(--lime)', borderRadius: 3, width: 0, transition: 'width 1.2s cubic-bezier(.16,1,.3,1)', '--target': pct } as React.CSSProperties} />
                </div>
                <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 11, color: 'var(--fg-40)', width: 28, flexShrink: 0 }}>{pct}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="rev-grid-resp">
          {REVIEWS.map((r, ri) => (
            <div key={r.name} className="reveal-child" style={{ background: 'var(--bg)', border: '1px solid var(--rule)', borderRadius: 14, padding: 22, '--delay': `${ri*100}ms` } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <span style={{ color: '#FFB700', fontSize: 14, letterSpacing: 1 }}>★★★★★</span>
                <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--lime)', background: 'var(--lime-g)', padding: '3px 7px', borderRadius: 4 }}>Verified UK buyer</span>
              </div>
              <h3 className="hed" style={{ fontSize: 17, marginBottom: 8 }}>{r.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--fg-70)', marginBottom: 14 }}>{r.body}</p>
              <div style={{ fontSize: 11, color: 'var(--fg-40)', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                {r.name} · {r.location}
                <span style={{ color: 'var(--red)', display: 'block', marginTop: 2 }}>{r.product}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/shop-all" className="btn btn-out">Read All 2,400+ Reviews</Link>
        </div>
      </section>

      {/* ── ARTIST FEATURE — Dale Nathan ──────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBlock: 100, background: 'var(--bg)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 72, alignItems: 'center' }} className="artist-grid-resp">
          <div className="reveal-left" style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/5' }}>
            <Image src="/assets/img/real-tattoo-studio-1.jpg" alt="Dale Nathan Tattoo" fill className="object-cover" />
            <div style={{ position: 'absolute', inset: -2, borderRadius: 'inherit', border: '2px solid var(--lime)', pointerEvents: 'none' }} />
          </div>
          <div className="reveal-right" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <p className="lbl">Artist Feature</p>
            <div className="hed" style={{ fontSize: 120, color: 'var(--red)', lineHeight: .6, opacity: .5 }}>&ldquo;</div>
            <blockquote className="hed" style={{ fontSize: 'clamp(22px,2.5vw,34px)' }}>
              &ldquo;KONG keeps my clients&apos; ink looking fresh longer. It&apos;s the only aftercare I trust in my studio.&rdquo;
            </blockquote>
            <div>
              <strong style={{ color: 'var(--lime)', fontFamily: 'var(--font-barlow-condensed)', fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block' }}>Dale Nathan Tattoo</strong>
              <span style={{ fontSize: 12, color: 'var(--fg-40)' }}>KONG Ambassador · Award-Winning UK Tattoo Artist</span>
            </div>
            {/* Discount code */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(200,255,0,.07)', border: '1.5px solid rgba(200,255,0,.35)', borderRadius: 12, padding: '14px 20px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 9, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--fg-40)', marginBottom: 3 }}>Exclusive Discount</div>
                <div className="hed" style={{ fontSize: 26, color: 'var(--lime)', letterSpacing: '.06em' }}>DNTKONG10</div>
              </div>
              <div style={{ width: 1, height: 36, background: 'rgba(200,255,0,.2)', flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: 'var(--fg-70)', lineHeight: 1.5 }}>
                <strong style={{ color: '#fff', display: 'block' }}>10% off your order</strong>
                Add at checkout
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/shop-all" className="btn btn-lime">Shop with Dale&apos;s Code</Link>
              <a href="https://www.instagram.com/dalenathantattoo" target="_blank" rel="noopener noreferrer" className="btn btn-out">Follow Dale →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section id="cta-section" style={{ position: 'relative', overflow: 'hidden', minHeight: '70vh', display: 'flex', alignItems: 'center', background: '#0a0a0a' }}>
        <div id="cta-bg" style={{ position: 'absolute', inset: '-20%', willChange: 'transform' }}>
          <Image src="/assets/img/real-defend-your-ink.jpg" alt="" fill className="object-cover object-center" style={{ opacity: 0.55 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,rgba(10,10,10,.98) 0%,rgba(10,10,10,.7) 55%,rgba(10,10,10,.25) 100%)' }} />
        </div>
        <div className="wrap-wide cap reveal-section" style={{ position: 'relative', zIndex: 2, paddingBlock: 90 }}>
          <p className="lbl reveal-child">Start Your Routine</p>
          <h2 className="hed reveal-child" style={{ fontSize: 'clamp(52px,8vw,120px)', marginBlock: '12px 24px' }}>Protect<br /><em style={{ color: 'var(--lime)' }}>Your Art</em></h2>
          <p className="reveal-child" style={{ fontSize: 15, color: 'var(--fg-70)', maxWidth: 380, lineHeight: 1.75, marginBottom: 32 }}>Premium tattoo care backed by science, trusted by UK artists. Free delivery over £35.</p>
          <div className="reveal-child" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/shop-all" className="btn btn-red">Shop the Full Range</Link>
            <Link href="/shop-all" className="btn btn-out">View All Collections</Link>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
      <section className="wrap-wide cap reveal-section" style={{ paddingBlock: 96 }}>
        <div style={{ borderRadius: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '10px 14px 32px', background: 'var(--red)' }} className="newsletter-row">
          <div style={{ flex: 1, textAlign: 'center', padding: '24px 0 16px' }}>
            <h2 className="hed reveal-child" style={{ fontSize: 'clamp(36px,6vw,56px)', color: '#fff', marginBottom: 8 }}>Join the Kingdom</h2>
            <p className="reveal-child" style={{ color: 'rgba(255,255,255,.8)', fontSize: 15, maxWidth: 420 }}>Subscribe for exclusive drops, artist collabs, early access and 10% off your first order.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <Footer />

      {/* ── ALL ANIMATIONS & PARALLAX ─────────────────────────────────────── */}
      <style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes scrollPulse { 0%,100% { opacity:.4; transform: scaleY(.8) } 50% { opacity:1; transform: scaleY(1) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeLeft { from { opacity:0; transform:translateX(-60px) } to { opacity:1; transform:translateX(0) } }
        @keyframes fadeRight { from { opacity:0; transform:translateX(60px) } to { opacity:1; transform:translateX(0) } }

        /* Hero entrance */
        .hero-reveal { opacity:0; transform:translateY(30px); animation: fadeUp .8s cubic-bezier(.16,1,.3,1) forwards; }
        .hero-reveal-2 { animation-delay:.12s }
        .hero-reveal-3 { animation-delay:.24s }
        .hero-reveal-4 { animation-delay:.36s }
        .hero-reveal-5 { animation-delay:.48s }

        /* Scroll reveals */
        .reveal-child {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity .65s ease, transform .65s cubic-bezier(.16,1,.3,1);
          transition-delay: var(--delay, 0ms);
        }
        .reveal-child.in { opacity:1; transform:translateY(0) }

        .reveal-left {
          opacity:0; transform:translateX(-60px);
          transition: opacity .8s ease, transform .8s cubic-bezier(.16,1,.3,1);
        }
        .reveal-left.in { opacity:1; transform:translateX(0) }

        .reveal-right {
          opacity:0; transform:translateX(60px);
          transition: opacity .8s ease .1s, transform .8s cubic-bezier(.16,1,.3,1) .1s;
        }
        .reveal-right.in { opacity:1; transform:translateX(0) }

        /* Collection cards */
        .coll-card-anim.in { opacity:1 !important; transform:translateY(0) !important; }
        .coll-card-hover:hover img { transform: scale(1) !important; }
        .coll-card-hover:hover .coll-line { transform: scaleX(1) !important; }

        /* Gallery items */
        .gal-reveal.in { opacity:1 !important; transform:scale(1) !important; }
        .gal-item-hover:hover img { transform: scale(1.06) !important; }

        /* Product card reveal */
        .product-reveal {
          opacity:0; transform:translateY(28px);
          transition: opacity .55s ease var(--delay, 0ms), transform .55s cubic-bezier(.16,1,.3,1) var(--delay, 0ms);
        }
        .product-reveal.in { opacity:1; transform:translateY(0) }

        /* Stats */
        .stat-reveal.in { opacity:1 !important; transform:translateY(0) !important; }

        /* Upsell cards */
        .upsell-card:hover { border-color: var(--lime) !important; transform: translateY(-4px) !important; }

        /* Step numbers */
        .step-num:hover { transform:scale(1.15) rotate(-5deg); box-shadow:0 0 24px rgba(230,30,50,.5); }

        /* Play button */
        .play-btn:hover { transform:scale(1.12); background:rgba(230,30,50,.7) !important; }

        /* Bar fills animate in */
        .bar-fill.in { width: var(--target) !important; }

        /* Responsive */
        /* Instagram embed cards */
        .ig-card { text-decoration: none; }
        .ig-card:hover img { transform: scale(1.05); }
        .ig-card:hover .ig-play-btn { transform: scale(1.15); background: rgba(230,30,50,.7) !important; border-color: rgba(230,30,50,.8) !important; }
        @media(max-width:640px){ .ig-grid-resp { grid-template-columns: repeat(2,1fr) !important; } .ig-grid-resp a[style*="span 2"] { grid-row: span 1 !important; } }
        .ig-card:hover { border-color: var(--lime) !important; }

        @media (max-width: 1100px) {
          .coll-grid-resp { grid-template-columns: repeat(3,1fr) !important; }
          .gal-grid-resp { grid-template-columns: repeat(3,1fr) !important; grid-template-rows: auto !important; }
          .gal-grid-resp > * { grid-column: span 1 !important; grid-row: span 1 !important; height: 200px; }
        }
        @media (max-width: 768px) {
          .coll-grid-resp { grid-template-columns: repeat(2,1fr) !important; }
          .rev-grid-resp { grid-template-columns: 1fr !important; }
          .steps-grid-resp { grid-template-columns: repeat(2,1fr) !important; }
          .steps-line-resp { display: none !important; }
          .stats-grid-resp { grid-template-columns: repeat(2,1fr) !important; }
          .newsletter-row { flex-direction: column !important; }
          /* Instagram grid: single column on mobile */
          .ig-grid-resp { grid-template-columns: 1fr !important; }
          .ig-grid-resp > *:first-child { grid-row: span 1 !important; }
          .ig-row2-resp { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-reveal, .reveal-child, .reveal-left, .reveal-right,
          .coll-card-anim, .gal-reveal, .product-reveal, .stat-reveal {
            animation: none !important; opacity:1 !important; transform:none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Parallax + scroll reveal script */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  /* ── Parallax ─────────────────────────────────── */
  var heroBg = document.getElementById('hero-bg');
  var ctaBg  = document.getElementById('cta-bg');
  var decos  = document.querySelectorAll('.parallax-deco');

  function onScroll(){
    var sy = window.scrollY;
    if(heroBg){
      var pct = sy / (window.innerHeight * 1.5);
      heroBg.style.transform = 'translateY(' + (sy * 0.4) + 'px)';
    }
    if(ctaBg){
      var ctaEl = document.getElementById('cta-section');
      if(ctaEl){
        var rect = ctaEl.getBoundingClientRect();
        var prog = -rect.top / window.innerHeight;
        ctaBg.style.transform = 'translateY(' + (prog * -80) + 'px)';
      }
    }
    decos.forEach(function(d){
      var speed = parseFloat(d.getAttribute('data-speed') || '0.2');
      var rect = d.parentElement.getBoundingClientRect();
      var prog = (window.innerHeight * .5 - rect.top) / window.innerHeight;
      d.style.transform = 'translateY(' + (prog * speed * 180) + 'px)';
    });
  }

  /* ── Scroll Reveal ────────────────────────────── */
  function reveal(){
    // Simple reveal-child / reveal-left / reveal-right
    ['reveal-child','reveal-left','reveal-right'].forEach(function(cls){
      document.querySelectorAll('.' + cls + ':not(.in)').forEach(function(el){
        var r = el.getBoundingClientRect();
        if(r.top < window.innerHeight * .88){
          el.classList.add('in');
        }
      });
    });

    // Collection cards
    var collGrid = document.getElementById('coll-grid');
    if(collGrid){
      var r = collGrid.getBoundingClientRect();
      if(r.top < window.innerHeight * .85){
        collGrid.querySelectorAll('.coll-card-anim').forEach(function(el){
          el.classList.add('in');
        });
      }
    }

    // Gallery
    document.querySelectorAll('.gal-reveal:not(.in)').forEach(function(el){
      var r = el.getBoundingClientRect();
      if(r.top < window.innerHeight * .88){ el.classList.add('in'); }
    });

    // Products
    document.querySelectorAll('.product-reveal:not(.in)').forEach(function(el){
      var r = el.getBoundingClientRect();
      if(r.top < window.innerHeight * .9){ el.classList.add('in'); }
    });

    // Stats
    document.querySelectorAll('.stat-reveal:not(.in)').forEach(function(el){
      var r = el.getBoundingClientRect();
      if(r.top < window.innerHeight * .9){ el.classList.add('in'); }
    });

    // Review bars animate in
    document.querySelectorAll('.bar-fill:not(.in)').forEach(function(el){
      var r = el.getBoundingClientRect();
      if(r.top < window.innerHeight * .88){ el.classList.add('in'); }
    });
  }

  window.addEventListener('scroll', function(){
    onScroll();
    reveal();
  }, { passive: true });

  // Initial call
  setTimeout(function(){
    onScroll();
    reveal();
  }, 100);
})();
      `}} />
    </>
  )
}
