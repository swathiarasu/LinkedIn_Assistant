import { useEffect, useState } from 'react'
import { generateDrafts } from '../api/gemini'
import { savePost } from '../api/supabase'
import { useAuth } from '../context/AuthContext'
import Card from './Card'
import Btn from './Btn'
import Tag from './Tag'
import './DraftsStep.css'

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

export default function DraftsStep({ profile, topic, ideaSeed, drafts, setDrafts, onBack, onRestart }) {
  const { user, incrementStats } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [copied, setCopied]   = useState(null)
  const [posting, setPosting] = useState({})

  useEffect(() => {
    if (drafts.length === 0) runGenerate()
  }, [])

  const runGenerate = async () => {
    setLoading(true)
    setError('')
    setPosting({})
    try {
      const d = await generateDrafts(profile, topic, ideaSeed)
      setDrafts(d)
      await incrementStats('drafts_generated')
    } catch (e) {
      setError(e.message || 'Something went wrong generating drafts.')
    }
    setLoading(false)
  }

  const copyPost = (text, i) => {
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  const handlePostToLinkedIn = async (draft, i) => {
    setPosting(p => ({ ...p, [i]: 'posting' }))

    // 1. Save to Supabase
    if (user) {
      const { error: saveError } = await savePost(user.id, {
        topic,
        label: draft.label,
        post:  draft.post,
      })
      if (saveError) console.error('Failed to save post:', saveError.message)
    }

    // 2. Copy to clipboard as backup
    try { await navigator.clipboard.writeText(draft.post) } catch {}

    // 3. Open LinkedIn composer with post pre-filled
    const encoded = encodeURIComponent(draft.post)
    window.open(
      `https://www.linkedin.com/feed/?shareActive=true&text=${encoded}`,
      '_blank',
      'noopener,noreferrer'
    )

    setPosting(p => ({ ...p, [i]: 'done' }))
  }

  if (loading) {
    return (
      <Card className="center-card">
        <div className="spinner" />
        <p className="loading-title">Writing in your voice...</p>
        <p className="loading-sub">Generating 3 variations that sound like you</p>
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
          <Btn primary onClick={runGenerate}>Retry</Btn>
        </div>
      </Card>
    )
  }

  const TAG_COLORS = ['purple', 'teal', 'coral']

  const linkedInLabel = (i) => {
    if (posting[i] === 'posting') return 'Saving & opening...'
    if (posting[i] === 'done')    return '✓ Opened LinkedIn!'
    return 'Post to LinkedIn'
  }

  const linkedInClass = (i) => {
    if (posting[i] === 'done') return 'linkedin-btn done'
    return 'linkedin-btn'
  }

  return (
    <div>
      <div className="drafts-header">
        <div>
          <h2 className="drafts-title">Your drafts</h2>
          <p className="drafts-topic">Topic: <strong>{topic}</strong></p>
        </div>
        <Btn small onClick={runGenerate}>↻ Regenerate</Btn>
      </div>

      {drafts.map((d, i) => (
        <Card key={i} className="draft-card">

          {/* Top row: label + copy */}
          <div className="draft-top">
            <Tag color={TAG_COLORS[i % TAG_COLORS.length]}>{d.label}</Tag>
            <button
              className={`copy-btn ${copied === i ? 'copied' : ''}`}
              onClick={() => copyPost(d.post, i)}
            >
              {copied === i ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          {/* Post content */}
          <pre className="draft-text">{d.post}</pre>

          {/* Bottom row: why + Post to LinkedIn */}
          <div className="draft-footer">
            <p className="draft-why">
              <span className="why-label">Why this sounds like you:</span> {d.why}
            </p>
            <button
              className={linkedInClass(i)}
              onClick={() => handlePostToLinkedIn(d, i)}
              disabled={posting[i] === 'posting'}
            >
              {posting[i] !== 'done' && <LinkedInIcon />}
              {linkedInLabel(i)}
            </button>
          </div>

        </Card>
      ))}

      <div className="row-actions" style={{ marginTop: 8 }}>
        <Btn onClick={onBack}>← Change topic</Btn>
        <Btn ghost onClick={onRestart}>Start over</Btn>
      </div>
    </div>
  )
}
