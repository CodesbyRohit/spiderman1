export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface Citation {
  title: string
  source?: string
  score: number
}

export interface ChatReply {
  text: string
  citations: Citation[]
  mode: 'demo' | 'ai'
}

export interface StoryInput {
  villain: string
  city: string
  power: string
  emotion: string
}

export interface StoryResult {
  title: string
  chapters: string[]
  twist: string
}

export interface SuitOptions {
  base: string
  accent: string
  visor: string
  tech: number // 0..100
  stealth: boolean
  power: number // 0..100
  webType: 'web-shooters' | 'organic' | 'nano' | 'energy'
}

export interface SuitResult {
  name: string
  mark: number // 0..100
  description: string
  specs: { label: string; value: string }[]
}

export interface CoverOptions {
  hero: string
  palette: string[]
  mood: string
  style: 'classic' | 'modern' | 'neon' | 'minimal'
}

export interface CoverResult {
  title: string
  seed: number
  palette: string[]
  mood: string
  style: string
}

export interface BattleResult {
  a: { name: string; score: number }
  b: { name: string; score: number }
  rounds: { a: number; b: number }[]
  winner: 'a' | 'b' | 'draw'
  winProbA: number
  narration: string[]
}

export interface MissionInput {
  persona: string
  difficulty: 1 | 2 | 3
}

export interface TriviaQuestion {
  q: string
  options: string[]
  answer: number
  fact: string
}

export interface GeneratedMission {
  id: string
  title: string
  desc: string
  reward: number
}
