import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getProduct, getProductHandles, getProducts } from '@/lib/shopify'
import { productMetadata } from '@/lib/metadata'
import AddToCartButton from './AddToCartButton'

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const handles = await getProductHandles()
    return handles.map((handle: string) => ({ handle }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  try {
    const { handle } = await params
    const p = await getProduct(handle)
    if (!p) return {}
    const img = p.images.edges[0]?.node.url
    return productMetadata(p.title, p.description || '', img)
  } catch {
    return {}
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  let product: import('@/lib/types').ShopifyProduct | null = null
  try {
    product = await getProduct(handle)
  } catch {}
  if (!product) notFound()
  const p = product!

  const images = p.images.edges.map((e) => e.node)
  const variants = p.variants.edges.map((e) => e.node)
  const price = p.priceRange.minVariantPrice
  const comparePrice = p.compareAtPriceRange?.minVariantPrice
  const hasDiscount =
    comparePrice && parseFloat(comparePrice.amount) > parseFloat(price.amount)
  const pct = hasDiscount
    ? Math.round((1 - parseFloat(price.amount) / parseFloat(comparePrice!.amount)) * 100)
    : 0

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.description,
    image: images.map((i: { url: string }) => i.url),
    brand: { '@type': 'Brand', name: p.vendor || 'KONG Tattoo Care' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: price.amount,
      priceCurrency: price.currencyCode,
      availability: 'https://schema.org/InStock',
      url: `https://www.kongtattoocareglobal.com/products/${handle}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Nav />
      <div style={{ paddingTop: 100 }}>
        <div className="wrap-wide cap" style={{ paddingTop: 40, paddingBottom: 96 }}>
          {/* Breadcrumb */}
          <nav className="text-xs mb-8" style={{ color: 'var(--fg-40)' }} aria-label="Breadcrumb">
            <a href="/" className="hover:text-[var(--fg-70)]">Home</a>
            <span className="mx-2">/</span>
            <a href="/shop-all" className="hover:text-[var(--fg-70)]">Shop</a>
            <span className="mx-2">/</span>
            <span style={{ color: 'var(--fg-70)' }}>{p.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Images */}
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden" style={{ background: 'var(--bg3)' }}>
                {images[0] && (
                  <Image
                    src={images[0].url}
                    alt={images[0].altText || p.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden" style={{ background: 'var(--bg3)' }}>
                      <Image
                        src={img.url}
                        alt={img.altText || p.title}
                        fill
                        className="object-cover"
                        sizes="25vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-6 lg:sticky lg:top-28">
              <div>
                <p className="lbl mb-2">{p.vendor || 'KONG Tattoo Care'}</p>
                <h1 className="hed text-[clamp(32px,5vw,52px)] mb-4">{p.title}</h1>

                <div className="flex items-center gap-3 mb-4">
                  <span className="hed text-4xl" style={{ color: 'var(--lime)' }}>
                    £{parseFloat(price.amount).toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-xl line-through" style={{ color: 'var(--fg-40)' }}>
                        £{parseFloat(comparePrice!.amount).toFixed(2)}
                      </span>
                      <span className="text-xs font-black px-2 py-1 rounded-md" style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-barlow-condensed)' }}>
                        SAVE {pct}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <AddToCartButton product={p} variants={variants} />

              {/* Description */}
              {p.description && (
                <div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-70)', whiteSpace: 'pre-line' }}>
                    {p.description}
                  </p>
                </div>
              )}

              {/* Benefits */}
              <div className="flex flex-col gap-2 p-5 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
                {[
                  '✅ Artist-developed formula',
                  '✅ Dermatologist-tested and approved',
                  '✅ Free UK delivery over £35',
                  '✅ 30-day satisfaction guarantee',
                ].map(b => (
                  <span key={b} className="text-sm" style={{ color: 'var(--fg-70)' }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
