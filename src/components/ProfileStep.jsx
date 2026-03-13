import { useEffect, useState } from 'react'
import { analyzePersona } from '../api/gemini'
import Card from './Card'
import Btn from './Btn'
import Tag from './Tag'
import './ProfileStep.css'

export default function ProfileStep({ posts, onDone, onBack, ideaSeed, setIdeaSeed }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [memoryOpen, setMemoryOpen] = useState(false)

  useEffect(() => { runAnalysis() }, [])

  const runAnalysis = async () => {
    setLoading(true)
    setError('')
    try {
      const p = await analyzePersona(posts)
      setProfile(p)
    } catch (e) {
      setError(e.message || 'Something went wrong analyzing your posts.')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <Card className="center-card">
        <div className="spinner" />
        <p className="loading-title">Analyzing your persona...</p>
        <p className="loading-sub">Reading {posts.length} posts · Detecting tone, themes &amp; patterns</p>
        <div className="progress-bar"><div className="progress-fill" /></div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <p className="error-msg">⚠️ {error}</p>
        <div className="row-actions">
          <Btn onClick={onBack}>← Back</Btn>
          <Btn primary onClick={runAnalysis}>Retry</Btn>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <Card>
        <div className="profile-top">
          <div className="avatar">{(profile.name || 'Y')[0].toUpperCase()}</div>
          <div>
            <p className="profile-name">{profile.name}</p>
            <div className="persona-pills">
              <span className="persona-pill">{profile.tone}</span>
              <span className="persona-dot">·</span>
              <span className="persona-pill">{profile.style}</span>
            </div>
          </div>
        </div>

        <p className="profile-summary">{profile.summary}</p>

        <div className="meta-grid">
          <div className="meta-box">
            <span className="meta-label">Post length</span>
            <span className="meta-val">{profile.postLength}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Opens with</span>
            <span className="meta-val">{profile.opensWith}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Engagement style</span>
            <span className="meta-val">{profile.engagementStyle}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Avoids</span>
            <span className="meta-val">{profile.avoids}</span>
          </div>
        </div>

        <div className="tag-section">
          <p className="tag-label">THEMES</p>
          <div>{(profile.themes || []).map((t, i) => <Tag key={i} index={i}>{t}</Tag>)}</div>
        </div>

        {profile.vocab?.length > 0 && (
          <div className="tag-section">
            <p className="tag-label">SIGNATURE PHRASES</p>
            <div>{profile.vocab.map((v, i) => <Tag key={i} color="gray">{v}</Tag>)}</div>
          </div>
        )}
      </Card>

      {/* Idea Memory */}
      <Card>
        <div className="memory-header" onClick={() => setMemoryOpen(!memoryOpen)}>
          <div>
            <span className="memory-title">💡 Idea Memory</span>
            <span className="memory-badge">optional</span>
            <p className="memory-desc">Got a half-formed thought, note, or bookmark? Drop it here — the AI will shape it into a post idea.</p>
          </div>
          <span className="chevron">{memoryOpen ? '▲' : '▼'}</span>
        </div>
        {memoryOpen && (
          <textarea
            className="memory-textarea"
            value={ideaSeed}
            onChange={e => setIdeaSeed(e.target.value)}
            placeholder="e.g. 'something about how async work changes trust in remote teams — haven't figured out the angle yet...'"
            rows={3}
          />
        )}
      </Card>

      <div className="row-actions">
        <Btn onClick={onBack}>← Re-paste posts</Btn>
        <Btn primary onClick={() => onDone(profile)}>Choose a topic →</Btn>
      </div>
    </div>
  )
}
