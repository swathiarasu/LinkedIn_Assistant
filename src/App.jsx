import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import StepIndicator from './components/StepIndicator'
import PasteStep from './components/PasteStep'
import ProfileStep from './components/ProfileStep'
import TopicStep from './components/TopicStep'
import DraftsStep from './components/DraftsStep'
import './App.css'

// ── Inner app — only shown when logged in ──────────────────────────────────
function MainApp() {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [posts, setPosts] = useState([])
  const [voiceProfile, setVoiceProfile] = useState(null)
  const [topic, setTopic] = useState('')
  const [ideaSeed, setIdeaSeed] = useState('')
  const [drafts, setDrafts] = useState([])
  const [showProfile, setShowProfile] = useState(false)

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const restart = () => {
    setPosts([]); setVoiceProfile(null)
    setTopic(''); setIdeaSeed('')
    setDrafts([]); setStep(0)
  }

  return (
    <div className="shell">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">in</span>
            <span className="logo-text">Voice Assistant</span>
          </div>
          <div className="header-right">
            <span className="tagline">Learns how you write. Posts that sound like you.</span>
            <button className="avatar-btn" onClick={() => setShowProfile(true)} title="Your profile">
              {initials}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <StepIndicator current={step} />

        {step === 0 && (
          <PasteStep onDone={(p) => { setPosts(p); setStep(1) }} />
        )}
        {step === 1 && (
          <ProfileStep
            posts={posts}
            onDone={(p) => { setVoiceProfile(p); setStep(2) }}
            onBack={() => setStep(0)}
            ideaSeed={ideaSeed}
            setIdeaSeed={setIdeaSeed}
          />
        )}
        {step === 2 && (
          <TopicStep
            profile={voiceProfile}
            topic={topic}
            setTopic={setTopic}
            onDone={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <DraftsStep
            profile={voiceProfile}
            topic={topic}
            ideaSeed={ideaSeed}
            drafts={drafts}
            setDrafts={setDrafts}
            onBack={() => setStep(2)}
            onRestart={restart}
          />
        )}
      </main>

      {showProfile && <ProfilePage onClose={() => setShowProfile(false)} />}
    </div>
  )
}

// ── Auth gate ───────────────────────────────────────────────────────────────
function AuthGate() {
  const { user } = useAuth()
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'

  if (user) return <MainApp />

  if (authMode === 'login') return <LoginPage onSwitch={() => setAuthMode('signup')} />
  return <SignupPage onSwitch={() => setAuthMode('login')} />
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
