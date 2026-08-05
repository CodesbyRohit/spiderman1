/**
 * Typed access to environment configuration.
 *
 * The app is designed to run in two modes:
 *  - DEMO MODE:  no keys -> local Lore Engine (works on GitHub Pages)
 *  - AI MODE:    keys present -> real LLM providers with RAG + streaming
 */

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback
  return value === 'true' || value === '1'
}

export const env = {
  /** auto | openai | anthropic | gemini */
  aiProvider: (import.meta.env.VITE_AI_PROVIDER as string | undefined) ?? 'auto',
  aiModel: (import.meta.env.VITE_AI_MODEL as string | undefined) ?? '',

  openaiKey: (import.meta.env.VITE_OPENAI_API_KEY as string | undefined) ?? '',
  openaiModel: (import.meta.env.VITE_OPENAI_MODEL as string | undefined) ?? 'gpt-4o',

  anthropicKey: (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined) ?? '',
  anthropicModel: (import.meta.env.VITE_ANTHROPIC_MODEL as string | undefined) ?? 'claude-sonnet-4-20250514',

  geminiKey: (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? '',
  geminiModel: (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? 'gemini-2.0-flash',

  githubToken: (import.meta.env.VITE_GITHUB_TOKEN as string | undefined) ?? '',
  githubRepo: (import.meta.env.VITE_GITHUB_REPO as string | undefined) ?? 'CodesbyRohit/spiderman1',

  voiceEnabled: bool(import.meta.env.VITE_ENABLE_VOICE, true),
  soundDefault: bool(import.meta.env.VITE_ENABLE_SOUND_DEFAULT, true),

  /** true when at least one provider key is configured -> AI mode. */
  get aiMode(): boolean {
    return this.openaiKey !== '' || this.anthropicKey !== '' || this.geminiKey !== ''
  },
} as const

export type AiMode = 'demo' | 'ai'

export function aiMode(): AiMode {
  return env.aiMode ? 'ai' : 'demo'
}
