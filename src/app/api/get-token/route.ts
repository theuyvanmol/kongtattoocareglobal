import { NextResponse } from 'next/server'
import { createPrivateKey, createSign } from 'crypto'

// TEMPORARY route to get Shopify Admin API token via JWT client_credentials - DELETE AFTER USE
export async function GET() {
  try {
    const clientId = process.env.SHOPIFY_API_KEY || ''
    const privatePem = process.env.SHOPIFY_PRIVATE_KEY || ''
    const shop = 'kongtattoocareuk.myshopify.com'
    const tokenUrl = `https://${shop}/admin/oauth/access_token`

    if (!clientId || !privatePem) {
      return NextResponse.json({ error: 'Missing SHOPIFY_API_KEY or SHOPIFY_PRIVATE_KEY env vars' }, { status: 500 })
    }

    // Build JWT header + payload
    const now = Math.floor(Date.now() / 1000)
    const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: 'kong-admin-key-1', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({
      iss: clientId,
      sub: clientId,
      aud: tokenUrl,
      jti: crypto.randomUUID(),
      iat: now,
      nbf: now,
      exp: now + 60,
    })).toString('base64url')

    const signingInput = `${header}.${payload}`

    // Sign with the EC private key
    const privateKey = createPrivateKey(privatePem)
    const sign = createSign('SHA256')
    sign.update(signingInput)
    sign.end()
    const derSig = sign.sign(privateKey)

    // Convert DER signature to raw r||s format (64 bytes) for ES256 JWT
    // DER format: 0x30 len 0x02 rLen r 0x02 sLen s
    let r: Buffer, s: Buffer
    let offset = 2 // skip 0x30 and total length
    if (derSig[offset] === 0x02) {
      offset++ // skip 0x02
      const rLen = derSig[offset++]
      r = derSig.slice(offset, offset + rLen)
      offset += rLen
    } else {
      throw new Error('Invalid DER signature format')
    }
    if (derSig[offset] === 0x02) {
      offset++ // skip 0x02
      const sLen = derSig[offset++]
      s = derSig.slice(offset, offset + sLen)
    } else {
      throw new Error('Invalid DER signature format')
    }

    // Pad r and s to 32 bytes each
    const rPadded = Buffer.alloc(32)
    r.copy(rPadded, 32 - r.length)
    const sPadded = Buffer.alloc(32)
    s.copy(sPadded, 32 - s.length)

    const rawSig = Buffer.concat([rPadded, sPadded])
    const sigBase64url = rawSig.toString('base64url')

    const jwt = `${signingInput}.${sigBase64url}`

    // Exchange JWT for access token
    const params = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: jwt,
      client_id: clientId,
      subject_token: jwt,
      subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
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

    // Show full debug info if token not returned
    return new NextResponse(
      `<html><body style="font-family:monospace;padding:20px;background:#111;color:#ff6">
<h2 style="color:#fff">❌ No token returned (status ${resp.status})</h2>
<pre style="background:#000;padding:16px;border-radius:8px;font-size:14px;white-space:pre-wrap">${JSON.stringify(data, null, 2)}</pre>
<h3 style="color:#888">JWT used:</h3>
<pre style="background:#000;padding:16px;border-radius:8px;font-size:12px;word-break:break-all">${jwt}</pre>
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
