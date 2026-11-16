'use client'
import { useState, useEffect, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

const NAV: [string, string][] = [
  ['/admin', 'Dashboard'],
  ['/admin/orders', 'Orders'],
  ['/admin/discounts', 'Discounts'],
  ['/admin/blog', 'Blog'],
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const ok = sessionStorage.getItem('kong_admin_auth')
    if (ok === '1') {
      setAuthed(true)
    } else {
      router.replace('/admin-login')
    }
  }, [router])

  if (authed === null) return null

  function handleSignOut() {
    sessionStorage.removeItem('kong_admin_auth')
    router.replace('/admin/login')
  }

  return (
    <>
      <style>{`
        .adm{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:100vh;background:#f6f4ee;font-family:'DM Sans',Arial,sans-serif}
        .adm-side{background:#1f3328;color:#e9ecdf;padding:26px 20px;display:flex;flex-direction:column}
        .adm-logo{display:flex;align-items:center;gap:10px;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid rgba(233,236,223,.12)}
        .adm-logo-text{font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#b6c29c;font-weight:500;margin-top:1px}
        .adm-side nav{display:flex;flex-direction:column;gap:2px}
        .adm-side nav a{display:block;padding:10px 14px;border-radius:10px;font-size:13px;color:#d6dcca;text-decoration:none;transition:background .15s,color .15s}
        .adm-side nav a:hover{background:rgba(233,236,223,.08);color:#e9ecdf}
        .adm-side nav a.active{background:#e9ecdf;color:#1f3328;font-weight:500}
        .adm-user{margin-top:auto;padding-top:20px;border-top:1px solid rgba(233,236,223,.12);font-size:12px;color:#b6c29c;display:flex;justify-content:space-between;align-items:center}
        .adm-signout{background:none;border:none;color:#b6c29c;font-size:11px;cursor:pointer;padding:4px 8px;border-radius:6px;transition:background .15s}
        .adm-signout:hover{background:rgba(233,236,223,.08);color:#e9ecdf}
        .adm-main{padding:36px 40px;min-width:0}
        .adm-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:28px;padding-bottom:22px;border-bottom:1px solid #e0ddd4}
        .adm-head h1{font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:clamp(28px,2.4vw,36px);line-height:1.1;color:#22382c}
        .adm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:28px}
        .adm-stat{background:#fff;border:1px solid #e0ddd4;border-radius:18px;padding:18px 20px;display:grid;gap:4px}
        .adm-stat b{font:400 32px/1.1 'Cormorant Garamond',Georgia,serif;color:#22382c}
        .adm-stat span{font-size:12px;color:#22382cb3}
        .adm-card{background:#fff;border:1px solid #e0ddd4;border-radius:18px;padding:22px 24px;display:grid;gap:12px}
        .adm-card-title{font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#22382c99;font-weight:500}
        .adm-table-wrap{overflow-x:auto;background:#fff;border:1px solid #e0ddd4;border-radius:18px}
        .adm-table{width:100%;border-collapse:collapse;font-size:13px}
        .adm-table th{text-align:left;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:#22382c99;padding:12px 14px;border-bottom:1px solid #e0ddd4;white-space:nowrap;font-weight:500}
        .adm-table td{padding:11px 14px;border-bottom:1px solid #f0ede6;color:#22382c;vertical-align:middle}
        .adm-table tr:last-child td{border-bottom:0}
        .adm-table tr:hover td{background:#faf8f3}
        .adm-badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:500;letter-spacing:.3px}
        .adm-badge.paid{background:#e6f4ec;color:#1a7840}
        .adm-badge.pending{background:#fff3e0;color:#b45309}
        .adm-badge.refunded{background:#fde8e8;color:#c0392b}
        .adm-badge.fulfilled{background:#e6f4ec;color:#1a7840}
        .adm-badge.unfulfilled{background:#f0ede6;color:#22382c}
        .adm-btn{display:inline-flex;align-items:center;gap:6px;background:#254936;color:#fff;border:none;border-radius:10px;padding:10px 18px;font:500 12px 'DM Sans',Arial,sans-serif;cursor:pointer;transition:background .15s;letter-spacing:.3px;text-decoration:none}
        .adm-btn:hover{background:#1a3326}
        .adm-btn.ghost{background:transparent;color:#22382c;border:1px solid rgba(34,56,44,.3)}
        .adm-btn.ghost:hover{background:#f0ede6}
        .adm-btn.danger{background:#c0392b}
        .adm-btn.danger:hover{background:#a93224}
        .adm-filters{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;align-items:center}
        .adm-filters input,.adm-filters select{border:1px solid #e0ddd4;border-radius:10px;background:#fff;padding:9px 12px;font:400 13px 'DM Sans',Arial,sans-serif;color:#22382c;min-width:0;outline:none}
        .adm-filters input:focus,.adm-filters select:focus{border-color:#254936;box-shadow:0 0 0 3px rgba(37,73,54,.1)}
        .adm-form{display:grid;gap:14px}
        .adm-form label{font-size:12px;color:#22382c99;letter-spacing:.5px;text-transform:uppercase;font-weight:500;display:block;margin-bottom:4px}
        .adm-form input,.adm-form select,.adm-form textarea{width:100%;border:1px solid rgba(34,56,44,.2);background:#fbfaf6;border-radius:10px;padding:11px 13px;font:400 14px/1.5 'DM Sans',Arial,sans-serif;color:#22382c;outline:none;transition:border-color .15s,box-shadow .15s}
        .adm-form input:focus,.adm-form select:focus,.adm-form textarea:focus{border-color:#254936;background:#fff;box-shadow:0 0 0 3px rgba(37,73,54,.1)}
        .adm-form textarea{min-height:120px;resize:vertical}
        .adm-modal-bg{position:fixed;inset:0;background:rgba(22,39,27,.4);z-index:50;display:flex;align-items:center;justify-content:center;padding:20px}
        .adm-modal{background:#fbfaf5;border-radius:20px;padding:32px;width:min(100%,520px);box-shadow:0 40px 80px -20px rgba(22,39,27,.3)}
        .adm-modal h2{font:400 24px/1.1 'Cormorant Garamond',Georgia,serif;color:#22382c;margin-bottom:20px}
        .adm-row{display:flex;gap:10px}
        .adm-empty{text-align:center;padding:48px 20px;color:#22382c66;font-size:14px}
        .adm-loading{text-align:center;padding:48px 20px;color:#22382c66;font-size:13px}
        @media(max-width:900px){.adm{grid-template-columns:1fr}.adm-side{display:none}.adm-stats{grid-template-columns:repeat(2,1fr)}}
      `}</style>
      <div className="adm">
        <aside className="adm-side">
          <div className="adm-logo">
            <div style={{ background: '#fff', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontWeight: 700, fontSize: 18, color: '#1f3328' }}>K</span>
            </div>
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontWeight: 700, fontSize: 16, color: '#e9ecdf', lineHeight: 1.2 }}>Kong</div>
              <div className="adm-logo-text">Admin</div>
            </div>
          </div>
          <nav>
            {NAV.map(([href, label]) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
              return (
                <a key={href} href={href} className={active ? 'active' : ''}>
                  {label}
                </a>
              )
            })}
          </nav>
          <div className="adm-user">
            <span>Kong Tattoo Care</span>
            <button className="adm-signout" onClick={handleSignOut}>Sign out</button>
          </div>
        </aside>
        <main className="adm-main">
          {children}
        </main>
      </div>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
    </>
  )
}
