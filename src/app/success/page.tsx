'use client'
import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

function SuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')

  useEffect(() => {
    // Fire Shopify purchase analytics
    try {
      const cart = JSON.parse(localStorage.getItem('kong-cart-v2') || '[]')
      const total = cart.reduce((s: number, i: { price: string; qty: number }) => s + parseFloat(i.price) * i.qty, 0)
      if (typeof window !== 'undefined' && (window as any).ShopifyAnalytics && total > 0) {
        (window as any).ShopifyAnalytics.trackPurchase({
          id: sessionId || 'unknown',
          total,
          count: cart.length,
        })
      }
      // Clear cart after successful purchase
      localStorage.removeItem('kong-cart-v2')
      window.dispatchEvent(new Event('kong:cart-updated'))
    } catch {}
  }, [sessionId])

  return (
    <div className="min-h-[70svh] flex items-center justify-center">
      <div className="text-center px-6 max-w-lg">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="hed text-[clamp(36px,8vw,64px)] mb-4">Order Confirmed!</h1>
        <p className="text-lg mb-2" style={{ color: 'var(--fg-70)' }}>
          Thank you for your order. You&apos;ll receive a confirmation email shortly.
        </p>
        <p className="text-sm mb-10" style={{ color: 'var(--fg-40)' }}>
          Your tattoo care essentials are on their way. 🚀
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop-all" className="btn btn-red px-8 py-4">Continue Shopping</Link>
          <Link href="/" className="btn btn-out px-8 py-4">Go Home</Link>
        </div>
        {/* What to expect */}
        <div className="mt-12 p-6 rounded-xl text-left" style={{ background: 'var(--bg2)', border: '1px solid var(--rule)' }}>
          <h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 18 }}>What Happens Next?</h2>
          <div className="flex flex-col gap-3">
            {[
              { icon: '📧', text: 'Order confirmation email sent to your inbox' },
              { icon: '📦', text: 'Packed and dispatched within 1–2 business days' },
              { icon: '🚚', text: 'Tracked delivery in 2–5 business days' },
              { icon: '💚', text: '30-day satisfaction guarantee on every product' },
            ].map(s => (
              <div key={s.text} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <span className="text-sm" style={{ color: 'var(--fg-70)' }}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <>
      <Nav />
      <div style={{ paddingTop: 100 }}>
        <Suspense fallback={<div className="min-h-[70svh]" />}>
          <SuccessContent />
        </Suspense>
      </div>
      <Footer />
    </>
  )
}
