import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return setError('Please fill in all fields.')
    setLoading(true)
    const res = login(form.email.trim().toLowerCase(), form.password)
    if (res.error) setError(res.error)
    setLoading(false)
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">in</span>
          <span className="auth-logo-text">Voice Assistant</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue building your personal voice</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="field-input"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button className="auth-link" onClick={onSwitch}>Create one</button>
        </p>

        {/* Demo hint */}
        <div className="demo-hint">
          <span className="demo-hint-icon">💡</span>
          <span>Hackathon demo — accounts are stored locally in your browser.</span>
        </div>
      </div>

      <div className="auth-side">
        <div className="auth-side-inner">
          <h2 className="side-title">Posts that sound like <em>you</em></h2>
          <p className="side-desc">Paste your LinkedIn posts. The AI learns your voice — your tone, your themes, your style — then writes new posts indistinguishable from your own.</p>
          <div className="side-features">
            {[
              ['🎯', 'Voice profiling', 'Learns your tone, vocabulary & writing patterns'],
              ['💡', 'Idea memory', 'Turns rough notes into polished post ideas'],
              ['✍️', '3 draft variations', 'Multiple styles, all written in your voice'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="side-feature">
                <span className="sf-icon">{icon}</span>
                <div>
                  <p className="sf-title">{title}</p>
                  <p className="sf-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
