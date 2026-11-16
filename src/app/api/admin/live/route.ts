import { NextResponse } from 'next/server'

const SHOP = 'kongtattoocareuk.myshopify.com'
const API_VERSION = '2024-10'

function shopifyFetch(endpoint: string) {
  const token = process.env.SHOPIFY_ADMIN_TOKEN
  if (!token) throw new Error('Missing SHOPIFY_ADMIN_TOKEN')
  return fetch(`https://${SHOP}/admin/api/${API_VERSION}${endpoint}`, {
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    next: { revalidate: 0 },
  })
}

export async function GET() {
  try {
    // Shopify doesn't expose a live visitor API — we approximate from recent checkouts
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    const [recentOrders, recentCheckouts] = await Promise.all([
      shopifyFetch(`/orders.json?status=any&created_at_min=${fiveMinAgo}&limit=10&fields=id,created_at`),
      shopifyFetch(`/checkouts.json?created_at_min=${thirtyMinAgo}&limit=50&fields=id,created_at,completed_at`),
    ])

    const ordersData = recentOrders.ok ? await recentOrders.json() : { orders: [] }
    const checkoutsData = recentCheckouts.ok ? await recentCheckouts.json() : { checkouts: [] }

    const checkouts = checkoutsData.checkouts || []
    const activeCarts = checkouts.filter((c: Record<string, unknown>) => !c.completed_at).length
    const checkingOut = checkouts.filter((c: Record<string, string>) => {
      const age = Date.now() - new Date(c.created_at).getTime()
      return !c.completed_at && age < 10 * 60 * 1000
    }).length

    return NextResponse.json({
      visitors: activeCarts + Math.floor(activeCarts * 1.5), // estimate: carts + anonymous browsers
      sessions: activeCarts + ordersData.orders?.length || 0,
      activeCarts,
      checkingOut,
    })
  } catch (e) {
    return NextResponse.json({ visitors: 0, sessions: 0, activeCarts: 0, checkingOut: 0, error: String(e) })
  }
}
