import './StepIndicator.css'

const STEPS = ['Paste Posts', 'Your Voice', 'Pick Topic', 'Get Drafts']

export default function StepIndicator({ current }) {
  return (
    <div className="steps">
      {STEPS.map((label, i) => (
        <div key={i} className={`step ${i < current ? 'done' : i === current ? 'active' : ''}`}>
          <div className="step-track">
            <div className="step-fill" />
          </div>
          <span className="step-label">{label}</span>
        </div>
      ))}
    </div>
  )
}
