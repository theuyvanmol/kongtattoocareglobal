import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

// Static blog posts data - in a real app these would come from a CMS
const POSTS: Record<string, {
  title: string
  date: string
  readTime: string
  category: string
  excerpt: string
  content: string
}> = {
  'complete-tattoo-aftercare-guide': {
    title: 'The Complete Tattoo Aftercare Guide for 2024',
    date: 'October 15, 2024',
    readTime: '8 min read',
    category: 'Aftercare',
    excerpt: 'Everything you need to know about healing your fresh tattoo.',
    content: `
## The First 24 Hours

The first day after getting your tattoo is the most critical. Your artist has just created an open wound, and proper care begins the moment you leave the studio.

**Leave the wrap on**: Your artist will wrap your tattoo before you leave. Keep this on for 2–4 hours minimum. If they used a second-skin bandage (like Saniderm), you can leave it on for up to 5 days.

**First wash**: When you remove the wrap, wash gently with unscented soap and lukewarm water. Pat dry with a clean paper towel — never rub.

**Moisturise**: Apply a thin layer of KONG Renew Healing Butter. Less is more — you want a light barrier, not a thick coat.

## Days 2–14: The Healing Phase

This is when most aftercare mistakes happen. The tattoo will peel, flake, and itch. This is normal.

**Keep it moisturised**: Apply KONG Renew 2–3 times daily. Your skin should never feel tight or dry.

**Avoid these at all costs**:
- Submerging in water (baths, pools, the sea)
- Direct sunlight on the healing tattoo
- Picking or scratching at peeling skin
- Tight clothing rubbing against the tattoo

**Signs of normal healing**: Light itching, slight redness, peeling skin, some plasma weeping in the first day or two.

**Signs to see a doctor**: Excessive swelling, pus, fever, red streaks radiating from the tattoo.

## Week 3 Onwards: Long-Term Care

Once your tattoo is healed, the work isn't over. Long-term vibrancy comes from consistent care.

**Daily moisturising**: Keep the skin hydrated with KONG Glow Daily Tattoo Balm.

**Sun protection**: UV is the number one enemy of tattoo colour. Apply KONG Defend SPF every time the tattoo will be exposed to sun.

**Stay hydrated**: Well-hydrated skin shows tattoos more vividly. Drink your water.

## The KONG System

We designed our five collections specifically for each stage of the tattoo journey:

- **Numb**: Before and during your session
- **Renew**: The critical healing phase
- **Glow**: Long-term colour protection
- **Defend**: SPF and barrier protection
- **Expert**: Professional studio essentials

Using products designed specifically for tattooed skin makes a measurable difference to your healed results.
    `,
  },
  'why-numb-cream-works': {
    title: 'How KONG Numb Works — The Science Behind Pain Relief',
    date: 'September 28, 2024',
    readTime: '5 min read',
    category: 'Science',
    excerpt: 'A deep dive into the active ingredients in KONG Numb.',
    content: `
## The Active Ingredient: Lidocaine

KONG Numb uses a 5% lidocaine formulation — the highest concentration available without prescription in the UK.

Lidocaine is a local anaesthetic that works by blocking sodium channels in nerve cells, preventing pain signals from reaching the brain. Applied topically, it creates a surface anaesthetic effect that can last 1–3 hours.

## Why Our Formula Is Different

Most numbing creams are oil-in-water emulsions designed for general skin use. KONG Numb is formulated specifically for pre-tattoo application, with two key differences:

**Better absorption**: Our emulsion system drives lidocaine deeper into the skin for a stronger and longer-lasting effect.

**Artist-friendly application**: It doesn't interfere with ink uptake or cause excessive skin movement — a common complaint from tattoo artists about generic numbing creams.

## How to Use It

Apply KONG Numb 45–60 minutes before your session. Apply generously to the area and cover with cling film to increase absorption. Remove just before the artist begins.

For longer sessions, some clients reapply during natural breaks.

## A Note from Artists

Many tattoo artists are hesitant about numbing creams because they can bloat the skin or cause the skin to become too slippery. We developed KONG Numb in direct consultation with working tattoo artists, specifically to address these concerns.

The result is a product that clients love and artists don't hate.
    `,
  },
}

export async function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { slug } = params
  const post = POSTS[slug]
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const post = POSTS[slug]
  if (!post) notFound()

  // Simple markdown renderer
  const html = post.content
    .split('\n')
    .map(line => {
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
      if (line.startsWith('**') && line.endsWith('**:')) return `<p><strong>${line.slice(2, -3)}:</strong></p>`
      if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`
      if (line.startsWith('**')) return `<p><strong>${line.slice(2, line.lastIndexOf('**'))}</strong>: ${line.slice(line.lastIndexOf('**') + 2)}</p>`
      if (line.trim() === '') return '<br>'
      return `<p>${line}</p>`
    })
    .join('\n')

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'KONG Tattoo Care' },
    publisher: { '@type': 'Organization', name: 'KONG Tattoo Care', url: 'https://www.kongtattoocareglobal.com' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Nav active="/blog" />
      <div style={{ paddingTop: 100 }}>
        <article className="wrap cap" style={{ paddingTop: 60, paddingBottom: 96, maxWidth: 760 }}>
          {/* Breadcrumb */}
          <nav className="text-xs mb-8" style={{ color: 'var(--fg-40)' }}>
            <Link href="/" className="hover:text-[var(--fg-70)]">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-[var(--fg-70)]">Journal</Link>
            <span className="mx-2">/</span>
            <span style={{ color: 'var(--fg-70)' }}>{post.title}</span>
          </nav>

          <p className="lbl mb-3">{post.category}</p>
          <h1 className="hed text-[clamp(36px,6vw,56px)] mb-5">{post.title}</h1>
          <div className="flex items-center gap-4 mb-10 pb-6" style={{ color: 'var(--fg-40)', fontSize: 13, borderBottom: '1px solid var(--rule)' }}>
            <span>KONG Tattoo Care</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>

          <div
            className="prose"
            style={{ color: 'var(--fg-70)', lineHeight: 1.75, fontSize: 15 }}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="mt-14 p-6 rounded-2xl" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
            <h2 className="font-bold text-xl mb-3" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>Ready to level up your aftercare?</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--fg-70)' }}>Explore KONG&apos;s five collections — engineered for every stage of your tattoo journey.</p>
            <Link href="/shop-all" className="btn btn-red">Shop All Products</Link>
          </div>
        </article>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .prose h2 { font-family: var(--font-barlow-condensed); font-weight: 800; font-size: clamp(22px,3vw,28px); color: var(--fg); margin: 2em 0 .75em; }
        .prose p { margin-bottom: 1.2em; }
        .prose li { margin-bottom: .4em; margin-left: 1.4em; list-style: disc; }
        .prose strong { color: var(--fg); font-weight: 700; }
      ` }} />
      <Footer />
    </>
  )
}
