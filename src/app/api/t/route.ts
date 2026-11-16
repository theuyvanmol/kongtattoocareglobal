import { NextRequest, NextResponse } from 'next/server'
import { trackHit } from '@/lib/analytics'

// Bot patterns to filter
const BOT_RE = /bot|crawl|spider|slurp|search|fetch|curl|wget|python|java|go-http|cfnetwork|dataprovider|mediapartners|adsbot|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora|outbrain|screaming|ahrefs|moz|semrush|majestic|sistrix/i

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get('user-agent') || ''
    if (BOT_RE.test(ua)) return NextResponse.json({ ok: false })

    // Only accept same-origin
    const origin = req.headers.get('origin') || ''
    const host = req.headers.get('host') || ''
    if (origin && !origin.includes(host)) return NextResponse.json({ ok: false })

    const body = await req.json()
    const { v, p, r, beat } = body

    if (!v || !p) return NextResponse.json({ ok: false })

    // Skip admin and api paths
    if (p.startsWith('/admin') || p.startsWith('/api')) return NextResponse.json({ ok: false })

    // Vercel geo headers
    const cc = req.headers.get('x-vercel-ip-country') || undefined
    const city = req.headers.get('x-vercel-ip-city') || undefined
    const latStr = req.headers.get('x-vercel-ip-latitude')
    const lonStr = req.headers.get('x-vercel-ip-longitude')
    const lat = latStr ? parseFloat(latStr) : undefined
    const lon = lonStr ? parseFloat(lonStr) : undefined

    const mobile = /mobile|android|iphone|ipad|ipod/i.test(ua)

    await trackHit({ v, p, r, cc, city, lat, lon, mobile, beat: beat === true })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
