import { NextResponse } from 'next/server'

// TEMPORARY route to get Shopify Admin API token - DELETE AFTER USE
export async function GET() {
  try {
    const clientId = process.env.SHOPIFY_API_KEY || ''
    const clientSecret = process.env.SHOPIFY_API_SECRET || ''
    const privateKeyPem = process.env.SHOPIFY_PRIVATE_KEY || ''
    const storeHandle = 'kongtattoocareglobal'

    if (!clientId) return NextResponse.json({ error: 'Missing SHOPIFY_API_KEY' }, { status: 500 })
    if (!clientSecret) return NextResponse.json({ error: 'Missing SHOPIFY_API_SECRET' }, { status: 500 })
    if (!privateKeyPem) return NextResponse.json({ error: 'Missing SHOPIFY_PRIVATE_KEY' }, { status: 500 })

    // Dev Dashboard apps use JWT bearer grant with public key
    const { createSign } = await import('crypto')

    const header = Buffer.from(JSON.stringify({ alg: 'ES256', typ: 'JWT', kid: 'kong-admin-key-2' })).toString('base64url')
    const now = Math.floor(Date.now() / 1000)
    const payload = Buffer.from(JSON.stringify({
      iss: clientId, sub: clientId,
      aud: `https://admin.shopify.com`,
      iat: now, exp: now + 60,
      jti: crypto.randomUUID(),
    })).toString('base64url')

    const signingInput = `${header}.${payload}`
    const sign = createSign('SHA256')
    sign.update(signingInput)
    sign.end()
    const derSig = sign.sign(privateKeyPem)

    // Convert DER to raw r||s for JWT ES256
    let off = 0
    if (derSig[off++] !== 0x30) throw new Error('Bad DER')
    off++ // seq len
    if (derSig[off++] !== 0x02) throw new Error('Bad DER r')
    const rLen = derSig[off++]; const rStart = derSig[off] === 0x00 ? off + 1 : off; const r = derSig.slice(rStart, off + rLen); off += rLen
    if (derSig[off++] !== 0x02) throw new Error('Bad DER s')
    const sLen = derSig[off++]; const sStart = derSig[off] === 0x00 ? off + 1 : off; const s = derSig.slice(sStart, off + sLen)
    const rPad = Buffer.alloc(32); r.copy(rPad, 32 - r.length)
    const sPad = Buffer.alloc(32); s.copy(sPad, 32 - s.length)
    const jwt = `${signingInput}.${Buffer.concat([rPad, sPad]).toString('base64url')}`

    const resp = await fetch(`https://admin.shopify.com/store/${storeHandle}/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Kong-Tattoo-Care/1.0',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
        client_id: clientId,
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
