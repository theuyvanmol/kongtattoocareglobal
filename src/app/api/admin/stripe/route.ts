import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 500 })

    const [chargesResp, balanceResp] = await Promise.all([
      fetch('https://api.stripe.com/v1/charges?limit=50&expand[]=data.payment_intent', {
        headers: { Authorization: `Bearer ${key}` },
      }),
      fetch('https://api.stripe.com/v1/balance', {
        headers: { Authorization: `Bearer ${key}` },
      }),
    ])

    const [chargesData, balanceData] = await Promise.all([
      chargesResp.json(),
      balanceResp.json(),
    ])

    const charges = (chargesData.data || []).map((c: Record<string, unknown>) => ({
      id: c.id,
      amount: (c.amount as number) / 100,
      currency: c.currency,
      status: c.status,
      description: c.description,
      email: (c.billing_details as Record<string, string>)?.email || '',
      name: (c.billing_details as Record<string, string>)?.name || '',
      created: new Date((c.created as number) * 1000).toISOString(),
      refunded: c.refunded,
      receipt_url: c.receipt_url,
    }))

    const available = (balanceData.available || []).reduce(
      (sum: number, b: Record<string, number>) => sum + (b.currency === 'gbp' ? b.amount : 0), 0
    ) / 100

    const pending = (balanceData.pending || []).reduce(
      (sum: number, b: Record<string, number>) => sum + (b.currency === 'gbp' ? b.amount : 0), 0
    ) / 100

    return NextResponse.json({ charges, balance: { available, pending } })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
