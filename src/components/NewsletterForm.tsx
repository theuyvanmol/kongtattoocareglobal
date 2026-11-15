'use client'

export default function NewsletterForm() {
  return (
    <form
      className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="your@email.com"
        className="rounded-xl px-4 h-12 text-sm outline-none flex-1 md:w-56"
        style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', color: '#fff' }}
      />
      <button type="submit" className="btn h-12 px-6 whitespace-nowrap" style={{ background: '#fff', color: 'var(--red)' }}>
        Subscribe →
      </button>
    </form>
  )
}
