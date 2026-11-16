import { NextResponse, NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const SHOP = 'kongtattoocareglobal.myshopify.com'
const API = `https://${SHOP}/admin/api/2026-10`

function shopifyFetch(path: string, options?: RequestInit) {
  const token = process.env.SHOPIFY_ADMIN_TOKEN
  if (!token) throw new Error('Missing SHOPIFY_ADMIN_TOKEN')
  return fetch(`${API}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
}

// We store promotions as a JSON metafield on the shop itself
// namespace: kong_admin, key: promotions
// value: JSON array of promotion objects

async function getPromotions() {
  const r = await shopifyFetch('/metafields.json?namespace=kong_admin&key=promotions&owner_resource=shop')
  const data = await r.json()
  const mf = data.metafields?.[0]
  if (!mf) return { metafieldId: null, promotions: [] }
  try {
    return { metafieldId: mf.id, promotions: JSON.parse(mf.value) }
  } catch {
    return { metafieldId: mf.id, promotions: [] }
  }
}

async function savePromotions(promotions: unknown[], metafieldId: string | null) {
  const body = {
    metafield: {
      namespace: 'kong_admin',
      key: 'promotions',
      value: JSON.stringify(promotions),
      type: 'json',
      owner_resource: 'shop',
    }
  }
  if (metafieldId) {
    const r = await shopifyFetch(`/metafields/${metafieldId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ metafield: { id: metafieldId, value: JSON.stringify(promotions), type: 'json' } }),
    })
    return r.json()
  } else {
    const r = await shopifyFetch('/metafields.json', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return r.json()
  }
}

export async function GET() {
  try {
    const { metafieldId, promotions } = await getPromotions()
    return NextResponse.json({ promotions, metafieldId })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { promotion } = body
    const { metafieldId, promotions } = await getPromotions()
    const newPromo = {
      id: Date.now().toString(),
      ...promotion,
      createdAt: new Date().toISOString(),
    }
    promotions.push(newPromo)
    await savePromotions(promotions, metafieldId)
    return NextResponse.json({ success: true, promotion: newPromo })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, promotion } = body
    const { metafieldId, promotions } = await getPromotions()
    const idx = promotions.findIndex((p: { id: string }) => p.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    promotions[idx] = { ...promotions[idx], ...promotion }
    await savePromotions(promotions, metafieldId)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const { metafieldId, promotions } = await getPromotions()
    const filtered = promotions.filter((p: { id: string }) => p.id !== id)
    await savePromotions(filtered, metafieldId)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
