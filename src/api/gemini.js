// Gemini Flash API
// Model: gemini-2.5-flash (free tier at aistudio.google.com)

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const callGemini = async (systemPrompt, userMessage, maxTokens = 2048) => {
  const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        responseMimeType: 'application/json', // force Gemini to return raw JSON
        thinkingConfig: { thinkingBudget: 0 }, // disable thinking for faster responses
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error?.message || `Gemini API error (${res.status})`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini — check your API key')
  return text
}

const parseJSON = (text) => {
  // 1. Try parsing directly (responseMimeType:json should give clean output)
  try { return JSON.parse(text.trim()) } catch {}

  // 2. Strip markdown code fences and retry
  try {
    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    return JSON.parse(stripped)
  } catch {}

  // 3. Extract first complete JSON object or array
  try {
    const objMatch = text.match(/\{[\s\S]*\}/)
    if (objMatch) return JSON.parse(objMatch[0])
  } catch {}

  try {
    const arrMatch = text.match(/\[[\s\S]*\]/)
    if (arrMatch) return JSON.parse(arrMatch[0])
  } catch {}

  return null
}

// ─── Analyze persona profile from pasted posts ─────────────────────────────────
export const analyzePersona = async (posts) => {
  const postsText = posts.join('\n\n---\n\n')

  const system = `You are an expert LinkedIn persona analyst. Study the provided posts and return a JSON object with EXACTLY these keys:
{
  "name": "inferred author name, or You if unclear",
  "tone": "2-4 word phrase e.g. Analytical and direct",
  "style": "2-4 word phrase e.g. Story-led with sharp takeaways",
  "themes": ["theme1", "theme2", "theme3"],
  "vocab": ["signature phrase 1", "signature phrase 2", "signature phrase 3"],
  "postLength": "short or medium or long",
  "opensWith": "how they typically begin posts",
  "avoids": "stylistic things they never do",
  "engagementStyle": "how they invite readers in",
  "summary": "2-sentence summary of their LinkedIn writing personality"
}
Return ONLY the JSON object. No explanation, no markdown, no extra text.`

  const raw = await callGemini(
    system,
    `Here are my LinkedIn posts:\n\n${postsText}\n\nAnalyze my voice and return the JSON profile.`,
    1200
  )

  const profile = parseJSON(raw)
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    console.error('Raw Gemini response:', raw)
    throw new Error('Could not parse persona profile. Please try again.')
  }
  return profile
}

// ─── Generate post drafts ─────────────────────────────────────────────────────
export const generateDrafts = async (profile, topic, ideaSeed = '') => {
  const memCtx = ideaSeed.trim()
    ? `\n\nAlso incorporate this rough thought if relevant: "${ideaSeed}"`
    : ''

  const system = `You are a world-class LinkedIn ghostwriter who mimics the author's voice exactly.
Return a JSON array with EXACTLY 3 objects, each with these keys:
[
  {
    "label": "Version A — StyleName",
    "post": "full post text with natural line breaks",
    "why": "one sentence on why this sounds like the author"
  },
  { "label": "Version B — StyleName", "post": "...", "why": "..." },
  { "label": "Version C — StyleName", "post": "...", "why": "..." }
]
Rules:
- Post length: ${profile.postLength}
- Opens with: ${profile.opensWith}
- Avoids: ${profile.avoids}
- Use their signature vocabulary naturally
- Max 2-3 hashtags only if they normally use them
- Make the 3 versions meaningfully different in structure
Return ONLY the JSON array. No markdown, no explanation.`

  const raw = await callGemini(
    system,
    `Topic I want to post about: ${topic}${memCtx}\n\nMy voice profile:\n${JSON.stringify(profile, null, 2)}`,
    4000
  )

  const drafts = parseJSON(raw)
  if (!Array.isArray(drafts)) {
    console.error('Raw Gemini response:', raw)
    throw new Error('Could not parse drafts. Please try again.')
  }
  return drafts
}
