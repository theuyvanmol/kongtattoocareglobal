'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const PASSWORD = 'kong2024admin'

export default function AdminLogin() {
  const router = useRouter()
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 300))
    if (pw === PASSWORD) {
      sessionStorage.setItem('kong_admin_auth', '1')
      router.replace('/admin')
    } else {
      setError('Incorrect password.')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .adm-auth{min-height:100vh;background:radial-gradient(120% 80% at 50% 0%,#e3e7d6,#f1efe7 60%);display:flex;align-items:center;justify-content:center;padding:20px;font-family:'DM Sans',Arial,sans-serif}
        .adm-auth-card{width:min(100%,460px);background:#fbfaf5;border:1px solid #e0ddd4;border-radius:24px;padding:70px 42px 40px;box-shadow:0 40px 90px -50px rgba(22,39,27,.4)}
        .adm-auth-eyebrow{font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#22382c66;margin-bottom:14px;font-weight:500}
        .adm-auth h1{font:400 clamp(28px,3vw,38px)/1.1 'Cormorant Garamond',Georgia,serif;color:#22382c;margin-bottom:32px}
        .adm-auth h1 em{font-style:italic;color:#254936}
        .adm-auth-form{display:grid;gap:16px}
        .adm-auth-form label{font-size:11px;letter-spacing:.8px;text-transform:uppercase;color:#22382c99;font-weight:500;display:block;margin-bottom:5px}
        .adm-auth-form input{width:100%;border:0;border-bottom:1px solid rgba(34,56,44,.25);background:transparent;padding:11px 2px;font:400 15px 'DM Sans',Arial,sans-serif;color:#22382c;border-radius:0;outline:none;transition:border-color .15s}
        .adm-auth-form input:focus{border-bottom-color:#22382c;box-shadow:0 1px 0 #22382c}
        .adm-auth-submit{width:100%;background:#254936;color:#fff;border:none;border-radius:12px;padding:14px;font:500 13px 'DM Sans',Arial,sans-serif;cursor:pointer;letter-spacing:.5px;margin-top:8px;transition:background .15s}
        .adm-auth-submit:hover{background:#1a3326}
        .adm-auth-submit:disabled{opacity:.6;cursor:default}
        .adm-auth-error{font-size:12px;color:#c0392b;padding:10px 14px;background:#fde8e8;border-radius:8px}
        .adm-auth-brand{margin-top:40px;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px}
        .adm-auth-brand-logo{width:28px;height:28px;background:#1f3328;border-radius:7px;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;font-size:15px;color:#e9ecdf}
        .adm-auth-brand-name{font:400 13px/1 'Cormorant Garamond',Georgia,serif;color:#22382c99;letter-spacing:.3px}
      `}</style>
      <div className="adm-auth">
        <div className="adm-auth-card">
          <div className="adm-auth-eyebrow">Team area</div>
          <h1>Team <em>sign-in.</em></h1>
          <form className="adm-auth-form" onSubmit={handleSubmit}>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <div className="adm-auth-error">{error}</div>}
            <button type="submit" className="adm-auth-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <div className="adm-auth-brand">
            <div className="adm-auth-brand-logo">K</div>
            <div className="adm-auth-brand-name">Kong Tattoo Care</div>
          </div>
        </div>
      </div>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet" />
    </>
  )
}
