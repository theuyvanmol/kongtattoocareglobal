import { NextResponse, NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const SHOP = 'kongtattoocareglobal.myshopify.com'
const API_VERSION = '2026-10'

function shopifyFetch(endpoint: string, options?: RequestInit) {
  const token = process.env.SHOPIFY_ADMIN_TOKEN
  if (!token) throw new Error('Missing SHOPIFY_ADMIN_TOKEN')
  return fetch(`https://${SHOP}/admin/api/${API_VERSION}${endpoint}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  try {
    if (id) {
      // Fetch full single product detail including body_html and metafields
      const [prodResp, metaResp] = await Promise.all([
        shopifyFetch(`/products/${id}.json`),
        shopifyFetch(`/products/${id}/metafields.json`),
      ])
      if (!prodResp.ok) return NextResponse.json({ error: `Shopify error ${prodResp.status}` }, { status: prodResp.status })
      const { product: p } = await prodResp.json()
      const metaData = metaResp.ok ? await metaResp.json() : { metafields: [] }
      const metafields: Record<string, unknown>[] = metaData.metafields || []

      const seoTitle = metafields.find((m: Record<string, unknown>) => m.namespace === 'global' && m.key === 'title_tag')?.value || ''
      const seoDescription = metafields.find((m: Record<string, unknown>) => m.namespace === 'global' && m.key === 'description_tag')?.value || ''
      const seoTitleId = metafields.find((m: Record<string, unknown>) => m.namespace === 'global' && m.key === 'title_tag')?.id
      const seoDescId = metafields.find((m: Record<string, unknown>) => m.namespace === 'global' && m.key === 'description_tag')?.id

      const variants = p.variants || []
      return NextResponse.json({
        product: {
          id: p.id,
          title: p.title,
          status: p.status,
          body_html: p.body_html || '',
          price: parseFloat(variants[0]?.price || '0'),
          inventory: variants.reduce((s: number, v: Record<string, unknown>) => s + (Number(v.inventory_quantity) || 0), 0),
          image: p.images?.[0]?.src || null,
          type: p.product_type || '',
          tags: typeof p.tags === 'string' ? p.tags : (p.tags || []).join(', '),
          variantCount: variants.length,
          variantId: variants[0]?.id,
          updated: p.updated_at,
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_title_metafield_id: seoTitleId,
          seo_desc_metafield_id: seoDescId,
        }
      })
    }

    // List all products
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
    const { id, title, status, price, body_html, tags, seo_title, seo_description, seo_title_metafield_id, seo_desc_metafield_id } = body

    // Update product core fields
    const productUpdate: Record<string, unknown> = { id }
    if (title !== undefined) productUpdate.title = title
    if (status !== undefined) productUpdate.status = status
    if (body_html !== undefined) productUpdate.body_html = body_html
    if (tags !== undefined) productUpdate.tags = tags

    const resp = await shopifyFetch(`/products/${id}.json`, {
      method: 'PUT',
      body: JSON.stringify({ product: productUpdate }),
    })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: 'Failed to update product', detail: text }, { status: 400 })
    }

    const prodData = await resp.json()

    // Update price on first variant
    if (price !== undefined) {
      const variantId = prodData.product?.variants?.[0]?.id
      if (variantId) {
        await shopifyFetch(`/variants/${variantId}.json`, {
          method: 'PUT',
          body: JSON.stringify({ variant: { id: variantId, price: String(price) } }),
        })
      }
    }

    // Upsert SEO metafields
    const seoOps: Promise<unknown>[] = []

    if (seo_title !== undefined) {
      seoOps.push(
        seo_title_metafield_id
          ? shopifyFetch(`/metafields/${seo_title_metafield_id}.json`, {
              method: 'PUT',
              body: JSON.stringify({ metafield: { id: seo_title_metafield_id, value: seo_title, type: 'single_line_text_field' } }),
            })
          : shopifyFetch(`/products/${id}/metafields.json`, {
              method: 'POST',
              body: JSON.stringify({ metafield: { namespace: 'global', key: 'title_tag', value: seo_title, type: 'single_line_text_field' } }),
            })
      )
    }

    if (seo_description !== undefined) {
      seoOps.push(
        seo_desc_metafield_id
          ? shopifyFetch(`/metafields/${seo_desc_metafield_id}.json`, {
              method: 'PUT',
              body: JSON.stringify({ metafield: { id: seo_desc_metafield_id, value: seo_description, type: 'single_line_text_field' } }),
            })
          : shopifyFetch(`/products/${id}/metafields.json`, {
              method: 'POST',
              body: JSON.stringify({ metafield: { namespace: 'global', key: 'description_tag', value: seo_description, type: 'single_line_text_field' } }),
            })
      )
    }

    await Promise.all(seoOps)

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
