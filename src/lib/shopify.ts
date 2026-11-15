import type { ShopifyProduct, ShopifyCollection } from './types'

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'kongtattoocareuk.myshopify.com'
const TOKEN = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN || ''
const API_URL = `https://${DOMAIN}/api/2024-01/graphql.json`

const PRODUCT_FIELDS = `
  id handle title description descriptionHtml tags vendor productType
  seo { title description }
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
  images(first: 8) { edges { node { url altText width height } } }
  variants(first: 20) {
    edges { node {
      id title availableForSale sku
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
    } }
  }
  collections(first: 5) { edges { node { handle title } } }
`

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }, // ISR — revalidate product data every 60s
  })

  if (!res.ok) throw new Error(`Shopify API ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0]?.message || 'Shopify GraphQL error')
  return json.data as T
}

// ── Products ──────────────────────────────────────────────────────────────
export async function getProducts(first = 50): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ products: { edges: { node: ShopifyProduct }[] } }>(`
    query Products($first: Int!) {
      products(first: $first, sortKey: TITLE) {
        edges { node { ${PRODUCT_FIELDS} } }
      }
    }
  `, { first })
  return data.products.edges.map(e => e.node)
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(`
    query Product($handle: String!) {
      product(handle: $handle) { ${PRODUCT_FIELDS} }
    }
  `, { handle })
  return data.product
}

export async function getProductHandles(): Promise<string[]> {
  const data = await shopifyFetch<{ products: { edges: { node: { handle: string } }[] } }>(`
    query Handles {
      products(first: 250, sortKey: TITLE) {
        edges { node { handle } }
      }
    }
  `)
  return data.products.edges.map(e => e.node.handle)
}

// ── Collections ───────────────────────────────────────────────────────────
export async function getCollection(handle: string): Promise<ShopifyCollection | null> {
  const data = await shopifyFetch<{ collection: ShopifyCollection | null }>(`
    query Collection($handle: String!) {
      collection(handle: $handle) {
        id handle title description
        image { url altText }
        products(first: 50) { edges { node { ${PRODUCT_FIELDS} } } }
      }
    }
  `, { handle })
  return data.collection
}

// ── Helpers ───────────────────────────────────────────────────────────────
export function formatMoney(amount: string | number, currency = 'GBP'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(n)
}

export function collectionFromProduct(product: ShopifyProduct): string {
  const colls = product.collections?.edges?.map(e => e.node.handle) ?? []
  const MAP: Record<string, string> = {
    renew: 'renew', numb: 'numb', glow: 'glow', defend: 'defend', expert: 'expert',
    aftercare: 'renew', healing: 'renew', piercing: 'defend', suncream: 'glow', numbing: 'numb',
  }
  for (const h of colls) { const v = MAP[h]; if (v) return v }
  const tags = product.tags.map(t => t.toLowerCase())
  for (const [k, v] of Object.entries(MAP)) { if (tags.includes(k)) return v }
  const t = product.title.toLowerCase()
  if (t.includes('numb') || t.includes('rapid')) return 'numb'
  if (t.includes('sun') || t.includes('glow') || t.includes('balm')) return 'glow'
  if (t.includes('expert') || t.includes('glide')) return 'expert'
  if (t.includes('defend') || t.includes('piercing')) return 'defend'
  return 'renew'
}
