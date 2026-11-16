import { NextRequest, NextResponse } from 'next/server'

// Shopify Storefront API proxy — token kept server-side only
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'kongtattoocareglobal.myshopify.com'
const STOREFRONT_TOKEN =
  process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN ||
  ''

export async function POST(req: NextRequest) {
  if (!STOREFRONT_TOKEN) {
    return NextResponse.json({ error: 'Shopify not configured' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify(body),
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Shopify request failed' }, { status: 500 })
  }
}
