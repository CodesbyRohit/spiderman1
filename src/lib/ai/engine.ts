import { aiMode } from '../env'
import { CHARACTERS, type Character } from './knowledge/lore'
import { buildContext, retrieve } from './knowledge/rag'
import { buildUserContext } from './memory'
import { getProvider } from './providers'
import { simulateStream } from './streaming'
import type { ChatMessage, Citation } from './types'
import type { BattleResult, CoverOptions, CoverResult, StoryInput, StoryResult, SuitOptions, SuitResult, TriviaQuestion, GeneratedMission } from './types'
import {
  characterById,
  demoChatReply,
  generateCover,
  generateMissions,
  generateStory,
  generateSuit,
  generateTrivia,
  runBattle,
} from './generator'

const LUMEN_SYSTEM = `You are LUMEN, the AI of the ARACHNID experience — an original arachnid-inspired universe (hero: ARACHNID / the Guardian; city: Silkspire; villain: the Weaver Syndicate). Be vivid, concise and a little witty. Answer strictly from the retrieved lore with inline [citation] tags when provided. If asked about Spider-Man or Marvel, gently explain this is an original inspired universe and pivot to ARACHNID. Keep answers under 180 words unless asked for a story.`

/** Which intelligence mode is live right now. */
export function mode(): 'demo' | 'ai' {
  return aiMode()
}

export function characters(): Character[] {
  return CHARACTERS
}

/* ---------------- chat ---------------- */

export async function chatStream(
  history: ChatMessage[],
  onToken: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<{ citations: Citation[]; mode: 'demo' | 'ai' }> {
  const lastUser = [...history].reverse().find((m) => m.role === 'user')?.content ?? ''
  const citations: Citation[] = retrieve(lastUser, 3).map((r) => ({ title: r.title, score: r.score }))
  const provider = getProvider()

  if (provider) {
    const context = buildContext(lastUser, 3)
    const userContext = buildUserContext()
    const messages: ChatMessage[] = [...history.slice(-10)]
    if (context) {
      messages.push({
        role: 'user',
        content: `Context from the lore archive:\n${context}\n\nPlayer profile:\n${userContext}\n\nAnswer the last question using this context when relevant.`,
      })
    }
    await provider.stream(messages, { signal, system: LUMEN_SYSTEM }, onToken)
    return { citations, mode: 'ai' }
  }

  const full = demoChatReply(lastUser)
  await new Promise<void>((resolve) => {
    const h = simulateStream(full, onToken, { onDone: () => resolve() })
    signal?.addEventListener('abort', () => h.cancel())
    if (signal?.aborted) h.cancel()
  })
  return { citations, mode: 'demo' }
}

/* ---------------- story generator (streamed) ---------------- */

export async function streamStory(
  input: StoryInput,
  onToken: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<StoryResult> {
  const provider = getProvider()
  if (provider) {
    let buffer = ''
    const onDelta = (d: string) => {
      buffer += d
      onToken(d)
    }
    await provider.stream(
      [
        {
          role: 'user',
          content: `Write a short 4-chapter story (each 2-3 sentences) for the ARACHNID universe. Villain: ${input.villain || 'Dr. Nullweave'}. City: ${input.city || 'Silkspire'}. Hero power: ${input.power || 'the Spider-Sense'}. Dominant emotion: ${input.emotion || 'hope'}. Format EXACTLY:\nTITLE: <title>\nCH1: <text>\nCH2: <text>\nCH3: <text>\nCH4: <text>\nTWIST: <one line>`,
        },
      ],
      { signal, system: LUMEN_SYSTEM, temperature: 0.9 },
      onDelta,
    )
    const title = matchLine(buffer, 'TITLE')
    const chapters = ['CH1', 'CH2', 'CH3', 'CH4'].map((k) => matchLine(buffer, k)).filter(Boolean)
    const twist = matchLine(buffer, 'TWIST')
    if (!title && !chapters.length) {
      return { title: 'The Untitled Weave', chapters: [buffer.trim()], twist: '' }
    }
    return { title: title || 'The Untitled Weave', chapters, twist }
  }

  const result = generateStory(input)
  const payload = [
    `TITLE: ${result.title}\n\n`,
    ...result.chapters.map((c, i) => `${i > 0 ? '\n' : ''}${c}\n`),
    `\nTWIST: ${result.twist}`,
  ].join('')
  await new Promise<void>((resolve) => {
    const h = simulateStream(payload, onToken, { onDone: () => resolve() })
    signal?.addEventListener('abort', () => h.cancel())
    if (signal?.aborted) h.cancel()
  })
  return result
}

function matchLine(text: string, key: string): string {
  const m = text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
  return m ? m[1].trim() : ''
}

/* ---------------- sync generators ---------------- */

export function forgeSuit(o: SuitOptions): SuitResult {
  return generateSuit(o)
}

export function forgeCover(o: CoverOptions): CoverResult {
  return generateCover(o)
}

export function simulateBattle(aId: string, bId: string): BattleResult | null {
  const a = characterById(aId)
  const b = characterById(bId)
  if (!a || !b) return null
  return runBattle(a, b)
}

export function makeMissions(input: { persona: string; difficulty: 1 | 2 | 3 }): GeneratedMission[] {
  return generateMissions(input)
}

export function makeTrivia(n: number): TriviaQuestion[] {
  return generateTrivia(n)
}

export function makeSuit(o: SuitOptions): SuitResult {
  return generateSuit(o)
}

export function makeCover(o: CoverOptions): CoverResult {
  return generateCover(o)
}
