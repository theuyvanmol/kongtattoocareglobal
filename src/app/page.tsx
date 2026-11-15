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

// ── Collection data ─────────────────────────────────────────────────────────
const COLLECTIONS = [
  { id: 'numb',   label: 'Numb',   desc: 'Pre-session pain relief · 3 products',   img: '/assets/img/img-home-4.webp',  href: '/shop-all?c=numb'   },
  { id: 'renew',  label: 'Renew',  desc: 'Healing & repair · 5 products',           img: '/assets/img/img-home-7.webp',  href: '/shop-all?c=renew'  },
  { id: 'glow',   label: 'Glow',   desc: 'Vibrance & brightness · 4 products',      img: '/assets/img/img-home-10.webp', href: '/shop-all?c=glow'   },
  { id: 'defend', label: 'Defend', desc: 'SPF & protection · 3 products',           img: '/assets/img/img-home-13.webp', href: '/shop-all?c=defend' },
  { id: 'expert', label: 'Expert', desc: 'Studio-grade pro · 6 products',           img: '/assets/img/img-home-16.webp', href: '/shop-all?c=expert' },
]

const UPSELL = [
  { name: 'Foam Cleanser',   coll: 'Renew Collection',  price: '£18.99', desc: 'pH-balanced formula. Removes bacteria, oils and plasma from fresh ink. Essential for the first 2 weeks.', img: '/assets/img/img-product-2.webp', badge: 'Most Popular' },
  { name: 'Numb Cream',      coll: 'Numb Collection',   price: '£29.99', desc: 'Pre-session topical anaesthetic. Reduces discomfort for longer sittings. Trusted by UK studios.', img: '/assets/img/img-product-5.webp', badge: null },
  { name: 'Glow Serum',      coll: 'Glow Collection',   price: '£22.99', desc: 'Vitamin C brightening complex. Keeps colour saturation vivid for years after healing.', img: '/assets/img/img-product-8.webp', badge: null },
]

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
  { img: '/assets/img/img-home-1.webp',  cls: 'g1', span: 'col-span-2 row-span-2' },
  { img: '/assets/img/img-home-3.webp',  cls: 'g2', span: 'col-span-2' },
  { img: '/assets/img/img-home-5.webp',  cls: 'g3', span: 'col-span-2' },
  { img: '/assets/img/img-home-8.webp',  cls: 'g4', span: 'col-span-1' },
  { img: '/assets/img/img-home-9.webp',  cls: 'g5', span: 'col-span-1' },
  { img: '/assets/img/img-home-11.webp', cls: 'g6', span: 'col-span-2' },
]

const SOC_IMGS = [
  '/assets/img/img-home-1.webp',
  '/assets/img/img-home-3.webp',
  '/assets/img/img-home-5.webp',
  '/assets/img/img-home-7.webp',
  '/assets/img/img-home-9.webp',
  '/assets/img/img-home-11.webp',
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

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          background: 'var(--bg3)',
        }}
      >
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Image
            src="/assets/img/img-home-1.webp"
            alt="KONG Tattoo Care — premium UK aftercare"
            fill
            priority
            className="object-cover object-center"
            style={{ opacity: 0.45 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg,rgba(10,10,10,.96) 0%,rgba(10,10,10,.55) 55%,rgba(10,10,10,.15) 100%),linear-gradient(0deg,rgba(10,10,10,.99) 0%,rgba(10,10,10,.4) 32%,transparent 60%)' }} />
        </div>

        <div className="wrap-wide cap" style={{ position: 'relative', zIndex: 2, paddingBlock: '0 90px', width: '100%', paddingTop: 160 }}>
          <p className="lbl" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 28, height: 1.5, background: 'var(--red)', flexShrink: 0 }} />
            <span style={{ color: 'var(--lime)' }}>Premium Tattoo Care · UK Made</span>
          </p>
          <h1 className="hed" style={{ fontSize: 'clamp(68px,11vw,160px)', marginBottom: 20 }}>
            MADE FOR<br />
            <em style={{ color: 'var(--lime)' }}>YOUR</em><br />
            <strong style={{ color: 'var(--red)' }}>ART</strong>
          </h1>
          <p style={{ maxWidth: 380, marginBottom: 32, fontSize: 15, lineHeight: 1.75, color: 'rgba(240,240,240,.7)' }}>
            Artist-developed, dermatologist-tested. Five collections engineered to protect your ink from day one.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/shop-all" className="btn btn-red" style={{ fontSize: 14, padding: '14px 28px' }}>Shop All Products</Link>
            <Link href="/about" className="btn btn-out" style={{ fontSize: 14, padding: '14px 28px' }}>Our Story</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28 }}>
            <span style={{ color: 'var(--lime)', fontSize: 16, letterSpacing: 1 }}>★★★★★</span>
            <span style={{ fontSize: 12, color: 'rgba(240,240,240,.4)', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, letterSpacing: '.08em' }}>
              4.9 / 5 · <span style={{ color: 'var(--lime)' }}>2,400+ UK reviews</span>
            </span>
          </div>
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

      {/* ── COLLECTION NAV (sticky tabs) ─────────────────────────────────── */}
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
      {products.length > 0 && (
        <section className="wrap-wide cap" style={{ paddingBlock: '80px 96px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 40 }}>
            <p className="lbl">Top Sellers</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <h2 className="hed" style={{ fontSize: 'clamp(36px,6vw,56px)' }}>Bestsellers</h2>
              <Link href="/shop-all" className="btn btn-out" style={{ fontSize: 11, padding: '9px 18px' }}>Shop All →</Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
            {products.map((p, idx) => (
              <ProductCard key={p.id} product={p} priority={idx < 2} />
            ))}
          </div>
        </section>
      )}

      {/* ── UPSELL GRID ───────────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBlock: '72px 96px', background: 'var(--bg2)' }}>
        <p className="lbl">Frequently Bought Together</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginTop: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <h2 className="hed" style={{ fontSize: 'clamp(36px,4vw,52px)' }}>Complete Your <em style={{ color: 'var(--lime)' }}>Routine</em></h2>
        </div>
        <p style={{ fontSize: 14, color: 'var(--fg-70)', marginBottom: 40 }}>Customers who bought Tattoo Butter also added these to their order.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginBottom: 40 }}>
          {UPSELL.map((item, i) => (
            <div key={item.name} style={{ background: 'var(--bg)', border: `1px solid ${i === 0 ? 'var(--lime)' : 'var(--rule)'}`, borderRadius: 14, overflow: 'hidden', position: 'relative', transition: 'border-color .3s,transform .25s', cursor: 'pointer' }}>
              {item.badge && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--lime)', color: '#0a0a0a', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800, fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 5, zIndex: 2 }}>
                  {item.badge}
                </div>
              )}
              <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg3)', position: 'relative' }}>
                <Image src={item.img} alt={item.name} fill className="object-cover" />
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 10, color: 'var(--red)', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 6 }}>{item.coll}</div>
                <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontStyle: 'italic', fontSize: 20, textTransform: 'uppercase', marginBottom: 4 }}>{item.name}</div>
                <p style={{ fontSize: 12, color: 'var(--fg-70)', lineHeight: 1.5, marginBottom: 14 }}>{item.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 22, color: 'var(--lime)' }}>{item.price}</span>
                  <Link href="/shop-all" style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', padding: '7px 13px', borderRadius: 7, border: '1px solid rgba(200,255,0,.4)', color: 'var(--lime)' }}>+ Add</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Bundle CTA */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--rule)', borderRadius: 16, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h3 className="hed" style={{ fontSize: 28, marginBottom: 4 }}>The Complete Starter Kit</h3>
            <p style={{ fontSize: 13, color: 'var(--fg-70)' }}>All 3 essentials in one bundle. Save 20% vs. buying separately.</p>
          </div>
          <div>
            <div className="hed" style={{ fontSize: 38, color: 'var(--lime)', lineHeight: 1 }}>£54.99</div>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--fg-40)', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--font-barlow-condensed)' }}>Bundle Price</span>
          </div>
          <Link href="/shop-all" className="btn btn-lime">Shop the Bundle →</Link>
        </div>
      </section>

      {/* ── COLLECTIONS GRID ──────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBlock: 100, background: 'var(--bg)' }}>
        <p className="lbl">Shop by Collection</p>
        <h2 className="hed" style={{ fontSize: 'clamp(44px,6vw,88px)', marginTop: 10, marginBottom: 48 }}>What&apos;s Your <em style={{ color: 'var(--lime)' }}>Ink?</em></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }} className="coll-grid-resp">
          {COLLECTIONS.map(c => (
            <Link
              key={c.id}
              href={c.href}
              style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--rule)', aspectRatio: '3/4', display: 'block' }}
              className="coll-card-hover"
            >
              <Image src={c.img} alt={c.label} fill className="object-cover" style={{ transition: 'transform .6s cubic-bezier(.16,1,.3,1)' }} />
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

      {/* ── VIDEO SECTION ─────────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBlock: 100, background: 'var(--bg3)' }}>
        <p className="lbl">Studio Stories</p>
        <h2 className="hed" style={{ fontSize: 'clamp(44px,6vw,88px)', marginTop: 10, marginBottom: 48 }}>See It In <em style={{ color: 'var(--red)' }}>Action</em></h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }} className="vid-grid-resp">
          {/* Main video */}
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--rule)', cursor: 'pointer' }}>
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
              <Image src="/assets/img/img-home-1.webp" alt="The Renew Routine video" fill className="object-cover" style={{ opacity: 0.7 }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid rgba(255,255,255,.8)', background: 'rgba(10,10,10,.5)', display: 'grid', placeItems: 'center' }}>
                  <div style={{ borderStyle: 'solid', borderWidth: '12px 0 12px 20px', borderColor: 'transparent transparent transparent #fff', marginLeft: 4 }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 20px', background: 'var(--bg2)', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontStyle: 'italic', fontSize: 18, textTransform: 'uppercase' }}>
              The Renew Routine — 24hr Aftercare Guide
            </div>
          </div>
          {/* Side videos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { img: '/assets/img/img-home-4.webp', lbl: 'Numb — How It Works' },
              { img: '/assets/img/img-home-7.webp', lbl: 'Glow — 6-Week Results' },
              { img: '/assets/img/img-home-10.webp', lbl: 'Expert — Studio Session' },
            ].map(v => (
              <div key={v.lbl} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)', cursor: 'pointer' }}>
                <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
                  <Image src={v.img} alt={v.lbl} fill className="object-cover" style={{ opacity: 0.6 }} />
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,.7)', background: 'rgba(10,10,10,.4)', display: 'grid', placeItems: 'center' }}>
                    <div style={{ borderStyle: 'solid', borderWidth: '7px 0 7px 12px', borderColor: 'transparent transparent transparent #fff', marginLeft: 3 }} />
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 10, left: 12, fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.06em', textShadow: '0 1px 4px rgba(0,0,0,.8)' }}>{v.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ────────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBlock: 100, background: 'var(--bg2)' }}>
        <p className="lbl">Real Results</p>
        <h2 className="hed" style={{ fontSize: 'clamp(44px,6vw,88px)', marginTop: 10, marginBottom: 48 }}>Before &amp; <em style={{ color: 'var(--lime)' }}>After</em></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="ba-grid-resp">
          {[
            { img1: '/assets/img/img-home-2.webp',  img2: '/assets/img/img-home-3.webp',  name: 'Renew Butter · 14 Days',  meta: 'Customer: Jake T. · Bristol'    },
            { img1: '/assets/img/img-home-6.webp',  img2: '/assets/img/img-home-7.webp',  name: 'Glow Serum · 6 Weeks',    meta: 'Customer: Priya M. · London'   },
            { img1: '/assets/img/img-home-10.webp', img2: '/assets/img/img-home-11.webp', name: 'Defend SPF · 8 Weeks',    meta: 'Customer: Sam W. · Manchester' },
          ].map(ba => (
            <div key={ba.name} style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--rule)', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ aspectRatio: '1', position: 'relative' }}><Image src={ba.img1} alt="Before" fill className="object-cover" /></div>
                <div style={{ aspectRatio: '1', position: 'relative' }}><Image src={ba.img2} alt="After" fill className="object-cover" /></div>
              </div>
              <div style={{ position: 'absolute', top: 0, left: '50%', bottom: 0, width: 2, background: 'var(--lime)' }} />
              <div style={{ position: 'absolute', top: 10, left: 8, background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', padding: '3px 7px', borderRadius: 4 }}>Before</div>
              <div style={{ position: 'absolute', top: 10, right: 8, background: 'var(--lime)', color: '#0a0a0a', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', padding: '3px 7px', borderRadius: 4 }}>After</div>
              <div style={{ padding: 16 }}>
                <div className="hed" style={{ fontSize: 18, marginBottom: 4 }}>{ba.name}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-40)' }}>{ba.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PHOTO GALLERY ─────────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBlock: 100, background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div>
            <p className="lbl">Community Gallery</p>
            <h2 className="hed" style={{ fontSize: 'clamp(36px,5vw,72px)', marginTop: 8 }}>Your Ink,<br /><em style={{ color: 'var(--lime)' }}>Your Kong</em></h2>
          </div>
          <a href="https://instagram.com/kongtattoocare_uk" target="_blank" rel="noopener noreferrer" className="btn btn-out" style={{ fontSize: 11, padding: '9px 18px' }}>Follow @kongtattoocare_uk</a>
        </div>
        {/* Mosaic grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gridTemplateRows: 'repeat(2,220px)', gap: 12 }} className="gal-grid-resp">
          {GALLERY_IMGS.map(({ img, cls, span }) => (
            <div key={img} className={`gal-item-hover ${span}`} style={{ overflow: 'hidden', borderRadius: 12, border: '1px solid var(--rule)', position: 'relative', ...(cls === 'g1' ? { gridColumn: 'span 2', gridRow: 'span 2' } : cls === 'g2' || cls === 'g3' || cls === 'g6' ? { gridColumn: 'span 2' } : {}) }}>
              <Image src={img} alt="KONG community" fill className="object-cover" style={{ transition: 'transform .6s cubic-bezier(.16,1,.3,1)' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESS STEPS ─────────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBlock: 100, background: 'var(--bg3)' }}>
        <p className="lbl">How It Works</p>
        <h2 className="hed" style={{ fontSize: 'clamp(44px,6vw,88px)', marginTop: 10, marginBottom: 52 }}>The Kong <em style={{ color: 'var(--lime)' }}>Method</em></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 28, position: 'relative' }} className="steps-grid-resp">
          <div style={{ position: 'absolute', top: 28, left: 'calc(12.5% + 14px)', right: 'calc(12.5% + 14px)', height: 1, background: 'linear-gradient(90deg,var(--red),var(--lime))' }} className="steps-line-resp" />
          {STEPS.map(s => (
            <div key={s.n} style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--red)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-barlow-condensed)', fontWeight: 900, fontSize: 20, color: '#fff', marginBottom: 18 }}>{s.n}</div>
              <h3 className="hed" style={{ fontSize: 20, marginBottom: 8 }}>{s.t}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--fg-70)' }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--red)', paddingBlock: 60 }}>
        <div className="wrap-wide cap stats-grid-resp" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, textAlign: 'center' }}>
          {[
            { n: '30K+', l: 'Happy UK Customers' },
            { n: '97%',  l: 'Satisfaction Rate'  },
            { n: '5',    l: 'Years Perfecting'   },
            { n: '2,400+', l: 'Verified Reviews' },
          ].map(s => (
            <div key={s.l}>
              <div className="hed" style={{ fontSize: 'clamp(44px,5vw,72px)', color: '#fff', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── REVIEWS ───────────────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBlock: 100, background: 'var(--bg2)' }}>
        <p className="lbl">Customer Reviews</p>
        <h2 className="hed" style={{ fontSize: 'clamp(44px,6vw,88px)', marginTop: 10, marginBottom: 52 }}>What UK <em style={{ color: 'var(--lime)' }}>Customers</em> Say</h2>
        {/* Summary */}
        <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start', marginBottom: 52, flexWrap: 'wrap' }}>
          <div>
            <div className="hed" style={{ fontSize: 96, color: 'var(--lime)', lineHeight: 1 }}>4.9</div>
            <div style={{ color: '#FFB700', fontSize: 22, letterSpacing: 2 }}>★★★★★</div>
            <div style={{ fontSize: 13, color: 'var(--fg-40)', marginTop: 6, fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, letterSpacing: '.08em' }}>From 2,400+ verified reviews</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {[['5★','88%'],['4★','9%'],['3★','2%'],['2★','1%'],['1★','0%']].map(([lbl, pct]) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 11, letterSpacing: '.1em', color: 'var(--fg-40)', width: 36, textAlign: 'right', flexShrink: 0 }}>{lbl}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--rule)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--lime)', borderRadius: 3, width: pct }} />
                </div>
                <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 700, fontSize: 11, color: 'var(--fg-40)', width: 28, flexShrink: 0 }}>{pct}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Review cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="rev-grid-resp">
          {REVIEWS.map(r => (
            <div key={r.name} style={{ background: 'var(--bg)', border: '1px solid var(--rule)', borderRadius: 14, padding: 22 }}>
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

      {/* ── ARTIST FEATURE ────────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBlock: 100, background: 'var(--bg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 72, alignItems: 'center' }} className="artist-grid-resp">
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/5' }}>
            <Image src="/assets/img/img-home-19.webp" alt="Featured artist" fill className="object-cover" />
            <div style={{ position: 'absolute', inset: -2, borderRadius: 'inherit', border: '2px solid var(--lime)', pointerEvents: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <p className="lbl">Artist Feature</p>
            <div className="hed" style={{ fontSize: 120, color: 'var(--red)', lineHeight: .6, opacity: .5 }}>&ldquo;</div>
            <blockquote className="hed" style={{ fontSize: 'clamp(22px,2.5vw,34px)' }}>
              &ldquo;My clients come back with the sharpest healed work I&apos;ve ever seen. KONG isn&apos;t a skincare brand — it&apos;s a tattoo brand. That&apos;s the difference.&rdquo;
            </blockquote>
            <div>
              <strong style={{ color: 'var(--lime)', fontFamily: 'var(--font-barlow-condensed)', fontSize: 14, letterSpacing: '.1em', textTransform: 'uppercase', display: 'block' }}>Lauren Scobie</strong>
              <span style={{ fontSize: 12, color: 'var(--fg-40)' }}>Lead Artist · East London Tattoo Co.</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/shop-all" className="btn btn-lime">Shop Lauren&apos;s Picks</Link>
              <Link href="/about" className="btn btn-out">Watch Her Process</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL GRID ───────────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBlock: 100, background: 'var(--bg3)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div>
            <p className="lbl">Instagram</p>
            <h2 className="hed" style={{ fontSize: 'clamp(36px,5vw,70px)', marginTop: 8 }}>@kongtattoocare_uk</h2>
          </div>
          <a href="https://instagram.com/kongtattoocare_uk" target="_blank" rel="noopener noreferrer" className="btn btn-out" style={{ fontSize: 11, padding: '9px 18px' }}>Follow Us</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }} className="soc-grid-resp">
          {SOC_IMGS.map((img, i) => (
            <div key={img} style={{ position: 'relative', overflow: 'hidden', borderRadius: 10, border: '1px solid var(--rule)', aspectRatio: '1', cursor: 'pointer' }}>
              <Image src={img} alt={`KONG Instagram post ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '60vh', display: 'flex', alignItems: 'center', background: 'var(--bg3)' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <Image src="/assets/img/img-home-21.webp" alt="" fill className="object-cover" style={{ opacity: 0.18 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,rgba(10,10,10,.98) 0%,rgba(10,10,10,.7) 55%,rgba(10,10,10,.25) 100%)' }} />
        </div>
        <div className="wrap-wide cap" style={{ position: 'relative', zIndex: 2, paddingBlock: 90 }}>
          <p className="lbl">Start Your Routine</p>
          <h2 className="hed" style={{ fontSize: 'clamp(52px,8vw,120px)', marginBlock: '12px 24px' }}>Protect<br /><em style={{ color: 'var(--lime)' }}>Your Art</em></h2>
          <p style={{ fontSize: 15, color: 'var(--fg-70)', maxWidth: 380, lineHeight: 1.75, marginBottom: 32 }}>Premium tattoo care backed by science, trusted by UK artists. Free delivery over £35.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/shop-all" className="btn btn-red">Shop the Full Range</Link>
            <Link href="/shop-all" className="btn btn-out">View All Collections</Link>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
      <section className="wrap-wide cap" style={{ paddingBlock: 96 }}>
        <div style={{ borderRadius: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '10px 14px 32px', background: 'var(--red)' }} className="newsletter-row">
          <div style={{ flex: 1, textAlign: 'center', padding: '24px 0 16px' }}>
            <h2 className="hed" style={{ fontSize: 'clamp(36px,6vw,56px)', color: '#fff', marginBottom: 8 }}>Join the Kingdom</h2>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 15, maxWidth: 420 }}>Subscribe for exclusive drops, artist collabs, early access and 10% off your first order.</p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      <Footer />

      {/* Scroll reveal + ticker animation */}
      <style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @media (max-width: 1100px) {
          .coll-grid-resp { grid-template-columns: repeat(3,1fr) !important; }
          .vid-grid-resp { grid-template-columns: 1fr !important; }
          .ba-grid-resp { grid-template-columns: repeat(2,1fr) !important; }
          .artist-grid-resp { grid-template-columns: 1fr !important; gap: 40px !important; }
          .soc-grid-resp { grid-template-columns: repeat(4,1fr) !important; }
          .gal-grid-resp { grid-template-columns: repeat(3,1fr) !important; grid-template-rows: auto !important; }
          .gal-grid-resp > * { grid-column: span 1 !important; grid-row: span 1 !important; height: 200px; }
        }
        @media (max-width: 768px) {
          .coll-grid-resp { grid-template-columns: repeat(2,1fr) !important; }
          .ba-grid-resp { grid-template-columns: 1fr !important; }
          .rev-grid-resp { grid-template-columns: 1fr !important; }
          .steps-grid-resp { grid-template-columns: repeat(2,1fr) !important; }
          .steps-line-resp { display: none !important; }
          .stats-grid-resp { grid-template-columns: repeat(2,1fr) !important; }
          .soc-grid-resp { grid-template-columns: repeat(2,1fr) !important; }
          .newsletter-row { flex-direction: column !important; }
        }
      `}</style>
    </>
  )
}
