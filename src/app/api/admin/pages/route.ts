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
      const [pageResp, metaResp] = await Promise.all([
        shopifyFetch(`/pages/${id}.json`),
        shopifyFetch(`/pages/${id}/metafields.json`),
      ])
      if (!pageResp.ok) return NextResponse.json({ error: 'Page not found' }, { status: 404 })
      const { page: p } = await pageResp.json()
      const metaData = metaResp.ok ? await metaResp.json() : { metafields: [] }
      const metafields: Record<string, unknown>[] = metaData.metafields || []
      const seoTitle = metafields.find(m => m.namespace === 'global' && m.key === 'title_tag')?.value || ''
      const seoDesc = metafields.find(m => m.namespace === 'global' && m.key === 'description_tag')?.value || ''
      return NextResponse.json({
        page: {
          id: p.id, title: p.title, body_html: p.body_html || '',
          handle: p.handle, published: !!p.published_at, published_at: p.published_at,
          created_at: p.created_at, updated_at: p.updated_at,
          seo_title: seoTitle, seo_description: seoDesc,
          seo_title_id: metafields.find(m => m.namespace === 'global' && m.key === 'title_tag')?.id,
          seo_desc_id: metafields.find(m => m.namespace === 'global' && m.key === 'description_tag')?.id,
        }
      })
    }

    const resp = await shopifyFetch('/pages.json?limit=50&fields=id,title,handle,published_at,created_at,updated_at,body_html')
    if (!resp.ok) return NextResponse.json({ error: `Shopify ${resp.status}` }, { status: resp.status })
    const { pages } = await resp.json()
    return NextResponse.json({
      pages: pages.map((p: Record<string, unknown>) => ({
        id: p.id, title: p.title, handle: p.handle,
        published: !!p.published_at, published_at: p.published_at,
        created_at: p.created_at, updated_at: p.updated_at,
        preview: ((p.body_html as string) || '').replace(/<[^>]+>/g, '').slice(0, 80),
      }))
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, title, body_html, published, seo_title, seo_description, seo_title_id, seo_desc_id } = body

    const r = await shopifyFetch(`/pages/${id}.json`, {
      method: 'PUT',
      body: JSON.stringify({ page: { id, title, body_html, published_at: published ? new Date().toISOString() : null } }),
    })
    if (!r.ok) {
      const text = await r.text()
      return NextResponse.json({ error: 'Failed to update page', detail: text }, { status: 400 })
    }

    // SEO metafields
    const ops = []
    if (seo_title !== undefined) {
      ops.push(seo_title_id
        ? shopifyFetch(`/metafields/${seo_title_id}.json`, { method: 'PUT', body: JSON.stringify({ metafield: { id: seo_title_id, value: seo_title, type: 'single_line_text_field' } }) })
        : shopifyFetch(`/pages/${id}/metafields.json`, { method: 'POST', body: JSON.stringify({ metafield: { namespace: 'global', key: 'title_tag', value: seo_title, type: 'single_line_text_field' } }) })
      )
    }
    if (seo_description !== undefined) {
      ops.push(seo_desc_id
        ? shopifyFetch(`/metafields/${seo_desc_id}.json`, { method: 'PUT', body: JSON.stringify({ metafield: { id: seo_desc_id, value: seo_description, type: 'single_line_text_field' } }) })
        : shopifyFetch(`/pages/${id}/metafields.json`, { method: 'POST', body: JSON.stringify({ metafield: { namespace: 'global', key: 'description_tag', value: seo_description, type: 'single_line_text_field' } }) })
      )
    }
    await Promise.all(ops)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, body_html, published } = await req.json()
    const r = await shopifyFetch('/pages.json', {
      method: 'POST',
      body: JSON.stringify({ page: { title, body_html, published_at: published ? new Date().toISOString() : null } }),
    })
    if (!r.ok) {
      const text = await r.text()
      return NextResponse.json({ error: 'Failed to create page', detail: text }, { status: 400 })
    }
    const { page } = await r.json()
    return NextResponse.json({ success: true, page })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    const r = await shopifyFetch(`/pages/${id}.json`, { method: 'DELETE' })
    if (!r.ok) return NextResponse.json({ error: `Delete failed: ${r.status}` }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
