import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export default function SignupPage({ onSwitch }) {
  const { signup } = useAuth()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    headline: '', linkedinUrl: '',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState(1)

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  const validateStep1 = () => {
    if (!form.name.trim())  return 'Please enter your name.'
    if (!form.email.trim()) return 'Please enter your email.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return null
  }

  const handleStep1 = (e) => {
    e.preventDefault()
    const err = validateStep1()
    if (err) return setError(err)
    setStep(2)
  }

  // ── Step 2 submit — calls Supabase ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signup({
      name:        form.name.trim(),
      email:       form.email.trim().toLowerCase(),
      password:    form.password,
      headline:    form.headline.trim(),
      linkedinUrl: form.linkedinUrl.trim(),
    })

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
    // On success, AuthContext's onAuthStateChange fires automatically
    // and redirects the user — no need to do anything here
  }

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div className="auth-side-inner">
          <h2 className="side-title">Posts that sound like <em>you</em></h2>
          <p className="side-desc">The AI studies how you write, then generates LinkedIn posts indistinguishable from your own voice.</p>
          <div className="side-steps">
            {[
              ['1', 'Paste your past posts'],
              ['2', 'AI builds your voice profile'],
              ['3', 'Pick a topic to write about'],
              ['4', 'Get 3 drafts in your voice'],
            ].map(([n, label]) => (
              <div key={n} className="side-step">
                <span className="step-num">{n}</span>
                <span className="step-text">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">in</span>
          <span className="auth-logo-text">Voice Assistant</span>
        </div>

        <div className="signup-progress">
          <div className={`sp-step ${step >= 1 ? 'sp-active' : ''}`} />
          <div className={`sp-step ${step >= 2 ? 'sp-active' : ''}`} />
        </div>

        <h1 className="auth-title">{step === 1 ? 'Create your account' : 'Your LinkedIn profile'}</h1>
        <p className="auth-sub">{step === 1 ? 'Step 1 of 2 — Account details' : 'Step 2 of 2 — Optional but helps the AI'}</p>

        {step === 1 && (
          <form onSubmit={handleStep1} className="auth-form">
            <div className="field">
              <label className="field-label">Full name</label>
              <input className="field-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Alex Johnson" autoFocus />
            </div>
            <div className="field">
              <label className="field-label">Email</label>
              <input className="field-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Password</label>
                <input className="field-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" />
              </div>
              <div className="field">
                <label className="field-label">Confirm password</label>
                <input className="field-input" type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat password" />
              </div>
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-btn" type="submit">Continue →</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label className="field-label">Professional headline <span className="optional">optional</span></label>
              <input className="field-input" value={form.headline} onChange={e => set('headline', e.target.value)} placeholder="e.g. Product Manager at Acme · Building in public" />
            </div>
            <div className="field">
              <label className="field-label">LinkedIn profile URL <span className="optional">optional</span></label>
              <input className="field-input" value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
            </div>
            <div className="step2-note">
              These help personalize your experience. You can update them anytime in your profile.
            </div>
            {error && <p className="auth-error">{error}</p>}
            <div className="form-row-actions">
              <button type="button" className="auth-btn-ghost" onClick={() => { setStep(1); setError('') }}>← Back</button>
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        )}

        <p className="auth-switch">
          Already have an account?{' '}
          <button className="auth-link" onClick={onSwitch}>Sign in</button>
        </p>
      </div>
    </div>
  )
}
