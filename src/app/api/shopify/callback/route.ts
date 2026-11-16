import { NextResponse, NextRequest } from 'next/server'

// OAuth callback — exchanges code for access token and displays it
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const shop = searchParams.get('shop')

  if (!code || !shop) {
    return NextResponse.json({ error: 'Missing code or shop' }, { status: 400 })
  }

  const clientId = process.env.SHOPIFY_API_KEY || ''
  const clientSecret = process.env.SHOPIFY_API_SECRET || ''

  try {
    const resp = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    const data = await resp.json()

    if (data.access_token) {
      // Return the token visibly so it can be copied and stored as env var
      return new NextResponse(
        `<html><body style="font-family:monospace;padding:20px;background:#111;color:#0f0">
<h2 style="color:#fff">✅ Shopify Admin Token Retrieved</h2>
<p>Copy this token and add it to Vercel as <strong>SHOPIFY_ADMIN_TOKEN</strong>:</p>
<pre style="background:#000;padding:16px;border-radius:8px;font-size:16px;word-break:break-all">${data.access_token}</pre>
<p style="color:#888">Scopes: ${data.scope}</p>
</body></html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    } else {
      return NextResponse.json({ error: 'No token returned', data }, { status: 400 })
    }
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
