'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PromoCode {
  id: string
  code: string
  active: boolean
  times_redeemed: number
  max_redemptions: number | null
  expires_at: number | null
  created: number
}

interface Coupon {
  id: string
  name: string
  percent_off: number | null
  amount_off: number | null
  currency: string
  duration: string
  duration_in_months: number | null
  max_redemptions: number | null
  times_redeemed: number
  valid: boolean
  created: number
  redeem_by: number | null
  promo_codes: PromoCode[]
}

export default function StripeDiscountsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ couponId?: string; promoCodeId?: string; label: string } | null>(null)
  const [form, setForm] = useState({
    name: '',
    type: 'percent' as 'percent' | 'fixed',
    percent_off: 10,
    amount_off: 5,
    duration: 'once',
    max_redemptions: '',
    redeem_by: '',
    promo_code: '',
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('kong_admin_auth') !== '1') {
      router.push('/admin/login'); return
    }
    fetchData()
  }, [router])

  async function fetchData() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/stripe-coupons')
      const d = await r.json()
      if (d.error) setError(d.error)
      else setCoupons(d.coupons || [])
    } catch { setError('Failed to load') }
    finally { setLoading(false) }
  }

  async function createCoupon() {
    setCreating(true); setCreateMsg('')
    try {
      const r = await fetch('/api/admin/stripe-coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (d.success) {
        setCreateMsg('✓ Created!')
        setShowCreate(false)
        setForm({ name: '', type: 'percent', percent_off: 10, amount_off: 5, duration: 'once', max_redemptions: '', redeem_by: '', promo_code: '' })
        await fetchData()
      } else { setCreateMsg('✗ ' + d.error) }
    } catch { setCreateMsg('✗ Network error') }
    finally { setCreating(false) }
  }

  async function doDelete() {
    if (!confirmDelete) return
    try {
      const r = await fetch('/api/admin/stripe-coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmDelete),
      })
      const d = await r.json()
      if (d.success) { setConfirmDelete(null); await fetchData() }
    } catch {}
  }

  function fmtDate(ts: number) {
    return new Date(ts * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function discountLabel(c: Coupon) {
    if (c.percent_off) return `${c.percent_off}% off`
    if (c.amount_off) return `£${c.amount_off.toFixed(2)} off`
    return '—'
  }

  const totalCodes = coupons.reduce((s, c) => s + c.promo_codes.length, 0)
  const activeCodes = coupons.reduce((s, c) => s + c.promo_codes.filter(p => p.active).length, 0)
  const totalUses = coupons.reduce((s, c) => s + c.times_redeemed, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#111', borderBottom: '1px solid #222', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Stripe Discount Codes</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Coupons and promo codes from your Stripe account</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => { setShowCreate(true); setCreateMsg('') }}
          style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}>
          + New Discount
        </button>
      </div>

      <div style={{ padding: 24 }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Total Coupons', value: coupons.length },
            { label: 'Promo Codes', value: totalCodes },
            { label: 'Active Codes', value: activeCodes },
            { label: 'Total Uses', value: totalUses },
          ].map(s => (
            <div key={s.label} style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px 20px', flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{loading ? '—' : s.value}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {error && <div style={{ background: '#7f1d1d', border: '1px solid #991b1b', borderRadius: 8, padding: 12, marginBottom: 16, color: '#fca5a5' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#666', padding: 60 }}>Loading Stripe discounts...</div>
        ) : coupons.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
            <div>No discount codes found in Stripe</div>
            <button onClick={() => setShowCreate(true)} style={{ marginTop: 16, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>
              Create your first discount
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {coupons.map(c => (
              <div key={c.id} style={{ background: '#111', border: '1px solid #222', borderRadius: 14, overflow: 'hidden' }}>
                {/* Coupon header */}
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: c.promo_codes.length > 0 ? '1px solid #1a1a1a' : undefined }}>
                  <div style={{ background: c.valid ? '#7c3aed22' : '#1a1a1a', border: `1px solid ${c.valid ? '#7c3aed' : '#333'}`, borderRadius: 10, padding: '10px 16px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: c.valid ? '#a78bfa' : '#666' }}>{discountLabel(c)}</div>
                    <div style={{ fontSize: 10, color: '#666', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.duration}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 3, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span>ID: <span style={{ fontFamily: 'monospace', color: '#888' }}>{c.id}</span></span>
                      <span style={{ color: c.valid ? '#4ade80' : '#f87171' }}>● {c.valid ? 'Active' : 'Inactive'}</span>
                      <span>{c.times_redeemed} use{c.times_redeemed !== 1 ? 's' : ''}{c.max_redemptions ? ` / ${c.max_redemptions} max` : ''}</span>
                      {c.redeem_by && <span>Expires {fmtDate(c.redeem_by)}</span>}
                      <span>Created {fmtDate(c.created)}</span>
                    </div>
                  </div>
                  <button onClick={() => setConfirmDelete({ couponId: c.id, label: c.name })}
                    style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
                    Delete
                  </button>
                </div>

                {/* Promo codes */}
                {c.promo_codes.length > 0 && (
                  <div style={{ padding: '12px 20px' }}>
                    <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, fontWeight: 600 }}>Promo Codes</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {c.promo_codes.map(p => (
                        <div key={p.id} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <code style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, padding: '4px 10px', fontSize: 14, fontWeight: 700, color: p.active ? '#c4b5fd' : '#666', letterSpacing: '1px', flexShrink: 0 }}>
                            {p.code as string}
                          </code>
                          <div style={{ flex: 1, display: 'flex', gap: 12, fontSize: 12, color: '#666', flexWrap: 'wrap' }}>
                            <span style={{ color: p.active ? '#4ade80' : '#f87171' }}>● {p.active ? 'Active' : 'Inactive'}</span>
                            <span>{p.times_redeemed} used{p.max_redemptions ? ` / ${p.max_redemptions} max` : ''}</span>
                            {p.expires_at && <span>Expires {fmtDate(p.expires_at)}</span>}
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(p.code as string)}
                            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                            Copy
                          </button>
                          {p.active && (
                            <button onClick={() => setConfirmDelete({ promoCodeId: p.id, label: p.code })}
                              style={{ background: 'none', border: '1px solid #333', color: '#666', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
                              Deactivate
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {c.promo_codes.length === 0 && (
                  <div style={{ padding: '12px 20px' }}>
                    <div style={{ fontSize: 12, color: '#555' }}>No promo codes attached to this coupon</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, fontWeight: 700, fontSize: 16 }}>Create Stripe Discount</div>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Discount Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Summer Sale 20%"
                  style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }} />
              </div>

              {/* Type + Value */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })}
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}>
                    <option value="percent">Percentage off</option>
                    <option value="fixed">Fixed amount off (£)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>
                    {form.type === 'percent' ? 'Percentage (%)' : 'Amount (£)'}
                  </label>
                  <input type="number" min="1" max={form.type === 'percent' ? 100 : undefined}
                    value={form.type === 'percent' ? form.percent_off : form.amount_off}
                    onChange={e => form.type === 'percent' ? setForm({ ...form, percent_off: parseFloat(e.target.value) }) : setForm({ ...form, amount_off: parseFloat(e.target.value) })}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }} />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Duration</label>
                <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }}>
                  <option value="once">Once (single use per customer)</option>
                  <option value="forever">Forever</option>
                </select>
              </div>

              {/* Optional fields */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Max Redemptions <span style={{ color: '#555' }}>(optional)</span></label>
                  <input type="number" value={form.max_redemptions} onChange={e => setForm({ ...form, max_redemptions: e.target.value })}
                    placeholder="Unlimited"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Expiry Date <span style={{ color: '#555' }}>(optional)</span></label>
                  <input type="date" value={form.redeem_by} onChange={e => setForm({ ...form, redeem_by: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }} />
                </div>
              </div>

              {/* Promo code */}
              <div>
                <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Promo Code <span style={{ color: '#555' }}>(what customers type)</span></label>
                <input value={form.promo_code} onChange={e => setForm({ ...form, promo_code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER20"
                  style={{ width: '100%', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#c4b5fd', fontSize: 14, outline: 'none', fontFamily: 'monospace', letterSpacing: '1px', fontWeight: 700 }} />
                <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Leave blank to create a coupon without a code</div>
              </div>

              {/* Preview */}
              <div style={{ background: '#0d1117', border: '1px solid #1e3a5f', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, color: '#4a9eff', fontWeight: 600, marginBottom: 6 }}>Preview</div>
                <div style={{ fontSize: 13, color: '#6e9ec0' }}>
                  Coupon "{form.name || 'Unnamed'}" gives {form.type === 'percent' ? `${form.percent_off}%` : `£${form.amount_off}`} off
                  {form.duration === 'once' ? ', valid once per customer' : ' forever'}
                  {form.promo_code && <>, code: <strong style={{ color: '#c4b5fd' }}>{form.promo_code}</strong></>}
                </div>
              </div>

              {createMsg && <div style={{ fontSize: 13, color: createMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>{createMsg}</div>}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #222', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={createCoupon} disabled={creating || !form.name}
                style={{ background: creating ? '#5b21b6' : '#7c3aed', border: 'none', color: '#fff', borderRadius: 8, padding: '10px 24px', fontSize: 14, cursor: creating ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                {creating ? 'Creating...' : 'Create Discount'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: 12, padding: 28, maxWidth: 400, width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{confirmDelete.promoCodeId ? 'Deactivate Promo Code?' : 'Delete Coupon?'}</div>
            <div style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
              "{confirmDelete.label}" will be {confirmDelete.promoCodeId ? 'deactivated' : 'permanently deleted from Stripe'}.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#aaa', borderRadius: 8, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={doDelete} style={{ background: '#dc2626', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 20px', fontSize: 14, cursor: 'pointer' }}>
                {confirmDelete.promoCodeId ? 'Deactivate' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
