import Card from './Card'
import Btn from './Btn'
import './TopicStep.css'

const IDEAS = [
  { icon: '🔍', template: (themes) => `A lesson I recently learned about ${themes[0]?.toLowerCase() || 'my work'}` },
  { icon: '💬', template: (themes) => `An unpopular opinion I have about ${themes[1]?.toLowerCase() || 'my industry'}` },
  { icon: '✨', template: (themes) => `Something that surprised me about ${themes[2]?.toLowerCase() || 'my field'} this month` },
  { icon: '🚀', template: () => `A mistake I made and what I learned from it` },
  { icon: '📖', template: () => `Something I wish I knew earlier in my career` },
]

export default function TopicStep({ profile, topic, setTopic, onDone, onBack }) {
  return (
    <div>
      <Card>
        <h2 className="topic-title">What do you want to post about?</h2>
        <p className="topic-sub">A topic, experience, opinion, or question — rough is fine. The AI will do the rest.</p>

        <textarea
          className="topic-input"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && topic.trim()) { e.preventDefault(); onDone() } }}
          placeholder="e.g. what I learned from a failed product launch"
          rows={3}
        />

        <p className="ideas-label">SUGGESTED IDEAS BASED ON YOUR THEMES</p>
        <div className="ideas-list">
          {IDEAS.map((idea, i) => {
            const text = idea.template(profile?.themes || [])
            return (
              <div
                key={i}
                className={`idea-chip ${topic === text ? 'selected' : ''}`}
                onClick={() => setTopic(text)}
              >
                <span className="idea-icon">{idea.icon}</span>
                <span>{text}</span>
              </div>
            )
          })}
        </div>

        <div className="row-actions" style={{ marginTop: 16 }}>
          <Btn onClick={onBack}>← Back</Btn>
          <Btn primary onClick={onDone} disabled={!topic.trim()}>
            Generate drafts →
          </Btn>
        </div>
      </Card>
    </div>
  )
}
