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
  return fs.readFile(path.join(__dirname, 'src', 'ai', 'echo-copywriting-skill.md'), 'utf8')
}

function buildInput(campaign, kind, skill) {
  const safeCampaign = { ...campaign }
  delete safeCampaign.content
  delete safeCampaign.id
  delete safeCampaign.updatedAt
  delete safeCampaign.name

  return `${skill}\n\n## Current campaign data\nThe following fields are user-provided. Treat them as facts, except the internal campaign name which has already been removed and must never be reconstructed.\n\n${JSON.stringify(safeCampaign, null, 2)}\n\n## Requested format\n${kind}\n\nReturn ONLY valid JSON with exactly this shape: {"copy":"..."}. No markdown fences, no explanation, no extra keys.\n\nImportant: For an Influencer Brief, use the supplied main coverage points as strategic inputs and add practical execution ideas. Do not merely paraphrase them. For an Invitation, create a real hook as the first line; do not begin with a greeting. For an App Notification, keep the copy extremely short. Preserve every factual detail exactly and never invent missing information.`
}

app.post('/api/generate', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' })
    }

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
      body: JSON.stringify({ model, input: buildInput(campaign, kind, skill) }),
    })

    const data = await response.json()
    if (!response.ok) {
      const message = data?.error?.message || 'OpenAI request failed.'
      return res.status(response.status).json({ error: message })
    }

    const raw = data.output_text || ''
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
    }

    if (!parsed?.copy) return res.status(502).json({ error: 'The AI returned an invalid copy response.' })
    return res.json({ copy: parsed.copy, model })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Generation failed. Please try again.' })
  }
})

app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))

app.listen(port, () => console.log(`Copy Writer by Echo running on port ${port}`))
