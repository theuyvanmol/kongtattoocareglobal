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
  const articleId = searchParams.get('articleId')
  const blogId = searchParams.get('blogId')

  try {
    // List all blogs first
    const blogsResp = await shopifyFetch('/blogs.json')
    if (!blogsResp.ok) return NextResponse.json({ error: `Shopify ${blogsResp.status}` }, { status: blogsResp.status })
    const { blogs } = await blogsResp.json()

    if (articleId && blogId) {
      // Get single article detail
      const r = await shopifyFetch(`/blogs/${blogId}/articles/${articleId}.json`)
      if (!r.ok) return NextResponse.json({ error: `Article not found` }, { status: 404 })
      const { article: a } = await r.json()
      return NextResponse.json({
        article: {
          id: a.id,
          blogId: a.blog_id,
          title: a.title,
          body_html: a.body_html || '',
          summary_html: a.summary_html || '',
          author: a.author || '',
          tags: a.tags || '',
          published: a.published_at ? true : false,
          published_at: a.published_at,
          image: a.image?.src || null,
          handle: a.handle,
          created_at: a.created_at,
          updated_at: a.updated_at,
        }
      })
    }

    // Get articles for each blog
    const allArticles = []
    for (const blog of blogs) {
      const artResp = await shopifyFetch(`/blogs/${blog.id}/articles.json?limit=50&fields=id,title,author,tags,published_at,created_at,updated_at,summary_html,image,handle`)
      if (artResp.ok) {
        const { articles } = await artResp.json()
        for (const a of articles) {
          allArticles.push({
            id: a.id,
            blogId: blog.id,
            blogTitle: blog.title,
            title: a.title,
            author: a.author || '',
            tags: a.tags || '',
            published: !!a.published_at,
            published_at: a.published_at,
            summary: a.summary_html ? a.summary_html.replace(/<[^>]+>/g, '').slice(0, 100) : '',
            image: a.image?.src || null,
            handle: a.handle,
            created_at: a.created_at,
            updated_at: a.updated_at,
          })
        }
      }
    }

    return NextResponse.json({ blogs, articles: allArticles })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { blogId, title, body_html, summary_html, author, tags, published } = body

    const r = await shopifyFetch(`/blogs/${blogId}/articles.json`, {
      method: 'POST',
      body: JSON.stringify({
        article: {
          title,
          body_html,
          summary_html: summary_html || '',
          author: author || 'Kong Tattoo Care',
          tags: tags || '',
          published: published !== false,
        }
      }),
    })

    if (!r.ok) {
      const text = await r.text()
      return NextResponse.json({ error: 'Failed to create article', detail: text }, { status: 400 })
    }
    const { article } = await r.json()
    return NextResponse.json({ success: true, article })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { blogId, articleId, title, body_html, summary_html, author, tags, published } = body

    const r = await shopifyFetch(`/blogs/${blogId}/articles/${articleId}.json`, {
      method: 'PUT',
      body: JSON.stringify({
        article: {
          id: articleId,
          title,
          body_html,
          summary_html: summary_html || '',
          author,
          tags,
          published,
        }
      }),
    })

    if (!r.ok) {
      const text = await r.text()
      return NextResponse.json({ error: 'Failed to update article', detail: text }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { blogId, articleId } = await req.json()
    const r = await shopifyFetch(`/blogs/${blogId}/articles/${articleId}.json`, { method: 'DELETE' })
    if (!r.ok) return NextResponse.json({ error: `Delete failed: ${r.status}` }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
