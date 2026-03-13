import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

export default function ProfilePage({ onClose }) {
  const { user, updateProfile, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user.name,
    headline: user.headline || '',
    linkedinUrl: user.linkedinUrl || '',
  })
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    updateProfile(form)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="profile-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="profile-panel">

        {/* Header */}
        <div className="panel-header">
          <h2 className="panel-title">Your profile</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Avatar + name */}
        <div className="pp-hero">
          <div className="pp-avatar">{initials}</div>
          <div>
            <p className="pp-name">{user.name}</p>
            <p className="pp-email">{user.email}</p>
            {user.headline && <p className="pp-headline">{user.headline}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="pp-stats">
          <div className="stat-box">
            <span className="stat-num">{user.postsAnalyzed || 0}</span>
            <span className="stat-label">Analyses run</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{user.draftsGenerated || 0}</span>
            <span className="stat-label">Drafts generated</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{joinDate}</span>
            <span className="stat-label">Member since</span>
          </div>
        </div>

        {/* Edit form */}
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
                <input className="field-input" value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
              </div>
              <div className="edit-actions">
                <button className="cancel-btn" onClick={() => { setEditing(false); setForm({ name: user.name, headline: user.headline || '', linkedinUrl: user.linkedinUrl || '' }) }}>Cancel</button>
                <button className="save-btn" onClick={handleSave}>Save changes</button>
              </div>
            </div>
          ) : (
            <div className="detail-list">
              <div className="detail-row">
                <span className="detail-key">Name</span>
                <span className="detail-val">{user.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Email</span>
                <span className="detail-val">{user.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Headline</span>
                <span className="detail-val">{user.headline || <span className="empty">Not set</span>}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">LinkedIn</span>
                <span className="detail-val">
                  {user.linkedinUrl
                    ? <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="pp-link">{user.linkedinUrl.replace('https://', '')}</a>
                    : <span className="empty">Not set</span>
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {saved && <div className="save-toast">✓ Profile updated!</div>}

        {/* Sign out */}
        <div className="pp-footer">
          <button className="signout-btn" onClick={logout}>Sign out</button>
        </div>
      </div>
    </div>
  )
}
