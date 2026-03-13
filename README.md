# LinkedIn Voice Assistant 🎯

An AI-powered tool that learns how you write from your past LinkedIn posts, then generates new posts that sound exactly like you — not generic AI content.

---

## How it works

1. **Paste your posts** — Copy 5–15 of your LinkedIn posts and paste them in
2. **AI builds your voice profile** — Detects your tone, style, themes, vocabulary, and patterns
3. **Pick a topic** — Choose from AI-suggested ideas based on your themes, or type your own
4. **Get 3 drafts** — Three distinct variations written in your voice, ready to copy and post

### Bonus: Idea Memory
Drop a half-formed thought or note — the AI will weave it into your post idea.

---

## Tech Stack

- **Frontend**: React + Vite
- **AI**: Google Gemini Flash 2.0 (free tier)
- **Auth**: localStorage-based (no backend needed)
- **No server** — calls Gemini API directly from the browser

---

## Setup

### 1. Install dependencies

```bash
cd linkedin-voice-assistant
npm install
```

### 2. Get your Gemini API key (free)

1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API key"
4. Copy the key

### 3. Add your key to .env

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder:

```
VITE_GEMINI_API_KEY=your_key_here
```

### 4. Run the app

```bash
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
linkedin-voice-assistant/
├── src/
│   ├── api/
│   │   └── gemini.js          # Gemini Flash API (analyzeVoice, generateDrafts)
│   ├── context/
│   │   └── AuthContext.jsx    # signup, login, logout, updateProfile
│   ├── pages/
│   │   ├── LoginPage.jsx      # Login page
│   │   ├── SignupPage.jsx     # 2-step signup
│   │   ├── ProfilePage.jsx    # Slide-in profile panel
│   │   └── AuthPages.css
│   ├── components/
│   │   ├── StepIndicator.jsx  # Progress bar
│   │   ├── PasteStep.jsx      # Step 1: paste posts
│   │   ├── ProfileStep.jsx    # Step 2: voice profile + idea memory
│   │   ├── TopicStep.jsx      # Step 3: pick topic
│   │   ├── DraftsStep.jsx     # Step 4: generated drafts
│   │   ├── Card / Btn / Tag   # Shared UI components
│   ├── App.jsx                # Root with auth gate
│   └── main.jsx
├── .env                       # Your Gemini key (never commit)
├── .env.example
└── package.json
```

---

## Build for production

```bash
npm run build
```

---

## Hackathon demo tips

- Have 5–10 sample LinkedIn posts ready to paste
- The voice profile card is the "wow" moment — show it before generating posts
- Highlight **Idea Memory** as the differentiator
- Gemini Flash is fast — generations take 2–4 seconds
