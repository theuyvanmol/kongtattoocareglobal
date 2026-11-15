// ── Shopify ───────────────────────────────────────────────────────────────
export interface ShopifyImage {
  url: string
  altText: string | null
  width?: number
  height?: number
}

export interface ShopifyMoney {
  amount: string
  currencyCode: string
}

export interface ShopifyVariant {
  id: string
  title: string
  availableForSale: boolean
  price: ShopifyMoney
  compareAtPrice: ShopifyMoney | null
  selectedOptions: { name: string; value: string }[]
  sku: string | null
}

export interface ShopifyProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  tags: string[]
  vendor: string
  productType: string
  priceRange: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney }
  compareAtPriceRange?: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney }
  images: { edges: { node: ShopifyImage }[] }
  variants: { edges: { node: ShopifyVariant }[] }
  collections?: { edges: { node: { handle: string; title: string } }[] }
  seo?: { title: string | null; description: string | null }
  metafields?: { key: string; value: string }[]
}

export interface ShopifyCollection {
  id: string
  handle: string
  title: string
  description: string
  image: ShopifyImage | null
  products: { edges: { node: ShopifyProduct }[] }
}

// ── Cart ──────────────────────────────────────────────────────────────────
export interface CartItem {
  variantId: string
  productId?: string
  title: string
  variantTitle?: string
  price: string
  qty: number
  image?: string
  handle?: string
  // legacy aliases kept for backwards compat
  id?: string
  name?: string
}

// ── Blog ──────────────────────────────────────────────────────────────────
export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  author: string
  image: string
  tags: string[]
  readTime: number
}

// ── Admin / Auth ──────────────────────────────────────────────────────────
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface AdminSession {
  access_token: string
  user: { id: string; email: string }
  profile: UserProfile
  exp: number
}

// ── Analytics ─────────────────────────────────────────────────────────────
export interface AnalyticsOverview {
  sessions: number
  users: number
  pageviews: number
  realtimeUsers: number
}

export interface StripeStats {
  revenue: { last30Days: number; txCount: number; avgOrder: number; lifetime: number }
  chart: { labels: string[]; values: string[] }
}
