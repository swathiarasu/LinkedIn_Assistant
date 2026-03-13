# LinkedIn Voice Assistant 🎯

An AI tool that learns how you write from your LinkedIn posts, then generates new posts that sound exactly like you.

---

## Quickstart (for teammates pulling from GitHub)

### 1. Clone and install
```bash
git clone <your-repo-url>
cd linkedin-voice-assistant
npm install
```

### 2. Set up your .env file
```bash
cp .env.example .env
```

Open `.env` — the Supabase keys are already filled in (we share one database).
You only need to add **your own Gemini API key**:

```
VITE_GEMINI_API_KEY=your_own_gemini_api_key_here   ← get this (free)
VITE_SUPABASE_URL=https://kfigofrkjddieetuufzj.supabase.co        ← already set
VITE_SUPABASE_ANON_KEY=eyJhbGci...                 ← already set
```

**Get a free Gemini API key:**
1. Go to https://aistudio.google.com/apikey
2. Sign in with Google → click "Create API key"
3. Paste it into `.env`

### 3. Run the app
```bash
npm run dev
```

Open http://localhost:3000 — create an account and you're good to go!

---

## Why does everyone need their own Gemini key?

The Supabase database is shared — all teammates use the same one.
But Gemini API keys have per-account rate limits, so each person needs their own free key.
Getting one takes about 60 seconds at https://aistudio.google.com/apikey

---

## How it works

1. **Sign up / Log in** — your account is stored in our shared Supabase database
2. **Paste your LinkedIn posts** — copy 5–15 posts from your profile
3. **AI builds your voice profile** — detects your tone, style, themes, vocabulary
4. **Pick a topic** — choose from AI-suggested ideas or type your own
5. **Get 3 drafts** — three variations written in your voice, ready to copy

### Bonus: Idea Memory
Drop a half-formed thought — the AI will weave it into your post.

---

## Tech stack

- **Frontend**: React + Vite
- **AI**: Google Gemini 2.5 Flash
- **Auth + Database**: Supabase
- **No backend** — all API calls made directly from the browser

---

## Project structure

```
src/
├── api/
│   ├── gemini.js        # Gemini API (analyzeVoice, generateDrafts)
│   └── supabase.js      # Supabase client
├── context/
│   └── AuthContext.jsx  # Auth state (signup, login, logout)
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   └── ProfilePage.jsx
├── components/
│   ├── PasteStep.jsx    # Step 1: paste posts
│   ├── ProfileStep.jsx  # Step 2: voice profile
│   ├── TopicStep.jsx    # Step 3: pick topic
│   └── DraftsStep.jsx   # Step 4: generated drafts
└── App.jsx
```

---

## Build for production
```bash
npm run build
```
