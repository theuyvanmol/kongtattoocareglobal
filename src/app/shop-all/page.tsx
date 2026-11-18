import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { getProducts } from '@/lib/shopify'
import { ShopifyProduct } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Shop All Tattoo Aftercare Products',
  description: 'Browse the full KONG Tattoo Care range — Numb, Renew, Glow, Defend and Expert collections. Artist-developed, dermatologist-tested. Free UK delivery over £35.',
  openGraph: {
    title: 'Shop All | KONG Tattoo Care UK',
    description: 'Browse the full KONG Tattoo Care range — artist-developed, dermatologist-tested aftercare products. Free UK delivery over £35.',
  },
}

export const revalidate = 60

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'numb', label: 'Numb' },
  { id: 'renew', label: 'Renew' },
  { id: 'glow', label: 'Glow' },
  { id: 'defend', label: 'Defend' },
  { id: 'expert', label: 'Expert' },
]

export default async function ShopAllPage({
  searchParams,
}: {
  searchParams: { c?: string; sort?: string }
}) {
  const activeFilter = searchParams.c || 'all'

  let products: ShopifyProduct[] = []
  try {
    products = await getProducts(50)
  } catch {}

  const filtered =
    activeFilter === 'all'
      ? products
      : products.filter((p) => {
          const tags = p.tags || []
          const title = (p.title + ' ' + (p.vendor || '')).toLowerCase()
          return (
            tags.some((t: string) => t.toLowerCase().includes(activeFilter)) ||
            title.includes(activeFilter)
          )
        })

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'KONG Tattoo Care Products',
    numberOfItems: filtered.length,
    itemListElement: filtered.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.title,
        description: p.description?.substring(0, 160),
        url: `https://www.kongtattoocareglobal.com/products/${p.handle}`,
        image: p.images.edges[0]?.node.url,
        offers: {
          '@type': 'Offer',
          price: p.priceRange.minVariantPrice.amount,
          priceCurrency: p.priceRange.minVariantPrice.currencyCode,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Nav active="/shop-all" />
      <div style={{ paddingTop: 100 }}>
        {/* Page header */}
        <div className="wrap-wide cap" style={{ paddingTop: 40, paddingBottom: 40, borderBottom: '1px solid var(--rule)' }}>
          <p className="lbl mb-2">KONG Tattoo Care</p>
          <h1 className="hed text-[clamp(40px,7vw,70px)]">Shop All</h1>
          <p className="mt-2" style={{ color: 'var(--fg-70)', fontSize: 14 }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter bar */}
        <div className="wrap-wide cap" style={{ paddingTop: 20, paddingBottom: 20, borderBottom: '1px solid var(--rule)' }}>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {FILTERS.map((f) => (
              <a
                key={f.id}
                href={f.id === 'all' ? '/shop-all' : `/shop-all?c=${f.id}`}
                className="btn flex-shrink-0 text-[11px] py-2 px-4 h-9"
                style={
                  activeFilter === f.id
                    ? { background: 'var(--lime)', color: '#0a0a0a', borderColor: 'transparent' }
                    : { background: 'var(--bg2)', border: '1px solid var(--rule)', color: 'var(--fg-70)', minHeight: 36 }
                }
              >
                {f.label}
              </a>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="wrap-wide cap" style={{ paddingTop: 40, paddingBottom: 96 }}>
          {filtered.length === 0 ? (
            <div className="text-center py-24" style={{ color: 'var(--fg-40)' }}>
              <p className="text-lg">No products found in this collection.</p>
              <a href="/shop-all" className="btn btn-out mt-6 inline-flex">View All</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
