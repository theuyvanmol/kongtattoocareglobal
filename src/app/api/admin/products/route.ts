import { NextResponse, NextRequest } from 'next/server'

const SHOP = 'kongtattoocareuk.myshopify.com'
const API_VERSION = '2024-10'

function shopifyFetch(endpoint: string, options?: RequestInit) {
  const token = process.env.SHOPIFY_ADMIN_TOKEN
  if (!token) throw new Error('Missing SHOPIFY_ADMIN_TOKEN')
  return fetch(`https://${SHOP}/admin/api/${API_VERSION}${endpoint}`, {
    ...options,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
}

export async function GET() {
  try {
    const resp = await shopifyFetch('/products.json?limit=50&fields=id,title,status,variants,images,product_type,tags,updated_at')
    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: `Shopify error ${resp.status}`, detail: text }, { status: resp.status })
    }
    const data = await resp.json()
    const products = (data.products || []).map((p: Record<string, unknown>) => {
      const variants = (p.variants as Record<string, unknown>[]) || []
      const images = (p.images as Record<string, string>[]) || []
      const price = variants[0]?.price || '0'
      const inventory = variants.reduce((sum: number, v: Record<string, unknown>) => sum + (Number(v.inventory_quantity) || 0), 0)
      return {
        id: p.id,
        title: p.title,
        status: p.status,
        price: parseFloat(price as string),
        inventory,
        image: images[0]?.src || null,
        type: p.product_type,
        tags: p.tags,
        updated: p.updated_at,
        variantCount: variants.length,
      }
    })
    return NextResponse.json({ products })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, title, status, price, body_html } = body

    // Update product
    const productUpdate: Record<string, unknown> = { id }
    if (title) productUpdate.title = title
    if (status) productUpdate.status = status
    if (body_html !== undefined) productUpdate.body_html = body_html

    const resp = await shopifyFetch(`/products/${id}.json`, {
      method: 'PUT',
      body: JSON.stringify({ product: productUpdate }),
    })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: 'Failed to update product', detail: text }, { status: 400 })
    }

    // Update price if provided (update first variant)
    if (price !== undefined) {
      const prodData = await resp.json()
      const variantId = prodData.product?.variants?.[0]?.id
      if (variantId) {
        await shopifyFetch(`/variants/${variantId}.json`, {
          method: 'PUT',
          body: JSON.stringify({ variant: { id: variantId, price: String(price) } }),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
