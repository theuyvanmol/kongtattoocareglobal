'use client'

export default function AdminSettings() {
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Settings</h1>
          <small>Store configuration</small>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
        <div className="adm-card">
          <div className="adm-card-title">Store</div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e1e1e' }}>
              <div>
                <div style={{ color: '#ccc', fontSize: 13, fontWeight: 500 }}>Shopify store</div>
                <div className="adm-muted">kongtattoocareglobal.myshopify.com</div>
              </div>
              <a href="https://admin.shopify.com/store/kongtattoocareuk" target="_blank" rel="noopener" className="adm-btn ghost" style={{ padding: '5px 12px', fontSize: 11 }}>Open →</a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e1e1e' }}>
              <div>
                <div style={{ color: '#ccc', fontSize: 13, fontWeight: 500 }}>Stripe dashboard</div>
                <div className="adm-muted">Live payments &amp; payouts</div>
              </div>
              <a href="https://dashboard.stripe.com" target="_blank" rel="noopener" className="adm-btn ghost" style={{ padding: '5px 12px', fontSize: 11 }}>Open →</a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <div>
                <div style={{ color: '#ccc', fontSize: 13, fontWeight: 500 }}>Website</div>
                <div className="adm-muted">kongtattoocare.com</div>
              </div>
              <a href="https://kongtattoocare.com" target="_blank" rel="noopener" className="adm-btn ghost" style={{ padding: '5px 12px', fontSize: 11 }}>Visit →</a>
            </div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-title">Admin access</div>
          <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7 }}>
            Admin password is stored in your session and not saved to any server.<br />
            To change the password, update the value in <code style={{ color: '#888', background: '#0a0a0a', padding: '2px 6px', borderRadius: 4 }}>src/app/admin-login/page.tsx</code>.
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-title">Enquiries (Supabase)</div>
          <div style={{ color: '#555', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
            To receive contact form enquiries here, add the following environment variables to Vercel:
          </div>
          <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 14, fontFamily: 'monospace', fontSize: 12, color: '#888', lineHeight: 1.8 }}>
            SUPABASE_URL=https://your-project.supabase.co<br />
            SUPABASE_SERVICE_ROLE_KEY=eyJ...
          </div>
          <div style={{ marginTop: 10 }}>
            <a href="https://vercel.com/theuy-s-projects/kongtattoocareglobal/settings/environment-variables" target="_blank" rel="noopener" className="adm-btn ghost" style={{ fontSize: 12 }}>Vercel env vars →</a>
          </div>
        </div>
      </div>
    </>
  )
}
