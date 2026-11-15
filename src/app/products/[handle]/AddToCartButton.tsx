'use client'
import { useState } from 'react'
import { CartItem, ShopifyProduct } from '@/lib/types'

interface Variant {
  id: string
  title: string
  priceV2?: { amount: string }
  price?: { amount: string }
  availableForSale: boolean
}

function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem('kong-cart-v2') || '[]') } catch { return [] }
}

function saveCart(c: CartItem[]) {
  try {
    localStorage.setItem('kong-cart-v2', JSON.stringify(c))
    window.dispatchEvent(new Event('kong:cart-updated'))
  } catch {}
}

export default function AddToCartButton({
  product,
  variants,
}: {
  product: ShopifyProduct
  variants: Variant[]
}) {
  const [selected, setSelected] = useState(variants[0]?.id || '')
  const [added, setAdded] = useState(false)

  const variant = variants.find(v => v.id === selected) || variants[0]
  const price = variant?.priceV2?.amount || variant?.price?.amount || product.priceRange.minVariantPrice.amount
  const image = product.images.edges[0]?.node.url

  const addToCart = () => {
    if (!variant) return
    const cart = getCart()
    const existing = cart.findIndex(i => i.variantId === variant.id)
    if (existing > -1) {
      cart[existing].qty++
    } else {
      cart.push({
        variantId: variant.id,
        productId: product.id,
        title: product.title,
        variantTitle: variant.title,
        price,
        qty: 1,
        image,
        handle: product.handle,
      })
    }
    saveCart(cart)

    // Track Shopify analytics
    if (typeof window !== 'undefined' && (window as any).ShopifyAnalytics) {
      (window as any).ShopifyAnalytics.trackAddToCart({
        name: product.title,
        price: parseFloat(price),
        qty: 1,
      })
    }

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)

    // Open cart sheet
    window.dispatchEvent(new Event('kong:cart-open'))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Variant selector (if more than one variant) */}
      {variants.length > 1 && (
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: 'var(--fg-70)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>
            SELECT SIZE / VARIANT
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                disabled={!v.availableForSale}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-all"
                style={
                  selected === v.id
                    ? { background: 'var(--lime)', color: '#0a0a0a', border: '2px solid var(--lime)' }
                    : v.availableForSale
                      ? { background: 'var(--bg2)', border: '1.5px solid var(--rule)', color: 'var(--fg-70)' }
                      : { background: 'var(--bg3)', border: '1.5px solid var(--rule)', color: 'var(--fg-40)', cursor: 'not-allowed', textDecoration: 'line-through' }
                }
              >
                {v.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={addToCart}
        disabled={!variant?.availableForSale}
        className="btn btn-red text-base py-4"
        style={added ? { background: 'var(--lime)', color: '#0a0a0a' } : {}}
      >
        {added ? '✓ Added to Cart!' : !variant?.availableForSale ? 'Out of Stock' : 'Add to Cart →'}
      </button>

      <a href="/checkout" className="btn btn-out text-base py-4 text-center">
        Buy Now
      </a>
    </div>
  )
}
