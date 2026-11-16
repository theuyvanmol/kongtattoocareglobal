import { NextResponse } from 'next/server'

// TEMPORARY route to get Shopify Admin API token - DELETE AFTER USE
export async function GET() {
  try {
    const clientId = process.env.SHOPIFY_API_KEY || ''
    const clientSecret = process.env.SHOPIFY_API_SECRET || ''
    const storeDomain = 'kongtattoocareuk.myshopify.com'

    if (!clientId) return NextResponse.json({ error: 'Missing SHOPIFY_API_KEY' }, { status: 500 })
    if (!clientSecret) return NextResponse.json({ error: 'Missing SHOPIFY_API_SECRET' }, { status: 500 })

    const resp = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
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
<p>Token has been automatically saved to Vercel as <strong>SHOPIFY_ADMIN_TOKEN</strong> — check below.</p>
<pre style="background:#000;padding:16px;border-radius:8px;font-size:14px;word-break:break-all">${token}</pre>
<p style="color:#888">Scope: ${scope}</p>
</body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      )
    }

    return new NextResponse(
      `<html><body style="font-family:monospace;padding:20px;background:#111;color:#ff6">
<h2 style="color:#fff">❌ No token (status ${resp.status})</h2>
<pre style="background:#000;padding:16px;border-radius:8px;font-size:14px;white-space:pre-wrap">${JSON.stringify(data, null, 2)}</pre>
</body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  } catch (e: unknown) {
    return new NextResponse(`<html><body style="color:#f66;font-family:monospace;padding:20px"><h2>Error: ${String(e)}</h2></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } })
  }
}
