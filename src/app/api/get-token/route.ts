import { NextResponse } from 'next/server'
import { createSign } from 'crypto'

// TEMPORARY route to get Shopify Admin API token via JWT client_credentials - DELETE AFTER USE
export async function GET() {
  try {
    const clientId = process.env.SHOPIFY_API_KEY || ''
    const privateKeyPem = process.env.SHOPIFY_PRIVATE_KEY || ''
    const storeHandle = 'kongtattoocareuk'
    const tokenUrl = `https://admin.shopify.com/store/${storeHandle}/oauth/access_token`

    if (!clientId) {
      return NextResponse.json({ error: 'Missing SHOPIFY_API_KEY env var' }, { status: 500 })
    }
    if (!privateKeyPem) {
      return NextResponse.json({ error: 'Missing SHOPIFY_PRIVATE_KEY env var' }, { status: 500 })
    }

    // Build JWT for client_credentials grant
    const header = Buffer.from(JSON.stringify({
      alg: 'ES256',
      typ: 'JWT',
      kid: 'kong-admin-key-2'
    })).toString('base64url')

    const now = Math.floor(Date.now() / 1000)
    const payload = Buffer.from(JSON.stringify({
      iss: clientId,
      sub: clientId,
      aud: 'https://admin.shopify.com',
      iat: now,
      exp: now + 60,
      jti: crypto.randomUUID()
    })).toString('base64url')

    const signingInput = `${header}.${payload}`

    // Sign with ES256 (P-256)
    const sign = createSign('SHA256')
    sign.update(signingInput)
    sign.end()

    // createSign returns DER-encoded signature, need to convert to raw r||s for JWT
    const derSig = sign.sign(privateKeyPem)

    // Parse DER signature to raw r||s (each 32 bytes for P-256)
    let offset = 0
    if (derSig[offset++] !== 0x30) throw new Error('Invalid DER sequence')
    offset++ // skip length
    if (derSig[offset++] !== 0x02) throw new Error('Invalid DER integer r')
    const rLen = derSig[offset++]
    let rStart = offset
    if (derSig[rStart] === 0x00) { rStart++; }
    const r = derSig.slice(rStart, offset + rLen)
    offset += rLen
    if (derSig[offset++] !== 0x02) throw new Error('Invalid DER integer s')
    const sLen = derSig[offset++]
    let sStart = offset
    if (derSig[sStart] === 0x00) { sStart++; }
    const s = derSig.slice(sStart, offset + sLen)

    const rPadded = Buffer.alloc(32)
    r.copy(rPadded, 32 - r.length)
    const sPadded = Buffer.alloc(32)
    s.copy(sPadded, 32 - s.length)

    const rawSig = Buffer.concat([rPadded, sPadded]).toString('base64url')
    const jwt = `${signingInput}.${rawSig}`

    // Exchange JWT for access token
    const params = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
      client_id: clientId,
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
<details><summary style="color:#888;cursor:pointer">JWT debug</summary>
<pre style="background:#000;padding:8px;font-size:12px;word-break:break-all">${jwt}</pre>
</details>
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
