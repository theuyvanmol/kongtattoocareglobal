'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (pw === 'kong2024admin') {
        sessionStorage.setItem('kong_admin_auth', '1')
        router.replace('/admin')
      } else {
        setErr(true)
        setLoading(false)
      }
    }, 400)
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0a;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',Arial,sans-serif;padding:20px}
        .login-wrap{width:min(100%,400px)}
        .login-logo{display:flex;align-items:center;gap:14px;margin-bottom:40px;justify-content:center}
        .login-logo-k{width:48px;height:48px;background:#E61E32;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff}
        .login-logo-text{font-size:22px;font-weight:800;color:#fff;letter-spacing:1px}
        .login-logo-sub{font-size:11px;color:#666;letter-spacing:1.5px;text-transform:uppercase}
        .login-card{background:#111;border:1px solid #1e1e1e;border-radius:16px;padding:32px}
        .login-card h1{font-size:20px;font-weight:700;color:#fff;margin-bottom:6px}
        .login-card p{font-size:13px;color:#555;margin-bottom:28px}
        .login-label{display:block;font-size:11px;color:#666;letter-spacing:.5px;text-transform:uppercase;font-weight:500;margin-bottom:6px}
        .login-input{width:100%;background:#0a0a0a;border:1px solid #222;border-radius:9px;padding:12px 14px;font:400 14px 'DM Sans',Arial,sans-serif;color:#ccc;outline:none;transition:border-color .15s;margin-bottom:16px}
        .login-input:focus{border-color:#E61E32;box-shadow:0 0 0 3px #E61E3220}
        .login-btn{width:100%;background:#E61E32;color:#fff;border:none;border-radius:9px;padding:13px;font:700 14px 'DM Sans',Arial,sans-serif;cursor:pointer;transition:background .15s;letter-spacing:.5px}
        .login-btn:hover:not(:disabled){background:#c41828}
        .login-btn:disabled{opacity:.6;cursor:not-allowed}
        .login-err{background:#E61E3215;border:1px solid #E61E3240;border-radius:8px;padding:10px 14px;color:#ff7070;font-size:13px;margin-bottom:16px}
        .login-line{margin-top:28px;padding-top:20px;border-top:1px solid #1a1a1a;text-align:center;font-size:12px;color:#333}
      `}</style>
      <div className="login-wrap">
        <div className="login-logo">
          <div className="login-logo-k">K</div>
          <div>
            <div className="login-logo-text">KONG</div>
            <div className="login-logo-sub">Tattoo Care</div>
          </div>
        </div>
        <div className="login-card">
          <h1>Team sign-in.</h1>
          <p>Admin access only</p>
          {err && <div className="login-err">Incorrect password. Try again.</div>}
          <form onSubmit={handleSubmit}>
            <label className="login-label">Password</label>
            <input
              type="password"
              className="login-input"
              value={pw}
              onChange={e => { setPw(e.target.value); setErr(false) }}
              autoFocus
              placeholder="Enter admin password"
            />
            <button type="submit" className="login-btn" disabled={loading || !pw}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
          <div className="login-line">Kong Tattoo Care Ltd &copy; 2024</div>
        </div>
      </div>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    </>
  )
}
