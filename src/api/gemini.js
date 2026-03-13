// Gemini Flash API — replaces claude.js
// Model: gemini-2.5-flash (free tier at aistudio.google.com)

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const callGemini = async (systemPrompt, userMessage, maxTokens = 1500) => {
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
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err?.error?.message || 'Gemini API error')
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini')
  return text
}

const parseJSON = (text) => {
  try {
    // Strip markdown code fences if present
    const clean = text.replace(/```json\s*|```\s*/g, '').trim()
    return JSON.parse(clean)
  } catch {
    // Try extracting JSON from within the text
    const match = text.match(/[\[{][\s\S]*[\]}]/)
    if (match) {
      try { return JSON.parse(match[0]) } catch { return null }
    }
    return null
  }
}

// ─── Analyze voice profile from pasted posts ─────────────────────────────────
export const analyzeVoice = async (posts) => {
  const postsText = posts.join('\n\n---\n\n')

  const system = `You are an expert LinkedIn analyst. Study the provided posts deeply and return ONLY a valid JSON object — no markdown, no backticks, no explanation. Use this exact schema:
{
  "name": "inferred author name, or 'You' if unclear",
  "tone": "2-4 word phrase describing their tone (e.g. 'Analytical and direct')",
  "style": "2-4 word phrase describing writing style (e.g. 'Story-led with sharp takeaways')",
  "themes": ["theme1", "theme2", "theme3"],
  "vocab": ["a signature phrase or word they use", "another one", "another one"],
  "postLength": "short or medium or long",
  "opensWith": "how they typically begin posts (e.g. 'A personal story or observation')",
  "avoids": "stylistic things they never do (e.g. 'Generic advice and hashtag spam')",
  "engagementStyle": "how they invite readers in (e.g. 'Ends with a question' or 'Uses bold statements')",
  "summary": "2-sentence summary of their LinkedIn writing personality"
}`

  const raw = await callGemini(
    system,
    `Here are my LinkedIn posts:\n\n${postsText}\n\nAnalyze my voice and return the JSON profile.`,
    900
  )

  const profile = parseJSON(raw)
  if (!profile) throw new Error('Could not parse voice profile. Please try again.')
  return profile
}

// ─── Generate post drafts ─────────────────────────────────────────────────────
export const generateDrafts = async (profile, topic, ideaSeed = '') => {
  const memCtx = ideaSeed.trim()
    ? `\n\nThe user also has this rough unfinished thought to incorporate if relevant: "${ideaSeed}"`
    : ''

  const system = `You are a world-class LinkedIn ghostwriter. Your job is to write posts that are indistinguishable from the real author. You have been given a detailed voice profile. You must match their tone, vocabulary, opening style, post length, and engagement style exactly.

Return ONLY a valid JSON array — no markdown, no backticks, no extra text:
[
  {
    "label": "Version A — [creative style name]",
    "post": "the full post text, formatted exactly as LinkedIn posts are (line breaks, short punchy paragraphs, etc.)",
    "why": "one sentence explaining what makes this version true to their voice"
  },
  {
    "label": "Version B — [creative style name]",
    "post": "...",
    "why": "..."
  },
  {
    "label": "Version C — [creative style name]",
    "post": "...",
    "why": "..."
  }
]

Rules:
- Each version must feel like the author actually wrote it — not generic LinkedIn content
- Match their exact post length preference: ${profile.postLength}
- Open posts the way they do: ${profile.opensWith}
- Use their vocabulary and signature phrases naturally
- Avoid what they avoid: ${profile.avoids}
- Max 2-3 hashtags only if the author uses them; otherwise none
- Make the 3 versions meaningfully different (e.g. story-driven vs. insight-driven vs. opinion-driven)`

  const raw = await callGemini(
    system,
    `Topic I want to post about: ${topic}${memCtx}\n\nMy voice profile:\n${JSON.stringify(profile, null, 2)}`,
    2000
  )

  const drafts = parseJSON(raw)
  if (!Array.isArray(drafts)) throw new Error('Could not parse drafts. Please try again.')
  return drafts
}
