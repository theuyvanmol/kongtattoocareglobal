import { NextResponse } from 'next/server'

// One-time OAuth install initiator
export async function GET() {
  const clientId = process.env.SHOPIFY_API_KEY || ''
  const storeHandle = 'kongtattoocareuk'
  const redirectUri = 'https://kongtattoocareglobal.com/api/shopify/callback'
  const scopes = 'read_orders,read_customers,read_products,write_discounts,read_discounts,read_analytics,write_content,read_content,read_marketing_events'
  const state = 'kong-admin-setup-' + Date.now()

  // Use new admin.shopify.com URL for Dev Dashboard apps
  const installUrl = `https://admin.shopify.com/store/${storeHandle}/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

  return NextResponse.redirect(installUrl)
}
