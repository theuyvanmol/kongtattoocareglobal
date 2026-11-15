import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About KONG Tattoo Care — Artist Developed, Dermatologist Tested',
  description: 'Learn the story behind KONG Tattoo Care — the UK\'s premium tattoo aftercare brand built by artists, for artists. Dermatologist-tested formulas, sustainable packaging.',
  openGraph: {
    title: 'About KONG Tattoo Care',
    description: 'Built by tattoo artists for tattoo artists. The story behind the UK\'s premier aftercare brand.',
  },
}

const TEAM = [
  { name: 'Jake Morley', role: 'Founder & Lead Formulator', img: '/assets/img/img-home-1.webp' },
  { name: 'Sarah Chen', role: 'Head of Product & Science', img: '/assets/img/img-home-1.webp' },
  { name: 'Marcus Webb', role: 'Brand & Creative Director', img: '/assets/img/img-home-1.webp' },
]

const TIMELINE = [
  { year: '2019', title: 'The Problem', body: 'Jake, a London-based tattoo artist, was tired of recommending subpar aftercare products that damaged his clients\' healed work.' },
  { year: '2020', title: 'The Research', body: 'Working with dermatologists and cosmetic chemists, we started developing formulas specifically optimised for tattooed skin.' },
  { year: '2021', title: 'KONG Launches', body: 'First three SKUs drop to overwhelming response from the UK tattoo community. Sold out in 48 hours.' },
  { year: '2023', title: 'Five Collections', body: 'Numb, Renew, Glow, Defend, and Expert — a complete system covering every stage of the tattoo journey.' },
  { year: '2024', title: 'Going Global', body: '50,000+ customers. Stocked in studios across the UK, EU, and beyond. The culture is global.' },
]

export default function AboutPage() {
  return (
    <>
      <Nav active="/about" />
      <div style={{ paddingTop: 100 }}>
        {/* Hero */}
        <section className="wrap-wide cap" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <p className="lbl mb-4">About KONG</p>
          <h1 className="hed text-[clamp(48px,10vw,96px)] max-w-3xl mb-6">
            Built for the<br /><span style={{ color: 'var(--red)' }}>Culture.</span>
          </h1>
          <p className="text-xl max-w-2xl leading-relaxed" style={{ color: 'var(--fg-70)' }}>
            KONG Tattoo Care was born in a London studio. Frustrated with aftercare that wasn't designed for tattooed skin, we set out to build something better — with actual tattoo artists and dermatologists working together from day one.
          </p>
        </section>

        {/* Mission image */}
        <section className="relative" style={{ height: 'clamp(300px, 50vw, 600px)', background: 'var(--bg3)' }}>
          <Image
            src="/assets/img/img-home-1.webp"
            alt="KONG Tattoo Care studio"
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center" style={{ background: 'linear-gradient(90deg, rgba(10,10,10,.8) 0%, transparent 70%)' }}>
            <div className="wrap-wide cap">
              <blockquote className="max-w-lg">
                <p className="hed text-[clamp(28px,4vw,40px)] text-white mb-4">
                  "We wanted aftercare that actually understood ink. Not marketing. Not generic moisturiser in a fancy bottle."
                </p>
                <footer style={{ color: 'rgba(240,240,240,.7)', fontSize: 14 }}>— Jake Morley, Founder</footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="wrap-wide cap" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <p className="lbl mb-4">What We Stand For</p>
          <h2 className="hed text-[clamp(36px,6vw,56px)] mb-12">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Authenticity', body: 'We\'re from the tattoo community. Every formula starts in a working studio, not a corporate lab.', icon: '🎨' },
              { title: 'Science', body: 'Clinical testing at every stage. If it doesn\'t pass the dermatologist, it doesn\'t reach the shelf.', icon: '🔬' },
              { title: 'Community', body: 'From flash events to artist residencies — the culture isn\'t a backdrop, it\'s the whole point.', icon: '🤝' },
              { title: 'Sustainability', body: 'Eco-conscious packaging, ethically sourced ingredients, carbon-neutral shipping by 2025.', icon: '🌱' },
              { title: 'Transparency', body: 'Full ingredient lists, no greenwashing, no BS. You deserve to know what\'s on your skin.', icon: '📋' },
              { title: 'Excellence', body: 'Five-star or nothing. Our 30-day guarantee means we stand behind every single product.', icon: '⭐' },
            ].map(v => (
              <div key={v.title} className="p-6 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
                <span className="text-3xl block mb-3">{v.icon}</span>
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.03em' }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-70)' }}>{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="wrap-wide cap" style={{ paddingBottom: 96 }}>
          <p className="lbl mb-4">The Journey</p>
          <h2 className="hed text-[clamp(36px,6vw,56px)] mb-12">How We Got Here</h2>
          <div className="flex flex-col gap-0">
            {TIMELINE.map((t, i) => (
              <div key={t.year} className="flex gap-6 md:gap-10" style={{ paddingBottom: 40 }}>
                <div className="flex flex-col items-center">
                  <div className="rounded-full w-12 h-12 grid place-items-center flex-shrink-0 font-bold text-sm" style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.05em' }}>
                    {t.year.slice(2)}
                  </div>
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 mt-2" style={{ background: 'var(--rule)' }} />}
                </div>
                <div className="pb-2">
                  <p className="lbl text-[var(--fg-40)] mb-1">{t.year}</p>
                  <h3 className="font-bold text-xl mb-2" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{t.title}</h3>
                  <p className="text-sm leading-relaxed max-w-lg" style={{ color: 'var(--fg-70)' }}>{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="wrap-wide cap" style={{ paddingBottom: 96 }}>
          <div className="rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-8" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
            <div className="flex-1">
              <h2 className="hed text-[clamp(32px,5vw,52px)] mb-3">Ready to level up<br />your aftercare?</h2>
              <p style={{ color: 'var(--fg-70)' }}>Explore our full range and find the collection that fits your healing journey.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link href="/shop-all" className="btn btn-red text-base px-8 py-4">Shop Now</Link>
              <Link href="/kong-kingdom" className="btn btn-out text-base px-8 py-4">Join the Kingdom</Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
