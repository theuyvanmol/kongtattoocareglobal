import { NextResponse } from 'next/server'

// TEMPORARY route to get Shopify Admin API token via client_credentials - DELETE AFTER USE
export async function GET() {
  try {
    const clientId = process.env.SHOPIFY_API_KEY || ''
    const clientSecret = process.env.SHOPIFY_API_SECRET || ''
    const storeHandle = 'kongtattoocareuk'
    const tokenUrl = `https://admin.shopify.com/store/${storeHandle}/oauth/access_token`

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Missing SHOPIFY_API_KEY or SHOPIFY_API_SECRET env vars' }, { status: 500 })
    }

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    })

    const resp = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const text = await resp.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = text }

    if (typeof data === 'object' && data !== null && 'access_token' in data) {
      const token = (data as { access_token: string }).access_token
      return new NextResponse(
        `<html><body style="font-family:monospace;padding:20px;background:#111;color:#0f0">
<h2 style="color:#fff">✅ Shopify Admin Token Retrieved</h2>
<p>Copy this token and add it to Vercel as <strong>SHOPIFY_ADMIN_TOKEN</strong>:</p>
<pre style="background:#000;padding:16px;border-radius:8px;font-size:16px;word-break:break-all">${token}</pre>
<p style="color:#888">Scope: ${(data as Record<string, unknown>).scope || 'unknown'}</p>
</body></html>`,
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      )
    }

    return new NextResponse(
      `<html><body style="font-family:monospace;padding:20px;background:#111;color:#ff6">
<h2 style="color:#fff">❌ No token returned (status ${resp.status})</h2>
<pre style="background:#000;padding:16px;border-radius:8px;font-size:14px;white-space:pre-wrap">${JSON.stringify(data, null, 2)}</pre>
</body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  } catch (e: unknown) {
    return new NextResponse(
      `<html><body style="font-family:monospace;padding:20px;background:#111;color:#f66">
<h2>Error: ${String(e)}</h2>
<pre>${(e as Error)?.stack || ''}</pre>
</body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }
}
