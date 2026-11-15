'use client'

export default function KingdomForm() {
  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--fg-70)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>FULL NAME</label>
        <input type="text" placeholder="Your name" className="w-full h-12 rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg3)', border: '1.5px solid var(--rule)', color: 'var(--fg)' }} />
      </div>
      <div>
        <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--fg-70)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>EMAIL ADDRESS</label>
        <input type="email" placeholder="your@email.com" className="w-full h-12 rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg3)', border: '1.5px solid var(--rule)', color: 'var(--fg)' }} />
      </div>
      <div>
        <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--fg-70)', fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '.1em' }}>ARE YOU A TATTOO ARTIST?</label>
        <select className="w-full h-12 rounded-xl px-4 text-sm outline-none appearance-none" style={{ background: 'var(--bg3)', border: '1.5px solid var(--rule)', color: 'var(--fg)' }}>
          <option>No, I&apos;m a tattoo enthusiast</option>
          <option>Yes, I&apos;m a tattoo artist</option>
          <option>I work in a tattoo studio</option>
        </select>
      </div>
      <button type="submit" className="btn btn-lime text-base py-4 mt-2">
        Join the Kingdom — Free →
      </button>
      <p className="text-xs text-center" style={{ color: 'var(--fg-40)' }}>By joining you agree to our Privacy Policy. Unsubscribe anytime.</p>
    </form>
  )
}
