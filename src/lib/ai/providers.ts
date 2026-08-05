import { env } from '../env'
import type { ChatMessage } from './types'

export interface StreamOptions {
  signal?: AbortSignal
  system?: string
  temperature?: number
}

export interface Provider {
  readonly name: string
  available(): boolean
  stream(messages: ChatMessage[], opts: StreamOptions, onToken: (delta: string) => void): Promise<void>
}

/* ---------------- SSE helpers ---------------- */

async function consumeSSE(
  res: Response,
  onToken: (delta: string) => void,
  extract: (json: unknown) => string,
): Promise<void> {
  if (!res.body) throw new Error('No response body')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const flush = (chunk: string) => {
    buffer += chunk
    let idx: number
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, idx)
      buffer = buffer.slice(idx + 2)
      for (const line of block.split('\n')) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const text = extract(JSON.parse(payload))
          if (text) onToken(text)
        } catch {
          /* skip malformed frames */
        }
      }
    }
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    flush(decoder.decode(value, { stream: true }))
  }
  flush(decoder.decode())
}

/* ---------------- OpenAI ---------------- */

const openaiProvider: Provider = {
  name: 'OpenAI',
  available: () => env.openaiKey !== '',
  async stream(messages, opts, onToken) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.openaiKey}` },
      signal: opts.signal,
      body: JSON.stringify({
        model: env.aiModel || env.openaiModel,
        stream: true,
        temperature: opts.temperature ?? 0.7,
        messages: [
          ...(opts.system ? [{ role: 'system', content: opts.system }] : []),
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    })
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`)
    await consumeSSE(res, onToken, (json) => {
      const data = json as { choices?: { delta?: { content?: string } }[] }
      return data.choices?.[0]?.delta?.content ?? ''
    })
  },
}

/* ---------------- Anthropic ---------------- */

const anthropicProvider: Provider = {
  name: 'Anthropic',
  available: () => env.anthropicKey !== '',
  async stream(messages, opts, onToken) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      signal: opts.signal,
      body: JSON.stringify({
        model: env.aiModel || env.anthropicModel,
        stream: true,
        max_tokens: 1024,
        temperature: opts.temperature ?? 0.7,
        system: opts.system ?? 'You are LUMEN, the ARACHNID experience assistant.',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`)
    await consumeSSE(res, onToken, (json) => {
      const data = json as { type?: string; delta?: { text?: string } }
      return data.type === 'content_block_delta' ? (data.delta?.text ?? '') : ''
    })
  },
}

/* ---------------- Gemini ---------------- */

const geminiProvider: Provider = {
  name: 'Gemini',
  available: () => env.geminiKey !== '',
  async stream(messages, opts, onToken) {
    const model = env.aiModel || env.geminiModel
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${env.geminiKey}`
    const system = opts.system
    const contents = system
      ? [{ role: 'user', parts: [{ text: `${system}\n\n${messages.map((m) => `${m.role}: ${m.content}`).join('\n')}` }] }]
      : messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : m.role, parts: [{ text: m.content }] }))
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: opts.signal,
      body: JSON.stringify({ contents, generationConfig: { temperature: opts.temperature ?? 0.7 } }),
    })
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`)
    await consumeSSE(res, onToken, (json) => {
      const data = json as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
      return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
    })
  },
}

export const PROVIDERS: Provider[] = [openaiProvider, anthropicProvider, geminiProvider]

/** Pick the active provider: explicit env choice, else first available. */
export function getProvider(): Provider | null {
  const explicit = env.aiProvider
  if (explicit === 'openai') return openaiProvider
  if (explicit === 'anthropic') return anthropicProvider
  if (explicit === 'gemini') return geminiProvider
  return PROVIDERS.find((p) => p.available()) ?? null
}

/** True when a live provider is reachable. */
export function hasLiveProvider(): boolean {
  return getProvider() !== null
}
