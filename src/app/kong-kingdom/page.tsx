import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'The KONG Kingdom — Join Our Community',
  description: 'Join the KONG Kingdom — exclusive drops, artist collabs, early access to new products, and 10% off your first order. The inner circle of UK tattoo culture.',
  openGraph: {
    title: 'The KONG Kingdom — Exclusive Community',
    description: 'Join the inner circle of UK tattoo culture. Exclusive drops, early access, 10% off.',
  },
}

const PERKS = [
  { icon: '🎁', title: '10% Off First Order', desc: 'Welcome discount applied instantly at checkout.' },
  { icon: '⚡', title: 'Early Access', desc: 'New products and limited drops before anyone else.' },
  { icon: '🎨', title: 'Artist Collabs', desc: 'Exclusive limited-edition packs with top tattoo artists.' },
  { icon: '📚', title: 'Aftercare Academy', desc: 'Members-only guides and healing support.' },
  { icon: '🏆', title: 'Points & Rewards', desc: 'Earn with every purchase. Redeem for free products.' },
  { icon: '🌍', title: 'Community Events', desc: 'Flash events, studio visits, and Kingdom meetups.' },
]

export default function KongKingdomPage() {
  return (
    <>
      <Nav active="/kong-kingdom" />
      <div style={{ paddingTop: 100 }}>
        {/* Hero */}
        <section className="wrap-wide cap" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <p className="lbl mb-4">Members Club</p>
          <h1 className="hed text-[clamp(56px,12vw,110px)] max-w-2xl mb-6">
            The<br /><span style={{ color: 'var(--lime)' }}>Kingdom.</span>
          </h1>
          <p className="text-xl max-w-2xl leading-relaxed mb-10" style={{ color: 'var(--fg-70)' }}>
            More than a loyalty programme. The KONG Kingdom is the inner circle of UK tattoo culture — exclusive drops, artist collabs, and a community of people who take their ink seriously.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="#join" className="btn btn-lime text-base px-8 py-4">Join Free →</a>
            <Link href="/about" className="btn btn-out text-base px-8 py-4">Our Story</Link>
          </div>
        </section>

        {/* Perks */}
        <section className="wrap-wide cap" style={{ paddingBottom: 96 }}>
          <p className="lbl mb-4">Member Benefits</p>
          <h2 className="hed text-[clamp(36px,6vw,56px)] mb-12">What You Get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERKS.map(p => (
              <div key={p.title} className="flex gap-4 p-5 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
                <span className="text-3xl flex-shrink-0">{p.icon}</span>
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{p.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--fg-70)' }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Join form */}
        <section id="join" className="wrap-wide cap" style={{ paddingBottom: 96 }}>
          <div className="rounded-2xl p-10 md:p-14" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="lbl mb-3">Free to Join</p>
                <h2 className="hed text-[clamp(36px,5vw,52px)] mb-4">Enter the Kingdom</h2>
                <p style={{ color: 'var(--fg-70)', fontSize: 15, lineHeight: 1.7 }}>
                  Sign up for free and get 10% off your first order instantly. No spam, just genuine tattoo culture content and exclusive member benefits.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  {['✅ Free to join, no commitment', '✅ 10% off first order immediately', '✅ Early access to new drops', '✅ Cancel any time'].map(b => (
                    <span key={b} className="text-sm" style={{ color: 'var(--fg-70)' }}>{b}</span>
                  ))}
                </div>
              </div>
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--fg-70)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>FULL NAME</label>
                  <input type="text" placeholder="Your name" className="w-full h-12 rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg3)', border: '1.5px solid var(--rule)', color: 'var(--fg)' }} />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--fg-70)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>EMAIL ADDRESS</label>
                  <input type="email" placeholder="your@email.com" className="w-full h-12 rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg3)', border: '1.5px solid var(--rule)', color: 'var(--fg)' }} />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--fg-70)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>ARE YOU A TATTOO ARTIST?</label>
                  <select className="w-full h-12 rounded-xl px-4 text-sm outline-none appearance-none" style={{ background: 'var(--bg3)', border: '1.5px solid var(--rule)', color: 'var(--fg)' }}>
                    <option>No, I&apos;m a tattoo enthusiast</option>
                    <option>Yes, I&apos;m a tattoo artist</option>
                    <option>I work in a tattoo studio</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-lime text-base py-4 mt-2">
                  Join the Kingdom — Free →
                </button>
                <p className="text-xs text-center" style={{ color: 'var(--fg-40)' }}>By joining you agree to our Privacy Policy. Unsubscribe anytime.</p>
              </form>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
