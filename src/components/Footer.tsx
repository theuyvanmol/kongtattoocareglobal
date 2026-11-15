import Link from 'next/link'

const COLS = [
  {
    title: 'Shop',
    links: [
      { href: '/shop-all', label: 'All Products' },
      { href: '/shop-all?c=numb', label: 'Numb Collection' },
      { href: '/shop-all?c=renew', label: 'Renew Collection' },
      { href: '/shop-all?c=defend', label: 'Defend Collection' },
      { href: '/shop-all?c=glow', label: 'Glow Collection' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About KONG' },
      { href: '/blog', label: 'Journal' },
      { href: '/kong-kingdom', label: 'The Kingdom' },
      { href: '/hub', label: 'Artist Hub' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/account', label: 'My Account' },
      { href: '/checkout', label: 'View Cart' },
      { href: 'mailto:care@kongtattoocare.com', label: 'Contact Us' },
      { href: '/blog', label: 'Aftercare Guide' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg3)', borderTop: '1px solid var(--rule)' }}>
      <div className="wrap cap" style={{ paddingTop: 64, paddingBottom: 40 }}>
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="hed text-4xl block mb-3" style={{ color: 'var(--red)' }}>KONG</span>
            <p style={{ color: 'var(--fg-70)', fontSize: 13, lineHeight: 1.7 }}>
              Artist-developed, dermatologist-tested tattoo aftercare from the UK. Built for the culture.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com/kongtattoocare" target="_blank" rel="noopener" aria-label="Instagram" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--fg-70)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="https://tiktok.com/@kongtattoocare" target="_blank" rel="noopener" aria-label="TikTok" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--fg-70)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.02-.08z"/></svg>
              </a>
            </div>
          </div>
          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <p className="lbl mb-4">{col.title}</p>
              <ul className="flex flex-col gap-2.5 list-none">
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} style={{ color: 'var(--fg-70)', fontSize: 13 }} className="hover:text-[var(--lime)] transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-6" style={{ borderTop: '1px solid var(--rule)' }}>
          <p style={{ color: 'var(--fg-40)', fontSize: 12 }}>
            © {new Date().getFullYear()} KONG Tattoo Care Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms' },
              { href: '/cookies', label: 'Cookies' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ color: 'var(--fg-40)', fontSize: 12 }} className="hover:text-[var(--fg-70)] transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
