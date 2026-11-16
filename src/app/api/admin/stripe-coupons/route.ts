import { NextResponse, NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

function stripeFetch(endpoint: string, options?: RequestInit) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
  return fetch(`https://api.stripe.com/v1${endpoint}`, {
    ...options,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(options?.headers || {}),
    },
  })
}

function encodeBody(obj: Record<string, string | number | boolean | null | undefined>) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
}

export async function GET() {
  try {
    // Fetch both coupons and promo codes
    const [couponsResp, promoResp] = await Promise.all([
      stripeFetch('/coupons?limit=50'),
      stripeFetch('/promotion_codes?limit=100&active=true'),
    ])

    const couponsData = couponsResp.ok ? await couponsResp.json() : { data: [] }
    const promoData = promoResp.ok ? await promoResp.json() : { data: [] }

    const coupons = (couponsData.data || []).map((c: Record<string, unknown>) => {
      // Find promo codes for this coupon
      const promoCodes = (promoData.data || []).filter((p: Record<string, unknown>) => {
        const coupon = p.coupon as Record<string, unknown>
        return coupon?.id === c.id
      })

      return {
        id: c.id,
        name: c.name || c.id,
        percent_off: c.percent_off,
        amount_off: c.amount_off ? (c.amount_off as number) / 100 : null,
        currency: c.currency,
        duration: c.duration, // once, repeating, forever
        duration_in_months: c.duration_in_months,
        max_redemptions: c.max_redemptions,
        times_redeemed: c.times_redeemed,
        valid: c.valid,
        created: c.created,
        redeem_by: c.redeem_by,
        applies_to: c.applies_to,
        promo_codes: promoCodes.map((p: Record<string, unknown>) => ({
          id: p.id,
          code: p.code,
          active: p.active,
          times_redeemed: p.times_redeemed,
          max_redemptions: p.max_redemptions,
          expires_at: p.expires_at,
          created: p.created,
        })),
      }
    })

    return NextResponse.json({ coupons })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, name, percent_off, amount_off, duration, max_redemptions, redeem_by, promo_code } = body

    // Create coupon first
    const couponParams: Record<string, string | number | boolean | null | undefined> = {
      name,
      duration: duration || 'once',
    }
    if (type === 'percent') couponParams.percent_off = percent_off
    else { couponParams.amount_off = Math.round(amount_off * 100); couponParams.currency = 'gbp' }
    if (max_redemptions) couponParams.max_redemptions = max_redemptions
    if (redeem_by) couponParams.redeem_by = Math.floor(new Date(redeem_by).getTime() / 1000)

    const couponResp = await stripeFetch('/coupons', {
      method: 'POST',
      body: encodeBody(couponParams),
    })
    if (!couponResp.ok) {
      const err = await couponResp.json()
      return NextResponse.json({ error: err.error?.message || 'Failed to create coupon' }, { status: 400 })
    }
    const coupon = await couponResp.json()

    // Create promo code if provided
    let promoCodeObj = null
    if (promo_code) {
      const promoResp = await stripeFetch('/promotion_codes', {
        method: 'POST',
        body: encodeBody({ coupon: coupon.id, code: promo_code }),
      })
      if (promoResp.ok) promoCodeObj = await promoResp.json()
    }

    return NextResponse.json({ success: true, coupon, promo_code: promoCodeObj })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { couponId, promoCodeId } = await req.json()

    if (promoCodeId) {
      // Deactivate promo code
      const r = await stripeFetch(`/promotion_codes/${promoCodeId}`, {
        method: 'POST',
        body: 'active=false',
      })
      if (!r.ok) return NextResponse.json({ error: 'Failed to deactivate promo code' }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    if (couponId) {
      const r = await stripeFetch(`/coupons/${couponId}`, { method: 'DELETE' })
      if (!r.ok) return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'No id provided' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
