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
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch all-time orders (up to 250) + last 30 days + customers
    const [allOrdersResp, recent30Resp, customersResp] = await Promise.all([
      shopifyFetch(`/orders.json?status=any&limit=250&fields=id,total_price,created_at,financial_status`),
      shopifyFetch(`/orders.json?status=any&created_at_min=${thirtyDaysAgo}&limit=250&fields=id,total_price,created_at,financial_status`),
      shopifyFetch(`/customers.json?created_at_min=${thirtyDaysAgo}&limit=250&fields=id,created_at`),
    ])

    const allOrdersData = allOrdersResp.ok ? await allOrdersResp.json() : { orders: [] }
    const recent30Data = recent30Resp.ok ? await recent30Resp.json() : { orders: [] }
    const customersData = customersResp.ok ? await customersResp.json() : { customers: [] }

    const allOrders: Record<string, string>[] = allOrdersData.orders || []
    const orders30d: Record<string, string>[] = recent30Data.orders || []

    // All-time stats
    const allPaid = allOrders.filter(o => o.financial_status === 'paid')
    const revenueAllTime = allPaid.reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0)

    // 30-day stats
    const paidOrders30d = orders30d.filter(o => o.financial_status === 'paid')
    const revenue30d = paidOrders30d.reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0)

    // 7-day stats
    const orders7d = orders30d.filter(o => new Date(o.created_at) >= new Date(sevenDaysAgo))

    // Daily revenue for chart (last 14 days)
    const dailyMap: Record<string, number> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split('T')[0]
      dailyMap[key] = 0
    }
    for (const o of paidOrders30d) {
      const key = o.created_at.split('T')[0]
      if (key in dailyMap) dailyMap[key] += parseFloat(o.total_price || '0')
    }
    const dailyRevenue = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }))

    return NextResponse.json({
      // All-time
      totalOrders: allOrders.length,
      revenueAllTime: Math.round(revenueAllTime * 100) / 100,
      // 30-day
      revenue30d: Math.round(revenue30d * 100) / 100,
      orders30d: orders30d.length,
      paidOrders30d: paidOrders30d.length,
      // 7-day
      orders7d: orders7d.length,
      // Other
      newCustomers30d: (customersData.customers || []).length,
      avgOrderValue: allPaid.length > 0 ? Math.round((revenueAllTime / allPaid.length) * 100) / 100 : 0,
      dailyRevenue,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
