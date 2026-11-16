import { NextResponse } from 'next/server'
import { kvCmd } from '@/lib/kv'
import { liveNow } from '@/lib/analytics'

export async function GET() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || 'NOT SET'
  const hasToken = !!(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)

  let pingResult = null
  let liveResult = null
  try {
    pingResult = await kvCmd(['PING'])
    liveResult = await liveNow()
  } catch (e) {
    pingResult = String(e)
  }

  return NextResponse.json({
    url: url.slice(0, 40) + '…',
    hasToken,
    ping: pingResult,
    live: liveResult,
  })
}
