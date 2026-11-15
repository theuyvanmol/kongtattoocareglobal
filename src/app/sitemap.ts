import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/shopify'

const BASE = 'https://www.kongtattoocareglobal.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/shop-all`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/kong-kingdom`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    // Blog posts
    { url: `${BASE}/blog/complete-tattoo-aftercare-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/blog/why-numb-cream-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.65 },
  ]

  let productPages: MetadataRoute.Sitemap = []
  try {
    const data = await getProducts(100)
    productPages = data.products.edges.map(({ node }: { node: { handle: string; updatedAt?: string } }) => ({
      url: `${BASE}/products/${node.handle}`,
      lastModified: node.updatedAt ? new Date(node.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {}

  return [...staticPages, ...productPages]
}
