import { kvPipe } from './kv'

const LIVE_TTL = 5 * 60 // 5 minutes
const DAY = 86400

function dayKey(d = new Date()) {
  return d.toISOString().split('T')[0]
}

export interface HitPayload {
  v: string         // visitor ID
  p: string         // path
  r?: string        // referrer
  cc?: string       // country code
  mobile: boolean
  beat?: boolean    // heartbeat (not a new pageview)
  lat?: number
  lon?: number
  city?: string
}

export async function trackHit(h: HitPayload) {
  const now = Date.now()
  const day = dayKey()
  const ts = Math.floor(now / 1000)
  const liveKey = `kg:live`
  const pvKey = `kg:pv:${day}`
  const uvKey = `kg:uv:${day}`
  const pageKey = `kg:page:${day}:${h.p.replace(/[^a-zA-Z0-9/_-]/g, '_')}`
  const devKey = `kg:dev:${day}`
  const ccKey = `kg:cc:${day}`
  const refKey = `kg:ref:${day}`

  const cmds: (string | number)[][] = [
    // Live set: member = visitorId, score = unix ts
    ['ZADD', liveKey, ts, h.v],
    // Remove stale members (older than 5 min)
    ['ZREMRANGEBYSCORE', liveKey, '-inf', ts - LIVE_TTL],
    // Set expiry on live key
    ['EXPIRE', liveKey, LIVE_TTL * 2],
  ]

  if (!h.beat) {
    cmds.push(
      // Page views counter
      ['INCR', pvKey],
      ['EXPIRE', pvKey, DAY * 90],
      // Unique visitors HyperLogLog
      ['PFADD', uvKey, h.v],
      ['EXPIRE', uvKey, DAY * 90],
      // Page breakdown
      ['INCR', pageKey],
      ['EXPIRE', pageKey, DAY * 90],
      // Device type
      ['HINCRBY', devKey, h.mobile ? 'mobile' : 'desktop', 1],
      ['EXPIRE', devKey, DAY * 90],
    )

    if (h.cc) {
      cmds.push(
        ['HINCRBY', ccKey, h.cc, 1],
        ['EXPIRE', ccKey, DAY * 90],
      )
    }

    if (h.r) {
      try {
        const ref = new URL(h.r).hostname.replace(/^www\./, '')
        cmds.push(
          ['HINCRBY', refKey, ref, 1],
          ['EXPIRE', refKey, DAY * 90],
        )
      } catch { /* ignore bad URLs */ }
    }

    // Store geo point for live map (if coords available)
    if (h.lat != null && h.lon != null) {
      const pointKey = `kg:points:${day}`
      cmds.push(
        ['LPUSH', pointKey, `${h.lat},${h.lon},${h.cc || ''},${h.city || ''}`],
        ['LTRIM', pointKey, 0, 199],
        ['EXPIRE', pointKey, DAY * 7],
      )
    }
  }

  await kvPipe(cmds)
}

export async function trackEvent(ev: 'atc' | 'checkout') {
  const day = dayKey()
  await kvPipe([
    ['INCR', `kg:ev:${ev}:${day}`],
    ['EXPIRE', `kg:ev:${ev}:${day}`, DAY * 90],
  ])
}

export async function liveNow(): Promise<{
  count: number
  pages: { path: string; count: number }[]
  countries: { cc: string; count: number }[]
  points: { lat: number; lon: number; cc: string; city: string }[]
}> {
  const now = Math.floor(Date.now() / 1000)
  const liveKey = `kg:live`
  const day = dayKey()

  const results = await kvPipe([
    ['ZRANGEBYSCORE', liveKey, now - LIVE_TTL, '+inf'],
    ['HGETALL', `kg:cc:${day}`],
    ['LRANGE', `kg:points:${day}`, 0, 49],
  ])

  const members = (results[0] as string[] | null) || []
  const ccMap = results[1] as Record<string, string> | null
  const rawPoints = (results[2] as string[] | null) || []

  const count = members.length

  // Pages visited by live visitors — approximate from page keys
  const pages: { path: string; count: number }[] = []

  const countries = ccMap
    ? Object.entries(ccMap)
        .map(([cc, c]) => ({ cc, count: parseInt(c, 10) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    : []

  const points = rawPoints
    .map(p => {
      const [lat, lon, cc, city] = p.split(',')
      return { lat: parseFloat(lat), lon: parseFloat(lon), cc: cc || '', city: city || '' }
    })
    .filter(p => !isNaN(p.lat) && !isNaN(p.lon))

  return { count, pages, countries, points }
}

export async function stats(days = 30) {
  const series: { date: string; pv: number; uv: number }[] = []

  const cmds: (string | number)[][] = []
  const dates: string[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY * 1000)
    const day = dayKey(d)
    dates.push(day)
    cmds.push(['GET', `kg:pv:${day}`])
    cmds.push(['PFCOUNT', `kg:uv:${day}`])
  }

  const results = await kvPipe(cmds)

  for (let i = 0; i < dates.length; i++) {
    const pv = parseInt((results[i * 2] as string) || '0', 10)
    const uv = parseInt((results[i * 2 + 1] as string) || '0', 10)
    series.push({ date: dates[i], pv, uv })
  }

  // Today's events
  const day = dayKey()
  const [atc, checkout] = await kvPipe([
    ['GET', `kg:ev:atc:${day}`],
    ['GET', `kg:ev:checkout:${day}`],
  ])

  const totalPv = series.reduce((s, r) => s + r.pv, 0)
  const totalUv = series.reduce((s, r) => s + r.uv, 0)

  return {
    series,
    visitors: totalUv,
    pv: totalPv,
    atc: parseInt((atc as string) || '0', 10),
    checkout: parseInt((checkout as string) || '0', 10),
  }
}
