import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Tattoo Aftercare Guide & Journal | KONG Tattoo Care',
  description: 'Expert tattoo aftercare advice from KONG — healing tips, product guides, artist interviews, and everything you need to keep your ink looking fresh.',
  openGraph: {
    title: 'The KONG Journal — Tattoo Aftercare Guides',
    description: 'Expert tattoo aftercare advice — healing tips, product guides, and artist interviews.',
  },
}

const POSTS = [
  {
    slug: 'complete-tattoo-aftercare-guide',
    title: 'The Complete Tattoo Aftercare Guide for 2024',
    excerpt: 'Everything you need to know about healing your fresh tattoo — from the first 24 hours through to long-term colour protection.',
    category: 'Aftercare',
    readTime: '8 min read',
    date: '2024-10-15',
  },
  {
    slug: 'why-numb-cream-works',
    title: 'How KONG Numb Works — The Science Behind Pain Relief',
    excerpt: 'A deep dive into the active ingredients in KONG Numb and why our formula outperforms generic numbing creams.',
    category: 'Science',
    readTime: '5 min read',
    date: '2024-09-28',
  },
  {
    slug: 'tattoo-colour-fading-prevention',
    title: 'Why Tattoos Fade — And How to Stop It',
    excerpt: 'Sun damage, dry skin, and poor aftercare are the three main enemies of tattoo vibrancy. Here\'s how to fight back.',
    category: 'Tips',
    readTime: '6 min read',
    date: '2024-09-10',
  },
  {
    slug: 'artist-spotlight-kong-community',
    title: 'Artist Spotlight: The KONG Community',
    excerpt: 'We spoke to five KONG-using tattoo artists about their healing protocols and why they recommend our products to clients.',
    category: 'Community',
    readTime: '7 min read',
    date: '2024-08-20',
  },
  {
    slug: 'spf-for-tattoos',
    title: 'SPF for Tattoos: Why KONG Defend Is Different',
    excerpt: 'Standard sunscreen can damage fresh tattoos. KONG Defend is formulated specifically for tattooed skin.',
    category: 'Science',
    readTime: '4 min read',
    date: '2024-08-05',
  },
  {
    slug: 'first-tattoo-preparation-guide',
    title: 'Getting Your First Tattoo? Read This First.',
    excerpt: 'The definitive pre-tattoo prep guide — from hydrating your skin weeks in advance to what to bring on the day.',
    category: 'Guides',
    readTime: '5 min read',
    date: '2024-07-18',
  },
]

const CATEGORIES = ['All', 'Aftercare', 'Science', 'Tips', 'Community', 'Guides']

export default function BlogPage() {
  return (
    <>
      <Nav active="/blog" />
      <div style={{ paddingTop: 100 }}>
        {/* Header */}
        <div className="wrap-wide cap" style={{ paddingTop: 60, paddingBottom: 48, borderBottom: '1px solid var(--rule)' }}>
          <p className="lbl mb-3">The KONG Journal</p>
          <h1 className="hed text-[clamp(48px,9vw,80px)]">Aftercare.<br /><span style={{ color: 'var(--red)' }}>Expert Tips.</span></h1>
          <p className="mt-4 text-lg max-w-xl" style={{ color: 'var(--fg-70)' }}>
            From healing science to artist interviews — everything you need to protect your ink.
          </p>
        </div>

        {/* Category filters */}
        <div className="wrap-wide cap" style={{ paddingTop: 20, paddingBottom: 20, borderBottom: '1px solid var(--rule)' }}>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <a
                key={c}
                href={c === 'All' ? '/blog' : `/blog?cat=${c.toLowerCase()}`}
                className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold"
                style={{ background: c === 'All' ? 'var(--lime)' : 'var(--bg2)', color: c === 'All' ? '#0a0a0a' : 'var(--fg-70)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em', border: '1px solid var(--rule)', minHeight: 36, display: 'inline-flex', alignItems: 'center' }}
              >
                {c.toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {/* Featured post */}
        <div className="wrap-wide cap" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <Link
            href={`/blog/${POSTS[0].slug}`}
            className="group grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-2xl transition-all hover:border-[var(--lime)]"
            style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}
          >
            <div className="aspect-video rounded-xl overflow-hidden" style={{ background: 'var(--bg3)' }}>
              <div className="w-full h-full grid place-items-center" style={{ color: 'var(--fg-40)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="lbl text-[var(--lime)]">Featured</span>
                <span style={{ color: 'var(--fg-40)', fontSize: 11 }}>·</span>
                <span className="lbl">{POSTS[0].category}</span>
              </div>
              <h2 className="font-bold text-2xl leading-snug mb-3 group-hover:text-[var(--lime)] transition-colors" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{POSTS[0].title}</h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--fg-70)' }}>{POSTS[0].excerpt}</p>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--fg-40)' }}>
                <span>{POSTS[0].date}</span>
                <span>·</span>
                <span>{POSTS[0].readTime}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Post grid */}
        <div className="wrap-wide cap" style={{ paddingBottom: 96 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.slice(1).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-xl overflow-hidden transition-all hover:border-[var(--lime)]"
                style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}
              >
                <div className="aspect-video" style={{ background: 'var(--bg3)' }}>
                  <div className="w-full h-full grid place-items-center" style={{ color: 'var(--fg-40)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="lbl">{post.category}</span>
                  </div>
                  <h2 className="font-bold text-base leading-snug mb-2 group-hover:text-[var(--lime)] transition-colors" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>{post.title}</h2>
                  <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: 'var(--fg-70)' }}>{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--fg-40)' }}>
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
