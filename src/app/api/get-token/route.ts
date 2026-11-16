import { NextResponse } from 'next/server'

// TEMPORARY route to get Shopify Admin API token - DELETE AFTER USE
export async function GET() {
  try {
    const resp = await fetch('https://kongtattoocareuk.myshopify.com/admin/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY || '',
        client_secret: process.env.SHOPIFY_API_SECRET || '',
        grant_type: 'client_credentials'
      })
    })
    const data = await resp.json()
    return NextResponse.json({ status: resp.status, data })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
