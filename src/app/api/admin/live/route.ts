import { NextResponse } from 'next/server'
import { liveNow, stats } from '@/lib/analytics'

export async function GET() {
  try {
    const [live, today] = await Promise.all([
      liveNow(),
      stats(1),
    ])

    return NextResponse.json({
      visitors: live.count,
      pages: live.pages,
      countries: live.countries,
      points: live.points,
      todayPv: today.pv,
      todayUv: today.visitors,
      todayAtc: today.atc,
      todayCheckout: today.checkout,
    })
  } catch (e) {
    return NextResponse.json({
      visitors: 0, pages: [], countries: [], points: [],
      todayPv: 0, todayUv: 0, todayAtc: 0, todayCheckout: 0,
      error: String(e),
    })
  }
}
