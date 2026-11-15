import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// STRIPE_SECRET_KEY is NEVER in code — only in Vercel env vars
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kongtattoocareglobal.com'

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    const lineItems = items.map((item: { title: string; variantTitle: string; price: string; qty: number; image?: string }) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.variantTitle && item.variantTitle !== 'Default Title'
            ? `${item.title} — ${item.variantTitle}`
            : item.title,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(parseFloat(item.price) * 100),
      },
      quantity: item.qty,
    }))

    const subtotal = items.reduce(
      (s: number, i: { price: string; qty: number }) => s + parseFloat(i.price) * i.qty,
      0
    )

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/checkout`,
      shipping_address_collection: { allowed_countries: ['GB', 'US', 'CA', 'AU', 'IE', 'DE', 'FR'] },
      shipping_options: subtotal >= 35
        ? [{ shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 0, currency: 'gbp' }, display_name: 'Free UK Delivery', delivery_estimate: { minimum: { unit: 'business_day', value: 2 }, maximum: { unit: 'business_day', value: 5 } } } }]
        : [
            { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 499, currency: 'gbp' }, display_name: 'Standard UK Delivery', delivery_estimate: { minimum: { unit: 'business_day', value: 2 }, maximum: { unit: 'business_day', value: 5 } } } },
            { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 999, currency: 'gbp' }, display_name: 'Express Delivery', delivery_estimate: { minimum: { unit: 'business_day', value: 1 }, maximum: { unit: 'business_day', value: 2 } } } },
          ],
      allow_promotion_codes: true,
      metadata: {
        source: 'kong-next',
        item_count: String(items.length),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
