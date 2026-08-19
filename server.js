import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const port = process.env.PORT || 3000
const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna'

app.use(express.json({ limit: '100kb' }))

async function loadSkill() {
  return fs.readFile(path.join(__dirname, 'skill', 'echo-copywriting-skill.md'), 'utf8')
}

function buildInput(campaign, kind, skill) {
  const safeCampaign = { ...campaign }
  delete safeCampaign.content
  delete safeCampaign.id
  delete safeCampaign.updatedAt
  delete safeCampaign.name

  return `${skill}\n\n## Current campaign data\nTreat these fields as confirmed facts. The internal campaign name has already been removed and must never be reconstructed.\n\n${JSON.stringify(safeCampaign, null, 2)}\n\n## Requested output type\n${kind}\n\nReturn ONLY valid JSON with exactly this shape: {"copy":"..."}. No markdown fences, no explanation, no extra keys.\n\nFinal checks before answering: the internal campaign name must not appear; an Invitation must have a campaign-specific hook and must not start with a generic greeting; a Brief must turn coverage points into practical execution ideas instead of copying them; a Notification must be extremely short; Visit/Event/Store Visit times must use the From–To window when provided; CTA wording must match Bloom App, Booking Link, or WhatsApp; multiple dates/branches must trigger confirmation wording where appropriate; dialect and audience rules must be respected.`
}

app.post('/api/generate', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' })
    const { campaign, kind } = req.body || {}
    const allowed = new Set(['invitation', 'brief', 'reminder', 'notification'])
    if (!campaign || !allowed.has(kind)) return res.status(400).json({ error: 'Invalid campaign or copy type.' })

    const skill = await loadSkill()
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        input: buildInput(campaign, kind, skill),
        store: false,
      }),
    })

    const data = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'OpenAI request failed.' })

    const raw = data.output_text || ''
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    }

    if (!parsed?.copy) return res.status(502).json({ error: 'The AI returned an invalid copy response.' })
    res.json({ copy: parsed.copy, model })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Generation failed. Please try again.' })
  }
})

app.use(express.static(path.join(__dirname, 'dist')))
app.use((req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))

app.listen(port, () => console.log(`Copy Writer by Echo running on port ${port}`))
