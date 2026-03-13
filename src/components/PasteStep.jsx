import { useState } from 'react'
import Card from './Card'
import Btn from './Btn'
import './PasteStep.css'

const PLACEHOLDER = `Post 1:
I've been thinking about how most meetings could be emails. We spend 4 hours in meetings to make a 10-minute decision. There's a better way.

Post 2:
After 3 years of building in public, here's the one thing I wish someone told me: consistency beats quality in the beginning. Ship anyway.

Post 3:
Unpopular opinion: the best engineers I've worked with aren't the fastest coders. They're the ones who ask the most questions before writing a single line.`

export default function PasteStep({ onDone }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const handleContinue = () => {
    const posts = text
      .split(/\n{2,}/)
      .map(p => p.replace(/^post\s*\d+[:\-]?\s*/i, '').trim())
      .filter(p => p.length > 30)

    if (posts.length < 3) {
      setError('Please paste at least 3 posts so the AI can learn your voice properly.')
      return
    }
    setError('')
    onDone(posts)
  }

  const postCount = text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 30).length

  return (
    <div>
      <Card>
        <h2 className="paste-title">Paste your LinkedIn posts</h2>
        <p className="paste-sub">
          Copy 5–15 of your past posts and paste them below, separated by a blank line.
          The more you share, the better the AI learns your voice.
        </p>

        <textarea
          className="paste-area"
          value={text}
          onChange={e => { setText(e.target.value); setError('') }}
          placeholder={PLACEHOLDER}
          rows={14}
        />

        <div className="paste-footer">
          <div className="post-count">
            {text.trim().length > 0 && (
              <span className={postCount >= 3 ? 'count-ok' : 'count-warn'}>
                {postCount} post{postCount !== 1 ? 's' : ''} detected
                {postCount >= 3 ? ' ✓' : ' — need at least 3'}
              </span>
            )}
          </div>
          {error && <p className="paste-error">{error}</p>}
          <Btn primary onClick={handleContinue} disabled={text.trim().length < 100}>
            Analyze my voice →
          </Btn>
        </div>
      </Card>

      <div className="tip-card">
        <span className="tip-icon">💡</span>
        <p className="tip-text">
          <strong>Tip:</strong> Go to your LinkedIn profile → Activity → Posts, and copy your recent posts directly. The AI looks at your tone, vocabulary, themes, and how you open and close posts.
        </p>
      </div>
    </div>
  )
}
