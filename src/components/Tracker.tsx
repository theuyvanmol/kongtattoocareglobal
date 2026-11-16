'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

function getVisitorId(): string {
  try {
    const key = 'kg_v'
    let id = sessionStorage.getItem(key)
    if (!id) {
      const arr = new Uint8Array(12)
      crypto.getRandomValues(arr)
      id = Array.from(arr).map(b => b.toString(36)).join('')
      sessionStorage.setItem(key, id)
    }
    return id
  } catch {
    return Math.random().toString(36).slice(2)
  }
}

function send(p: string, beat = false) {
  const v = getVisitorId()
  const r = document.referrer || undefined
  const payload = JSON.stringify({ v, p, r, beat })
  // Use fetch with keepalive — more reliable than sendBeacon for JSON
  fetch('/api/t', {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch(() => {})
}

export default function Tracker() {
  const pathname = usePathname()
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    send(pathname)
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(() => send(pathname, true), 60_000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [pathname])

  return null
}
