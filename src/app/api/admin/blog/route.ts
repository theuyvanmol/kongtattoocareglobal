import { NextResponse, NextRequest } from 'next/server'

const SHOP = 'kongtattoocareglobal.myshopify.com'
const API_VERSION = '2026-10'

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
    // Get blogs list first
    const blogsResp = await shopifyFetch('/blogs.json')
    if (!blogsResp.ok) {
      return NextResponse.json({ error: `Shopify error ${blogsResp.status}` }, { status: blogsResp.status })
    }
    const blogsData = await blogsResp.json()
    const blogs = blogsData.blogs || []

    // Get articles from all blogs
    const allArticles = await Promise.all(
      blogs.map(async (blog: Record<string, unknown>) => {
        const resp = await shopifyFetch(`/blogs/${blog.id}/articles.json?limit=20&fields=id,title,author,published_at,status,summary_html`)
        if (!resp.ok) return []
        const data = await resp.json()
        return (data.articles || []).map((a: Record<string, unknown>) => ({ ...a, blogId: blog.id, blogTitle: blog.title }))
      })
    )

    return NextResponse.json({ blogs, articles: allArticles.flat() })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { blogId, title, content, author, published } = body

    // Use first blog if no blogId
    let targetBlogId = blogId
    if (!targetBlogId) {
      const blogsResp = await shopifyFetch('/blogs.json')
      const blogsData = await blogsResp.json()
      if (blogsData.blogs?.length > 0) {
        targetBlogId = blogsData.blogs[0].id
      } else {
        // Create a blog
        const newBlogResp = await shopifyFetch('/blogs.json', {
          method: 'POST',
          body: JSON.stringify({ blog: { title: 'News' } }),
        })
        const newBlogData = await newBlogResp.json()
        targetBlogId = newBlogData.blog.id
      }
    }

    const resp = await shopifyFetch(`/blogs/${targetBlogId}/articles.json`, {
      method: 'POST',
      body: JSON.stringify({
        article: {
          title,
          author,
          body_html: content,
          published: published !== false,
        },
      }),
    })
    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: 'Failed to create article', detail: text }, { status: 400 })
    }
    const data = await resp.json()
    return NextResponse.json({ success: true, article: data.article })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { blogId, articleId } = await req.json()
    const resp = await shopifyFetch(`/blogs/${blogId}/articles/${articleId}.json`, { method: 'DELETE' })
    if (!resp.ok) {
      return NextResponse.json({ error: `Failed to delete: ${resp.status}` }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
