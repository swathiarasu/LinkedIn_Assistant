import { useEffect, useState } from 'react'
import { generateDrafts } from '../api/gemini'
import Card from './Card'
import Btn from './Btn'
import Tag from './Tag'
import './DraftsStep.css'

export default function DraftsStep({ profile, topic, ideaSeed, drafts, setDrafts, onBack, onRestart }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    if (drafts.length === 0) runGenerate()
  }, [])

  const runGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const d = await generateDrafts(profile, topic, ideaSeed)
      setDrafts(d)
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

  if (loading) {
    return (
      <Card className="center-card">
        <div className="spinner" />
        <p className="loading-title">Writing in your persona...</p>
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
            <button
              className={`copy-btn ${copied === i ? 'copied' : ''}`}
              onClick={() => copyPost(d.post, i)}
            >
              {copied === i ? '✓ Copied!' : 'Copy'}
            </button>
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
