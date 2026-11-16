'use client'
import { useState, useEffect, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const NAV: [string, string][] = [
  ['/admin', 'Dashboard'],
  ['/admin/orders', 'Orders'],
  ['/admin/products', 'Products'],
  ['/admin/discounts', 'Discounts'],
  ['/admin/promotions', 'Promotions & events'],
  ['/admin/email', 'Email'],
  ['/admin/blogs', 'Blog'],
  ['/admin/enquiries', 'Enquiries'],
  ['/admin/customers', 'Customers'],
  ['/admin/pages', 'Website Pages'],
  ['/admin/stripe-discounts', 'Stripe Discounts'],
  ['/admin/payments', 'Payments'],
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',system-ui,sans-serif;background:#F5F3EE;color:#1a1a1a}

        .adm{display:grid;grid-template-columns:200px minmax(0,1fr);min-height:100vh}

        /* Sidebar */
        .adm-side{background:#1C2320;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
        .adm-logo{padding:20px 16px 16px;border-bottom:1px solid #2a3330}
        .adm-logo-name{font-size:14px;font-weight:700;color:#fff;letter-spacing:.3px;line-height:1.2}
        .adm-logo-sub{font-size:11px;color:#8a9e98;margin-top:2px}
        .adm-nav{padding:8px 0;flex:1}
        .adm-nav-label{display:block;padding:5px 16px;font-size:10px;font-weight:600;color:#8a9e98;letter-spacing:.8px;text-transform:uppercase;margin-top:8px}
        .adm-nav a{display:block;padding:7px 16px;font-size:13.5px;font-weight:400;color:#c8d4d0;text-decoration:none;border-radius:0;transition:background .1s,color .1s;border-left:2px solid transparent}
        .adm-nav a:hover{background:#243029;color:#fff}
        .adm-nav a.active{background:#243029;color:#fff;font-weight:500;border-left-color:#C8FF00}
        .adm-user{padding:14px 16px;border-top:1px solid #2a3330;font-size:12px;color:#8a9e98}
        .adm-user-name{color:#c8d4d0;font-weight:500;font-size:12px}
        .adm-user-email{font-size:11px;color:#6a7e78;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .adm-user-links{display:flex;gap:12px;margin-top:8px}
        .adm-user-links a,.adm-signout{color:#8a9e98;font-size:11px;text-decoration:underline;cursor:pointer;background:none;border:none;padding:0}
        .adm-user-links a:hover,.adm-signout:hover{color:#c8d4d0}

        /* Main */
        .adm-main{background:#F5F3EE;min-height:100vh;padding:0}
        .adm-content{padding:36px 40px;max-width:1100px}

        /* Page header */
        .adm-page-eyebrow{font-size:11px;font-weight:500;color:#888;letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px}
        .adm-page-title{font-size:32px;font-weight:700;color:#1a1a1a;letter-spacing:-.5px;margin-bottom:0;line-height:1.1}
        .adm-page-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}

        /* Info banner */
        .adm-info{background:#EEF0EB;border-radius:6px;padding:12px 16px;font-size:13px;color:#555;margin-bottom:24px;line-height:1.5}

        /* Stats */
        .adm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:#e0ddd7;border:1px solid #e0ddd7;border-radius:10px;overflow:hidden;margin-bottom:24px}
        .adm-stat{background:#fff;padding:18px 20px}
        .adm-stat b{display:block;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1;margin-bottom:4px}
        .adm-stat span{font-size:12px;color:#888;font-weight:400}
        .adm-stat.green b{color:#2d7a4f}
        .adm-stat.red b{color:#c0392b}

        /* Cards */
        .adm-card{background:#fff;border:1px solid #E8E5DF;border-radius:10px;padding:22px 24px;margin-bottom:16px}
        .adm-card-title{font-size:11px;font-weight:600;color:#888;letter-spacing:.8px;text-transform:uppercase;margin-bottom:16px}

        /* Tables */
        .adm-table-wrap{background:#fff;border:1px solid #E8E5DF;border-radius:10px;overflow:hidden;margin-bottom:16px}
        .adm-table{width:100%;border-collapse:collapse;font-size:13.5px}
        .adm-table th{text-align:left;font-size:11px;font-weight:600;color:#888;letter-spacing:.5px;text-transform:uppercase;padding:12px 16px;border-bottom:1px solid #E8E5DF;white-space:nowrap;background:#faf9f6}
        .adm-table td{padding:12px 16px;border-bottom:1px solid #F0EDE7;color:#333;vertical-align:middle}
        .adm-table tr:last-child td{border-bottom:0}
        .adm-table tr:hover td{background:#faf9f6}

        /* Badges */
        .adm-badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600}
        .adm-badge.active,.adm-badge.published,.adm-badge.paid,.adm-badge.succeeded,.adm-badge.fulfilled{background:#E8F5EE;color:#2d7a4f;border:1px solid #c3e6d4}
        .adm-badge.draft,.adm-badge.pending,.adm-badge.unfulfilled{background:#FEF3E2;color:#b7701a;border:1px solid #faddad}
        .adm-badge.archived,.adm-badge.failed,.adm-badge.refunded,.adm-badge.inactive{background:#FDE8E8;color:#c0392b;border:1px solid #f5c2c2}

        /* Buttons */
        .adm-btn{display:inline-flex;align-items:center;gap:6px;background:#1C2320;color:#fff;border:none;border-radius:7px;padding:9px 18px;font:600 13px 'Inter',sans-serif;cursor:pointer;transition:background .1s;text-decoration:none;white-space:nowrap;letter-spacing:.1px}
        .adm-btn:hover{background:#2d3b36}
        .adm-btn.secondary{background:#fff;color:#1a1a1a;border:1px solid #d0ccc5}
        .adm-btn.secondary:hover{background:#faf9f6}
        .adm-btn.danger{background:#c0392b;color:#fff;border:none}
        .adm-btn.danger:hover{background:#a93226}
        .adm-btn.small{padding:6px 12px;font-size:12px}

        /* Forms */
        .adm-form-group{margin-bottom:16px}
        .adm-form-group label{display:block;font-size:12px;font-weight:600;color:#555;margin-bottom:5px;letter-spacing:.2px}
        .adm-form-group .hint{font-size:11px;color:#999;margin-top:3px}
        .adm-input,.adm-select,.adm-textarea{width:100%;border:1px solid #D8D4CE;background:#fff;border-radius:7px;padding:9px 12px;font:400 13.5px 'Inter',sans-serif;color:#1a1a1a;outline:none;transition:border-color .15s}
        .adm-input:focus,.adm-select:focus,.adm-textarea:focus{border-color:#1C2320;box-shadow:0 0 0 2px rgba(28,35,32,.08)}
        .adm-textarea{min-height:140px;resize:vertical;line-height:1.6}
        .adm-select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
        .adm-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .adm-row.thirds{grid-template-columns:1fr 1fr 1fr}

        /* Filters */
        .adm-filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;align-items:center}
        .adm-filters .adm-input,.adm-filters .adm-select{width:auto}

        /* Modal */
        .adm-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:50;display:flex;align-items:flex-start;justify-content:center;padding:40px 20px;overflow-y:auto}
        .adm-modal{background:#fff;border:1px solid #E8E5DF;border-radius:12px;padding:32px;width:min(100%,620px);position:relative}
        .adm-modal.wide{width:min(100%,860px)}
        .adm-modal h2{font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:24px;letter-spacing:-.3px}
        .adm-modal-close{position:absolute;top:20px;right:20px;background:none;border:none;font-size:20px;color:#999;cursor:pointer;line-height:1;padding:4px}
        .adm-modal-close:hover{color:#333}
        .adm-modal-foot{display:flex;gap:10px;justify-content:flex-end;margin-top:24px;padding-top:20px;border-top:1px solid #F0EDE7}

        /* Tabs */
        .adm-tabs{display:flex;gap:0;border-bottom:2px solid #E8E5DF;margin-bottom:24px}
        .adm-tab{background:none;border:none;padding:10px 18px;font:500 13.5px 'Inter',sans-serif;color:#888;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:color .1s}
        .adm-tab:hover{color:#333}
        .adm-tab.active{color:#1a1a1a;border-bottom-color:#1C2320;font-weight:600}

        /* Misc */
        .adm-empty{text-align:center;padding:48px 20px;color:#aaa;font-size:14px}
        .adm-loading{text-align:center;padding:48px 20px;color:#aaa;font-size:14px}
        .adm-error{background:#FDE8E8;border:1px solid #f5c2c2;border-radius:8px;padding:12px 16px;color:#c0392b;font-size:13px;margin-bottom:16px}
        .adm-success{background:#E8F5EE;border:1px solid #c3e6d4;border-radius:8px;padding:12px 16px;color:#2d7a4f;font-size:13px;margin-bottom:16px}
        .adm-prod-img{width:44px;height:44px;border-radius:7px;object-fit:cover;background:#f0ede7;border:1px solid #E8E5DF}
        .adm-divider{height:1px;background:#E8E5DF;margin:20px 0}

        /* Promotion items */
        .adm-promo-item{background:#fff;border:1px solid #E8E5DF;border-radius:10px;padding:16px 20px;display:flex;align-items:center;gap:16px;margin-bottom:10px}
        .adm-promo-icon{width:40px;height:40px;border-radius:8px;background:#2d7a4f;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .adm-promo-icon.event{background:#1C2320}
        .adm-promo-body{flex:1;min-width:0}
        .adm-promo-label{font-size:11px;font-weight:600;color:#888;letter-spacing:.5px;text-transform:uppercase;margin-bottom:2px}
        .adm-promo-title{font-size:15px;font-weight:600;color:#1a1a1a;margin-bottom:2px}
        .adm-promo-dates{font-size:12px;color:#888}
        .adm-promo-actions{display:flex;align-items:center;gap:10px;flex-shrink:0}
        .adm-coming-soon{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:500;background:#FEF3E2;color:#b7701a;border:1px solid #faddad}
        .adm-live-badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:500;background:#E8F5EE;color:#2d7a4f;border:1px solid #c3e6d4}

        @media(max-width:900px){.adm{grid-template-columns:1fr}.adm-side{display:none}.adm-stats{grid-template-columns:1fr 1fr}}
      `}</style>
      <div className="adm">
        <aside className="adm-side">
          <div className="adm-logo">
            <div className="adm-logo-name">Kong Tattoo Care</div>
            <div className="adm-logo-sub">Admin</div>
          </div>
          <nav className="adm-nav">
            {NAV.map(([href, label]) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
              return <a key={href} href={href} className={active ? 'active' : ''}>{label}</a>
            })}
          </nav>
          <div className="adm-user">
            <div className="adm-user-name">Kong Tattoo Care</div>
            <div className="adm-user-email">kongtattoocareglobal.com</div>
            <div className="adm-user-links">
              <a href="https://kongtattoocareglobal.com" target="_blank">View website ↗</a>
              <button className="adm-signout" onClick={handleSignOut}>Sign out</button>
            </div>
          </div>
        </aside>
        <main className="adm-main">{children}</main>
      </div>
    </>
  )
}
