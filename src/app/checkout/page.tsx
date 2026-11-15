'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { CartItem } from '@/lib/types'

function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem('kong-cart-v2') || '[]') } catch { return [] }
}
function saveCart(c: CartItem[]) {
  try {
    localStorage.setItem('kong-cart-v2', JSON.stringify(c))
    window.dispatchEvent(new Event('kong:cart-updated'))
  } catch {}
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(() => setCart(getCart()), [])
  useEffect(() => { refresh() }, [refresh])

  const subtotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0)
  const freeShipping = subtotal >= 35
  const shipping = freeShipping ? 0 : 4.99
  const total = subtotal + shipping

  const update = (id: string, delta: number) => {
    const updated = cart.map(i => i.variantId === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0)
    saveCart(updated); setCart(updated)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      })
      const d = await res.json()
      if (d.url) {
        // Track Shopify
        if (typeof window !== 'undefined' && (window as any).ShopifyAnalytics) {
          (window as any).ShopifyAnalytics.trackCheckoutStart({ total, count: cart.length, items: cart })
        }
        window.location.href = d.url
      } else {
        setError(d.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Nav />
      <div style={{ paddingTop: 100 }}>
        <div className="wrap-wide cap" style={{ paddingTop: 40, paddingBottom: 96 }}>
          <p className="lbl mb-2">Your Order</p>
          <h1 className="hed text-[clamp(36px,6vw,56px)] mb-10">Cart</h1>

          {cart.length === 0 ? (
            <div className="text-center py-24" style={{ color: 'var(--fg-40)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <p className="text-lg mb-6">Your cart is empty</p>
              <a href="/shop-all" className="btn btn-red">Start Shopping</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              {/* Cart items */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {cart.map(item => (
                  <div key={item.variantId} className="flex gap-4 p-4 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--bg3)' }}>
                      {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={`/products/${item.handle}`} className="font-semibold text-sm hover:text-[var(--lime)] transition-colors">{item.title}</a>
                      {item.variantTitle !== 'Default Title' && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--fg-40)' }}>{item.variantTitle}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 rounded-lg overflow-hidden" style={{ border: '1px solid var(--rule)' }}>
                          <button onClick={() => update(item.variantId, -1)} className="w-8 h-8 text-sm grid place-items-center hover:bg-[var(--bg3)]">−</button>
                          <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                          <button onClick={() => update(item.variantId, 1)} className="w-8 h-8 text-sm grid place-items-center hover:bg-[var(--bg3)]">+</button>
                        </div>
                        <span className="font-bold" style={{ color: 'var(--lime)', fontFamily: 'var(--font-barlow-condensed)', fontSize: 18 }}>
                          £{(parseFloat(item.price) * item.qty).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="rounded-xl p-6 sticky top-28" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
                <h2 className="font-bold text-xl mb-5" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>Order Summary</h2>
                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--fg-70)' }}>Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--fg-70)' }}>Shipping</span>
                    <span style={{ color: freeShipping ? 'var(--lime)' : 'inherit' }}>
                      {freeShipping ? 'FREE' : `£${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {!freeShipping && (
                    <p className="text-xs py-2 px-3 rounded-lg" style={{ background: 'var(--lime-g)', color: 'var(--lime)' }}>
                      Add £{(35 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                  <div className="border-t pt-3 flex justify-between font-bold text-lg" style={{ borderColor: 'var(--rule)' }}>
                    <span>Total</span>
                    <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 22 }}>£{total.toFixed(2)}</span>
                  </div>
                </div>
                {error && (
                  <p className="text-sm mb-3 p-3 rounded-lg" style={{ background: 'rgba(230,30,50,.1)', color: 'var(--red)' }}>{error}</p>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="btn btn-lime w-full text-base"
                >
                  {loading ? 'Processing…' : 'Proceed to Checkout →'}
                </button>
                <p className="text-xs text-center mt-3" style={{ color: 'var(--fg-40)' }}>
                  Secure checkout via Stripe. You\'ll be redirected to complete payment.
                </p>
                <div className="flex items-center justify-center gap-3 mt-4" style={{ color: 'var(--fg-40)', fontSize: 11 }}>
                  <span>🔒 Secure</span>
                  <span>·</span>
                  <span>SSL Encrypted</span>
                  <span>·</span>
                  <span>30-day returns</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
