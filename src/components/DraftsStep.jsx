import { useEffect, useState } from 'react'
import { generateDrafts } from '../api/gemini'
import { savePost } from '../api/supabase'
import { useAuth } from '../context/AuthContext'
import Card from './Card'
import Btn from './Btn'
import Tag from './Tag'
import './DraftsStep.css'

export default function DraftsStep({ profile, topic, ideaSeed, drafts, setDrafts, onBack, onRestart }) {
  const { user, incrementStats } = useAuth()
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState(null)
  const [saved, setSaved]       = useState({})   // { [index]: 'saving' | 'saved' | 'error' }

  useEffect(() => {
    if (drafts.length === 0) runGenerate()
  }, [])

  const runGenerate = async () => {
    setLoading(true)
    setError('')
    setSaved({})
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

  const handleSave = async (draft, i) => {
    if (!user) return
    setSaved(s => ({ ...s, [i]: 'saving' }))

    const { error } = await savePost(user.id, {
      topic,
      label: draft.label,
      post:  draft.post,
    })

    if (error) {
      setSaved(s => ({ ...s, [i]: 'error' }))
      setTimeout(() => setSaved(s => ({ ...s, [i]: null })), 3000)
    } else {
      setSaved(s => ({ ...s, [i]: 'saved' }))
    }
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

  const saveLabel = (i) => {
    if (saved[i] === 'saving') return 'Saving...'
    if (saved[i] === 'saved')  return '✓ Saved!'
    if (saved[i] === 'error')  return 'Failed'
    return '+ Save'
  }

  const saveClass = (i) => {
    if (saved[i] === 'saved')  return 'save-btn saved'
    if (saved[i] === 'error')  return 'save-btn error'
    return 'save-btn'
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
          <div className="draft-top">
            <Tag color={TAG_COLORS[i % TAG_COLORS.length]}>{d.label}</Tag>
            <div className="draft-actions">
              <button
                className={`copy-btn ${copied === i ? 'copied' : ''}`}
                onClick={() => copyPost(d.post, i)}
              >
                {copied === i ? '✓ Copied!' : 'Copy'}
              </button>
              <button
                className={saveClass(i)}
                onClick={() => handleSave(d, i)}
                disabled={saved[i] === 'saving' || saved[i] === 'saved'}
              >
                {saveLabel(i)}
              </button>
            </div>
          </div>

          <pre className="draft-text">{d.post}</pre>

          <div className="draft-why">
            <span className="why-label">Why this sounds like you:</span> {d.why}
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
