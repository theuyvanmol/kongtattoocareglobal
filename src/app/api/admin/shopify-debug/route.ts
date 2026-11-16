import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHOP = 'kongtattoocareglobal.myshopify.com'
const API_VERSION = '2026-10'

export async function GET() {
  const token = process.env.SHOPIFY_ADMIN_TOKEN
  const result: Record<string, unknown> = {
    hasToken: !!token,
    tokenPrefix: token ? token.slice(0, 8) + '…' : null,
    shop: SHOP,
    apiVersion: API_VERSION,
  }

  if (!token) {
    return NextResponse.json({ ...result, error: 'Missing SHOPIFY_ADMIN_TOKEN' })
  }

  // Test basic shop endpoint
  try {
    const shopResp = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/shop.json`, {
      headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    })
    result.shopStatus = shopResp.status
    result.shopOk = shopResp.ok
    if (shopResp.ok) {
      const shopData = await shopResp.json()
      result.shopName = shopData.shop?.name
      result.currency = shopData.shop?.currency
    } else {
      result.shopError = await shopResp.text()
    }
  } catch (e) {
    result.shopException = String(e)
  }

  // Test orders count
  try {
    const ordersResp = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/orders/count.json?status=any`, {
      headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    })
    result.ordersCountStatus = ordersResp.status
    if (ordersResp.ok) {
      const data = await ordersResp.json()
      result.ordersCount = data.count
    } else {
      result.ordersCountError = await ordersResp.text()
    }
  } catch (e) {
    result.ordersException = String(e)
  }

  return NextResponse.json(result)
}
