// Gemini API
// Model: gemini-2.5-flash-lite — thinking OFF by default, fastest stable model

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent'

const callGemini = async (systemPrompt, userMessage, maxTokens = 1024) => {
  const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        { role: 'user', parts: [{ text: userMessage }] },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error?.message || `Gemini API error (${res.status})`)
  }

  const data = await res.json()

  const parts = data?.candidates?.[0]?.content?.parts || []
  const text = parts
    .filter(p => p.text && !p.thought)
    .map(p => p.text)
    .join('')
    .trim()

  if (!text) throw new Error('Empty response from Gemini — check your API key')
  return text
}

const parseJSON = (text) => {
  try { return JSON.parse(text.trim()) } catch {}
  try {
    const s = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    return JSON.parse(s)
  } catch {}
  try {
    const m = text.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
  } catch {}
  try {
    const m = text.match(/\[[\s\S]*\]/)
    if (m) return JSON.parse(m[0])
  } catch {}
  console.error('JSON parse failed. Raw:', text)
  return null
}

// ── Analyze persona profile ───────────────────────────────────────────────
export const analyzePersona = async (posts) => {
  const postsText = posts.slice(0, 8).join('\n\n---\n\n')

  const system = `LinkedIn persona analyst. Return JSON only, no markdown:
{"name":"string","tone":"2-4 words","style":"2-4 words","themes":["t1","t2","t3"],"vocab":["p1","p2","p3"],"postLength":"short|medium|long","opensWith":"string","avoids":"string","engagementStyle":"string","summary":"2 sentences"}`

  const raw = await callGemini(system, `Analyze these posts:\n\n${postsText}`, 512)
  const profile = parseJSON(raw)
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    throw new Error('Could not parse persona profile. Please try again.')
  }
  return profile
}

// ── Generate post drafts ──────────────────────────────────────────────────
export const generateDrafts = async (profile, topic, ideaSeed = '') => {
  const memCtx = ideaSeed.trim() ? ` Also weave in: "${ideaSeed}".` : ''

  const system = `LinkedIn ghostwriter. Mimic this voice:
Tone:${profile.tone}|Style:${profile.style}|Length:${profile.postLength}|Opens:${profile.opensWith}|Avoids:${profile.avoids}|Vocab:${(profile.vocab||[]).join(',')}
Return JSON array only:
[{"label":"Version A — Name","post":"post text here","why":"one sentence"},{"label":"Version B — Name","post":"post text here","why":"one sentence"},{"label":"Version C — Name","post":"post text here","why":"one sentence"}]
3 different styles. Max 2 hashtags only if they normally use them.`

  const raw = await callGemini(system, `Topic: ${topic}.${memCtx}`, 1000)
  const drafts = parseJSON(raw)
  if (!Array.isArray(drafts)) throw new Error('Could not parse drafts. Please try again.')
  return drafts
}
