import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchSavedPosts, deleteSavedPost } from '../api/supabase'
import './ProfilePage.css'

// Inner component — only rendered when user is guaranteed non-null
function ProfilePanelInner({ onClose }) {
  const { user, profile, updateProfile, logout } = useAuth()

  const [tab, setTab]                 = useState('profile')
  const [editing, setEditing]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedPosts, setSavedPosts]   = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [deleting, setDeleting]       = useState(null)
  const [copied, setCopied]           = useState(null)
  const [form, setForm]               = useState({
    name:         profile?.name || '',
    headline:     profile?.headline || '',
    linkedin_url: profile?.linkedin_url || '',
  })

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (tab === 'posts') loadSavedPosts()
  }, [tab])

  const loadSavedPosts = async () => {
    setPostsLoading(true)
    const { data } = await fetchSavedPosts(user.id)
    setSavedPosts(data || [])
    setPostsLoading(false)
  }

  const handleDelete = async (postId) => {
    setDeleting(postId)
    await deleteSavedPost(postId)
    setSavedPosts(p => p.filter(x => x.id !== postId))
    setDeleting(null)
  }

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    setEditing(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  const displayName = profile?.name || user?.email || 'User'
  const initials    = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const joinDate    = user?.created_at
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
            <p className="pp-email">{user.email}</p>
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

        {/* Tabs */}
        <div className="pp-tabs">
          <button className={`pp-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
            Profile
          </button>
          <button className={`pp-tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
            Saved posts
            {savedPosts.length > 0 && <span className="tab-count">{savedPosts.length}</span>}
          </button>
        </div>

        {/* ── Profile tab ── */}
        {tab === 'profile' && (
          <div className="pp-section">
            <div className="pp-section-header">
              <p className="pp-section-title">Profile details</p>
              {!editing && <button className="edit-btn" onClick={() => setEditing(true)}>Edit</button>}
            </div>

            {editing ? (
              <div className="edit-form">
                <div className="field">
                  <label className="field-label">Full name</label>
                  <input className="field-input" value={form.name} onChange={e => setField('name', e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Headline <span className="optional">optional</span></label>
                  <input className="field-input" value={form.headline} onChange={e => setField('headline', e.target.value)} placeholder="e.g. Product Manager · Building in public" />
                </div>
                <div className="field">
                  <label className="field-label">LinkedIn URL <span className="optional">optional</span></label>
                  <input className="field-input" value={form.linkedin_url} onChange={e => setField('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
                </div>
                <div className="edit-actions">
                  <button className="cancel-btn" onClick={() => {
                    setEditing(false)
                    setForm({ name: profile?.name || '', headline: profile?.headline || '', linkedin_url: profile?.linkedin_url || '' })
                  }}>Cancel</button>
                  <button className="save-btn-profile" onClick={handleSaveProfile} disabled={saving}>
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
                  <span className="detail-val">{user.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Headline</span>
                  <span className="detail-val">{profile?.headline || <span className="empty">Not set</span>}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">LinkedIn</span>
                  <span className="detail-val">
                    {profile?.linkedin_url
                      ? <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="pp-link">
                          {profile.linkedin_url.replace('https://', '')}
                        </a>
                      : <span className="empty">Not set</span>}
                  </span>
                </div>
              </div>
            )}

            {saveSuccess && <div className="save-toast" style={{ marginTop: 12 }}>✓ Profile updated!</div>}

            <div className="auth-badge" style={{ marginTop: 16 }}>
              <span>🔒</span>
              <span>Secured by <strong>Supabase</strong> — passwords are hashed, never stored in plain text</span>
            </div>
          </div>
        )}

        {/* ── Saved posts tab ── */}
        {tab === 'posts' && (
          <div className="pp-section">
            <p className="pp-section-title" style={{ marginBottom: 14 }}>Your saved posts</p>

            {postsLoading ? (
              <div className="posts-loading">
                <div className="spinner-sm" />
                <span>Loading...</span>
              </div>
            ) : savedPosts.length === 0 ? (
              <div className="posts-empty">
                <p className="posts-empty-icon">✍️</p>
                <p className="posts-empty-text">No saved posts yet</p>
                <p className="posts-empty-sub">Generate drafts and click "+ Save" to save them here</p>
              </div>
            ) : (
              <div className="saved-posts-list">
                {savedPosts.map(p => (
                  <div key={p.id} className="saved-post-card">
                    <div className="sp-header">
                      <div>
                        <p className="sp-topic">{p.topic}</p>
                        <p className="sp-label">{p.label}</p>
                        <p className="sp-date">
                          {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="sp-actions">
                        <button className={`sp-copy-btn ${copied === p.id ? 'copied' : ''}`} onClick={() => handleCopy(p.post, p.id)}>
                          {copied === p.id ? '✓' : 'Copy'}
                        </button>
                        <button className="sp-delete-btn" onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                          {deleting === p.id ? '...' : '✕'}
                        </button>
                      </div>
                    </div>
                    <pre className="sp-text">{p.post}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sign out */}
        <div className="pp-footer">
          <button className="signout-btn" onClick={logout}>Sign out</button>
        </div>

      </div>
    </div>
  )
}

// Outer wrapper — only mounts inner component when user exists
// This guarantees hooks in the inner component always run consistently
export default function ProfilePage({ onClose }) {
  const { user } = useAuth()
  if (!user) return null
  return <ProfilePanelInner onClose={onClose} />
}
