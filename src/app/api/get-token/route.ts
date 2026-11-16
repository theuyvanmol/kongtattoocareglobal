import { NextResponse } from 'next/server'

// TEMPORARY route to exchange OAuth code for Shopify Admin API token - DELETE AFTER USE
export async function GET() {
  try {
    const clientId = process.env.SHOPIFY_API_KEY || ''
    const clientSecret = process.env.SHOPIFY_API_SECRET || ''

    if (!clientId) return NextResponse.json({ error: 'Missing SHOPIFY_API_KEY' }, { status: 500 })
    if (!clientSecret) return NextResponse.json({ error: 'Missing SHOPIFY_API_SECRET' }, { status: 500 })

    const shop = 'mkz0sg-i6.myshopify.com'
    const code = '3bb15395336bfb5755bc08a819597c2d'

    const resp = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
      cache: 'no-store',
    })

    const text = await resp.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = text }

    if (typeof data === 'object' && data !== null && 'access_token' in data) {
      const token = (data as { access_token: string; scope?: string }).access_token
      const scope = (data as { scope?: string }).scope || 'unknown'
      return new NextResponse(
        `<html><body style="font-family:monospace;padding:20px;background:#111;color:#0f0">
<h2 style="color:#fff">✅ Shopify Admin Token Retrieved</h2>
<pre style="background:#000;padding:16px;border-radius:8px;font-size:14px;word-break:break-all">${token}</pre>
<p style="color:#888">Scope: ${scope}</p>
<p style="color:#ff0">Copy the token above and paste it as SHOPIFY_ADMIN_TOKEN in Vercel</p>
</body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      )
    }

    return new NextResponse(
      `<html><body style="font-family:monospace;padding:20px;background:#111;color:#ff6">
<h2 style="color:#fff">❌ Token exchange failed (status ${resp.status})</h2>
<pre style="background:#000;padding:16px;border-radius:8px;font-size:14px">${JSON.stringify(data, null, 2)}</pre>
<p>Client ID prefix: ${clientId.slice(0, 8)}...</p>
<p>Secret prefix: ${clientSecret.slice(0, 4)}...</p>
</body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  } catch (e: unknown) {
    return new NextResponse(`<html><body style="color:#f66;font-family:monospace;padding:20px"><h2>Error: ${String(e)}</h2></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } })
  }
}
