import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = process.env.SHOPIFY_APP_CLIENT_ID || 'b46b66905a67582ef2cf07c5abfdfc6e'
const CLIENT_SECRET = process.env.SHOPIFY_APP_CLIENT_SECRET || ''

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const shop = searchParams.get('shop')
  const hmac = searchParams.get('hmac')
  const state = searchParams.get('state')

  // Log everything for debugging
  console.log('[OAuth Callback]', { code: code?.slice(0, 8) + '...', shop, state, hmac: hmac?.slice(0, 8) })

  if (!code || !shop) {
    return NextResponse.json({ error: 'Missing code or shop', params: Object.fromEntries(searchParams) }, { status: 400 })
  }

  // If no client secret configured, just show the code so we can manually exchange it
  if (!CLIENT_SECRET) {
    return NextResponse.json({
      message: 'No client secret configured. Use the code below to manually exchange for a token.',
      code,
      shop,
      instructions: `POST https://${shop}/admin/oauth/access_token with client_id=${CLIENT_ID}&client_secret=YOUR_SECRET&code=${code}`,
    })
  }

  // Exchange code for access token
  try {
    const tokenResp = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    })

    const tokenData = await tokenResp.json()

    if (!tokenResp.ok) {
      return NextResponse.json({ error: 'Token exchange failed', detail: tokenData }, { status: 500 })
    }

    const accessToken = tokenData.access_token
    console.log('[OAuth Callback] Got access token:', accessToken?.slice(0, 10) + '...')

    return NextResponse.json({
      success: true,
      shop,
      tokenPrefix: accessToken?.slice(0, 10),
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
      message: 'Token obtained! Add this to Vercel env as SHOPIFY_ADMIN_TOKEN',
      // Show full token so it can be copied — this endpoint is temporary
      accessToken,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
