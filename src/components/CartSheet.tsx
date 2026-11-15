'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { CartItem } from '@/lib/types'

function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem('kong-cart-v2') || '[]')
  } catch { return [] }
}

function saveCart(cart: CartItem[]) {
  try {
    localStorage.setItem('kong-cart-v2', JSON.stringify(cart))
    window.dispatchEvent(new Event('kong:cart-updated'))
  } catch {}
}

export default function CartSheet() {
  const [open, setOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

  const refresh = useCallback(() => setCart(getCart()), [])

  useEffect(() => {
    refresh()
    window.addEventListener('kong:cart-updated', refresh)
    window.addEventListener('kong:cart-open', () => setOpen(true))
    return () => {
      window.removeEventListener('kong:cart-updated', refresh)
    }
  }, [refresh])

  const total = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0)

  const update = (id: string, delta: number) => {
    const updated = cart.map(i => i.variantId === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0)
    saveCart(updated)
    setCart(updated)
  }

  const remove = (id: string) => {
    const updated = cart.filter(i => i.variantId !== id)
    saveCart(updated)
    setCart(updated)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[300]" style={{ background: 'rgba(0,0,0,.55)' }} onClick={() => setOpen(false)} />
      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 z-[310] w-full max-w-sm flex flex-col" style={{ background: 'var(--bg)', borderLeft: '1px solid var(--rule)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--rule)' }}>
          <h2 className="hed text-2xl">Your Cart</h2>
          <button onClick={() => setOpen(false)} className="p-2 text-xl" aria-label="Close cart">✕</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center" style={{ color: 'var(--fg-40)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.variantId} className="flex gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--bg3)' }}>
                  {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug mb-1" style={{ color: 'var(--fg)' }}>{item.title}</p>
                  {item.variantTitle !== 'Default Title' && (
                    <p className="text-xs mb-1.5" style={{ color: 'var(--fg-40)' }}>{item.variantTitle}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-lg overflow-hidden" style={{ border: '1px solid var(--rule)' }}>
                      <button onClick={() => update(item.variantId, -1)} className="w-7 h-7 text-sm grid place-items-center hover:bg-[var(--bg3)] transition-colors">−</button>
                      <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                      <button onClick={() => update(item.variantId, 1)} className="w-7 h-7 text-sm grid place-items-center hover:bg-[var(--bg3)] transition-colors">+</button>
                    </div>
                    <span className="font-bold text-sm" style={{ color: 'var(--lime)', fontFamily: 'var(--font-barlow-condensed)' }}>
                      £{(parseFloat(item.price) * item.qty).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button onClick={() => remove(item.variantId)} className="p-1 self-start" aria-label="Remove" style={{ color: 'var(--fg-40)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-5 mobile-safe-bottom" style={{ borderTop: '1px solid var(--rule)' }}>
            <div className="flex justify-between mb-4">
              <span style={{ color: 'var(--fg-70)' }}>Subtotal</span>
              <span className="font-bold" style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 18 }}>£{total.toFixed(2)}</span>
            </div>
            <a href="/checkout" className="btn btn-lime w-full">Checkout →</a>
            <p className="text-center text-xs mt-2.5" style={{ color: 'var(--fg-40)' }}>Free UK delivery over £35</p>
          </div>
        )}
      </aside>
    </>
  )
}
