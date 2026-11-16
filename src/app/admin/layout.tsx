'use client'
import { useState, useEffect, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const NAV: [string, string, string?][] = [
  ['/admin', 'Dashboard'],
  ['---', 'SALES'],
  ['/admin/orders', 'Orders'],
  ['/admin/payments', 'Payments'],
  ['/admin/customers', 'Customers'],
  ['/admin/discounts', 'Discounts'],
  ['---', 'CONTENT'],
  ['/admin/products', 'Products'],
  ['/admin/blogs', 'Blog Posts'],
  ['/admin/pages', 'Pages'],
  ['---', 'COMMS'],
  ['/admin/enquiries', 'Enquiries'],
  ['/admin/email', 'Email'],
  ['---', 'SYSTEM'],
  ['/admin/settings', 'Settings'],
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const ok = sessionStorage.getItem('kong_admin_auth')
    if (ok === '1') setAuthed(true)
    else router.replace('/admin-login')
  }, [router])

  if (authed === null) return null

  function handleSignOut() {
    sessionStorage.removeItem('kong_admin_auth')
    router.replace('/admin-login')
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .adm{display:grid;grid-template-columns:230px minmax(0,1fr);min-height:100vh;background:#0f0f0f;font-family:'DM Sans',Arial,sans-serif}
        .adm-side{background:#111;border-right:1px solid #1e1e1e;padding:0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
        .adm-logo{display:flex;align-items:center;gap:10px;padding:22px 20px 18px;border-bottom:1px solid #1e1e1e}
        .adm-logo-icon{width:34px;height:34px;background:#E61E32;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#fff;letter-spacing:-1px;flex-shrink:0;font-family:'Barlow Condensed',Impact,sans-serif}
        .adm-logo-text{font-size:13px;font-weight:700;color:#fff;letter-spacing:.5px;line-height:1.2}
        .adm-logo-sub{font-size:10px;color:#666;letter-spacing:1.4px;text-transform:uppercase}
        .adm-nav{padding:12px 10px;flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:1px}
        .adm-nav a{display:block;padding:9px 12px;border-radius:8px;font-size:13px;color:#888;text-decoration:none;transition:background .12s,color .12s;font-weight:400}
        .adm-nav a:hover{background:#1a1a1a;color:#ccc}
        .adm-nav a.active{background:#E61E32;color:#fff;font-weight:600}
        .adm-nav-sep{height:1px;background:#1e1e1e;margin:8px 2px}
        .adm-user{padding:14px 16px;border-top:1px solid #1e1e1e;font-size:12px;color:#555;display:flex;justify-content:space-between;align-items:center}
        .adm-signout{background:none;border:none;color:#555;font-size:11px;cursor:pointer;padding:4px 8px;border-radius:5px;transition:color .12s}
        .adm-signout:hover{color:#ccc}
        .adm-main{padding:32px 36px;min-width:0;background:#0f0f0f}
        .adm-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #1e1e1e}
        .adm-head h1{font-size:clamp(22px,2vw,30px);font-weight:700;color:#fff;letter-spacing:-.5px}
        .adm-head small{font-size:12px;color:#555}
        .adm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:24px}
        .adm-stat{background:#161616;border:1px solid #222;border-radius:12px;padding:16px 18px}
        .adm-stat b{display:block;font-size:28px;font-weight:700;color:#fff;line-height:1.1;margin-bottom:4px}
        .adm-stat span{font-size:11px;color:#555;letter-spacing:.3px}
        .adm-stat.red{border-color:#E61E3240}
        .adm-stat.red b{color:#E61E32}
        .adm-stat.lime{border-color:#C8FF0040}
        .adm-stat.lime b{color:#C8FF00}
        .adm-card{background:#161616;border:1px solid #222;border-radius:12px;padding:20px 22px}
        .adm-card-title{font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:#555;font-weight:500;margin-bottom:14px}
        .adm-table-wrap{overflow-x:auto;background:#161616;border:1px solid #222;border-radius:12px}
        .adm-table{width:100%;border-collapse:collapse;font-size:13px}
        .adm-table th{text-align:left;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#555;padding:12px 14px;border-bottom:1px solid #1e1e1e;white-space:nowrap;font-weight:500}
        .adm-table td{padding:11px 14px;border-bottom:1px solid #1a1a1a;color:#ccc;vertical-align:middle}
        .adm-table tr:last-child td{border-bottom:0}
        .adm-table tr:hover td{background:#1a1a1a}
        .adm-badge{display:inline-block;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:600;letter-spacing:.2px}
        .adm-badge.paid,.adm-badge.fulfilled,.adm-badge.active,.adm-badge.live{background:#C8FF0020;color:#C8FF00;border:1px solid #C8FF0040}
        .adm-badge.pending,.adm-badge.unfulfilled,.adm-badge.draft{background:#ff990020;color:#ff9900;border:1px solid #ff990040}
        .adm-badge.refunded,.adm-badge.failed,.adm-badge.archived{background:#E61E3220;color:#E61E32;border:1px solid #E61E3240}
        .adm-badge.succeeded{background:#C8FF0020;color:#C8FF00;border:1px solid #C8FF0040}
        .adm-btn{display:inline-flex;align-items:center;gap:6px;background:#E61E32;color:#fff;border:none;border-radius:8px;padding:9px 16px;font:600 12px 'DM Sans',Arial,sans-serif;cursor:pointer;transition:background .12s;letter-spacing:.3px;text-decoration:none;white-space:nowrap}
        .adm-btn:hover{background:#c41828}
        .adm-btn.ghost{background:transparent;color:#ccc;border:1px solid #333}
        .adm-btn.ghost:hover{background:#1a1a1a}
        .adm-btn.lime{background:#C8FF00;color:#000}
        .adm-btn.lime:hover{background:#b8ef00}
        .adm-filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;align-items:center}
        .adm-filters input,.adm-filters select{border:1px solid #222;border-radius:8px;background:#161616;padding:8px 12px;font:400 13px 'DM Sans',Arial,sans-serif;color:#ccc;min-width:0;outline:none}
        .adm-filters input:focus,.adm-filters select:focus{border-color:#E61E32;box-shadow:0 0 0 2px #E61E3220}
        .adm-form label{font-size:11px;color:#555;letter-spacing:.5px;text-transform:uppercase;font-weight:500;display:block;margin-bottom:5px}
        .adm-form input,.adm-form select,.adm-form textarea{width:100%;border:1px solid #222;background:#111;border-radius:8px;padding:10px 12px;font:400 13px/1.5 'DM Sans',Arial,sans-serif;color:#ccc;outline:none;transition:border-color .12s}
        .adm-form input:focus,.adm-form select:focus,.adm-form textarea:focus{border-color:#E61E32;box-shadow:0 0 0 2px #E61E3220}
        .adm-form textarea{min-height:120px;resize:vertical}
        .adm-form-row{display:grid;gap:14px;margin-bottom:14px}
        .adm-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:50;display:flex;align-items:center;justify-content:center;padding:20px}
        .adm-modal{background:#161616;border:1px solid #2a2a2a;border-radius:16px;padding:28px;width:min(100%,520px);max-height:90vh;overflow-y:auto}
        .adm-modal h2{font-size:18px;font-weight:700;color:#fff;margin-bottom:20px}
        .adm-row{display:flex;gap:10px}
        .adm-empty{text-align:center;padding:48px 20px;color:#444;font-size:13px}
        .adm-loading{text-align:center;padding:48px 20px;color:#444;font-size:13px}
        .adm-error{background:#E61E3215;border:1px solid #E61E3240;border-radius:10px;padding:12px 16px;color:#ff6b6b;font-size:13px;margin-bottom:20px}
        .adm-muted{color:#555;font-size:12px}
        .adm-enq-item{background:#161616;border:1px solid #222;border-radius:12px;padding:18px 20px;margin-bottom:10px}
        .adm-enq-item.unread{border-color:#E61E3240}
        .adm-enq-head{display:flex;gap:12px;align-items:center;margin-bottom:10px;flex-wrap:wrap}
        .adm-enq-msg{color:#ccc;font-size:14px;line-height:1.6;margin-bottom:12px}
        .adm-enq-foot{display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:12px;color:#555}
        .adm-enq-foot a{color:#888;text-decoration:none}
        .adm-enq-foot a:hover{color:#ccc}
        .adm-prod-img{width:40px;height:40px;border-radius:6px;object-fit:cover;background:#1a1a1a}
        @media(max-width:900px){.adm{grid-template-columns:1fr}.adm-side{display:none}.adm-stats{grid-template-columns:repeat(2,1fr)}}
      `}</style>
      <div className="adm">
        <aside className="adm-side">
          <div className="adm-logo">
            <div className="adm-logo-icon">K</div>
            <div>
              <div className="adm-logo-text">KONG</div>
              <div className="adm-logo-sub">Admin</div>
            </div>
          </div>
          <nav className="adm-nav">
            {NAV.map(([href, label], i) => {
              if (href === '---') return <div key={i} style={{ padding: '8px 12px 4px', fontSize: 9, letterSpacing: '1.5px', color: '#444', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
              return <a key={href} href={href} className={active ? 'active' : ''}>{label}</a>
            })}
          </nav>
          <div className="adm-user">
            <span>Kong Tattoo Care</span>
            <button className="adm-signout" onClick={handleSignOut}>Sign out</button>
          </div>
        </aside>
        <main className="adm-main">{children}</main>
      </div>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </>
  )
}
