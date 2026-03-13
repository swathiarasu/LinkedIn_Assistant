import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

export default function ProfilePage({ onClose }) {
  const { user, profile, updateProfile, logout } = useAuth()
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [form, setForm]         = useState({
    name:         profile?.name || '',
    headline:     profile?.headline || '',
    linkedin_url: profile?.linkedin_url || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const displayName = profile?.name || user?.email || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="profile-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="profile-panel">

        {/* Header */}
        <div className="panel-header">
          <h2 className="panel-title">Your profile</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Hero */}
        <div className="pp-hero">
          <div className="pp-avatar">{initials}</div>
          <div>
            <p className="pp-name">{displayName}</p>
            <p className="pp-email">{user?.email}</p>
            {profile?.headline && <p className="pp-headline">{profile.headline}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="pp-stats">
          <div className="stat-box">
            <span className="stat-num">{profile?.posts_analyzed || 0}</span>
            <span className="stat-label">Analyses run</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{profile?.drafts_generated || 0}</span>
            <span className="stat-label">Drafts generated</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{joinDate}</span>
            <span className="stat-label">Member since</span>
          </div>
        </div>

        {/* Profile details */}
        <div className="pp-section">
          <div className="pp-section-header">
            <p className="pp-section-title">Profile details</p>
            {!editing && <button className="edit-btn" onClick={() => setEditing(true)}>Edit</button>}
          </div>

          {editing ? (
            <div className="edit-form">
              <div className="field">
                <label className="field-label">Full name</label>
                <input className="field-input" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Headline <span className="optional">optional</span></label>
                <input className="field-input" value={form.headline} onChange={e => set('headline', e.target.value)} placeholder="e.g. Product Manager · Building in public" />
              </div>
              <div className="field">
                <label className="field-label">LinkedIn URL <span className="optional">optional</span></label>
                <input className="field-input" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
              </div>
              <div className="edit-actions">
                <button className="cancel-btn" onClick={() => {
                  setEditing(false)
                  setForm({ name: profile?.name || '', headline: profile?.headline || '', linkedin_url: profile?.linkedin_url || '' })
                }}>Cancel</button>
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="detail-list">
              <div className="detail-row">
                <span className="detail-key">Name</span>
                <span className="detail-val">{profile?.name || '—'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Email</span>
                <span className="detail-val">{user?.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Headline</span>
                <span className="detail-val">{profile?.headline || <span className="empty">Not set</span>}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">LinkedIn</span>
                <span className="detail-val">
                  {profile?.linkedin_url
                    ? <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="pp-link">{profile.linkedin_url.replace('https://', '')}</a>
                    : <span className="empty">Not set</span>}
                </span>
              </div>
            </div>
          )}
        </div>

        {saved && <div className="save-toast">✓ Profile updated!</div>}

        {/* Auth provider badge */}
        <div className="pp-section" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
          <div className="auth-badge">
            <span className="auth-badge-icon">🔒</span>
            <span>Secured by <strong>Supabase</strong> — your password is hashed and never stored in plain text</span>
          </div>
        </div>

        {/* Sign out */}
        <div className="pp-footer">
          <button className="signout-btn" onClick={logout}>Sign out</button>
        </div>
      </div>
    </div>
  )
}
