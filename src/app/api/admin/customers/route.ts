import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHOP = 'kongtattoocareglobal.myshopify.com'
const API_VERSION = '2026-10'

function shopifyFetch(endpoint: string, options?: RequestInit) {
  const token = process.env.SHOPIFY_ADMIN_TOKEN
  if (!token) throw new Error('Missing SHOPIFY_ADMIN_TOKEN')
  return fetch(`https://${SHOP}/admin/api/${API_VERSION}${endpoint}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
}

export async function GET() {
  try {
    const resp = await shopifyFetch('/customers.json?limit=50&fields=id,email,first_name,last_name,orders_count,total_spent,created_at,accepts_marketing')
    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: `Shopify error ${resp.status}`, detail: text }, { status: resp.status })
    }
    const data = await resp.json()
    const customers = (data.customers || []).map((c: Record<string, unknown>) => ({
      id: c.id,
      email: c.email,
      name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Guest',
      ordersCount: c.orders_count,
      totalSpent: parseFloat(c.total_spent as string || '0'),
      created: c.created_at,
      acceptsMarketing: c.accepts_marketing,
    }))
    return NextResponse.json({ customers })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
