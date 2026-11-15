import Link from 'next/link'
import Image from 'next/image'
import { ShopifyProduct } from '@/lib/types'

interface Props {
  product: ShopifyProduct
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: Props) {
  const img = product.images.edges[0]?.node
  const price = product.priceRange.minVariantPrice
  const comparePrice = product.compareAtPriceRange?.minVariantPrice

  const hasDiscount =
    comparePrice &&
    parseFloat(comparePrice.amount) > parseFloat(price.amount)

  const pct = hasDiscount
    ? Math.round((1 - parseFloat(price.amount) / parseFloat(comparePrice!.amount)) * 100)
    : 0

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block relative rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-1"
      style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden" style={{ background: 'var(--bg3)' }}>
        {img ? (
          <Image
            src={img.url}
            alt={img.altText || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full grid place-items-center" style={{ color: 'var(--fg-40)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 text-[10px] font-black px-2 py-1 rounded-md" style={{ background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>
            -{pct}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="lbl mb-1">{product.vendor}</p>
        <h3 className="font-semibold text-sm leading-snug mb-2" style={{ color: 'var(--fg)' }}>
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base" style={{ color: 'var(--lime)', fontFamily: 'var(--font-barlow-condensed)' }}>
            £{parseFloat(price.amount).toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm line-through" style={{ color: 'var(--fg-40)' }}>
              £{parseFloat(comparePrice!.amount).toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Quick-add hover overlay — mobile: always show; desktop: show on hover */}
      <div className="absolute inset-x-0 bottom-0 p-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <span className="btn btn-lime w-full text-[11px] pointer-events-none">
          View Product
        </span>
      </div>
    </Link>
  )
}
