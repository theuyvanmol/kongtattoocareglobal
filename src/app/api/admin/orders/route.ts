import { NextResponse } from 'next/server'

const SHOP = 'kongtattoocareglobal.myshopify.com'
const API_VERSION = '2026-10'

function shopifyFetch(endpoint: string, options?: RequestInit) {
  const token = process.env.SHOPIFY_ADMIN_TOKEN
  if (!token) throw new Error('Missing SHOPIFY_ADMIN_TOKEN')
  return fetch(`https://${SHOP}/admin/api/${API_VERSION}${endpoint}`, {
    ...options,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
}

export async function GET() {
  try {
    const resp = await shopifyFetch('/orders.json?status=any&limit=50&fields=id,name,total_price,financial_status,fulfillment_status,email,created_at,line_items,customer')
    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: `Shopify error ${resp.status}`, detail: text }, { status: resp.status })
    }
    const data = await resp.json()
    const orders = (data.orders || []).map((o: Record<string, unknown>) => ({
      id: o.id,
      name: o.name,
      total: parseFloat(o.total_price as string || '0'),
      financial: o.financial_status,
      fulfillment: o.fulfillment_status,
      email: (o.customer as Record<string, string>)?.email || (o.email as string) || '',
      customer: (o.customer as Record<string, string>)
        ? `${(o.customer as Record<string, string>).first_name || ''} ${(o.customer as Record<string, string>).last_name || ''}`.trim()
        : 'Guest',
      created: o.created_at,
      items: ((o.line_items as unknown[]) || []).length,
    }))
    return NextResponse.json({ orders })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
