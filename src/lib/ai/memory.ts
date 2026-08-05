import { useGame } from '../gamification/game'

interface UserProfile {
  name: string
  favoriteCharacter: string
  interests: string[]
  firstSeen: number
}

const KEY = 'arachnid-profile-v1'
const SESSION_KEY = 'arachnid-session-v1'

export function getProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as UserProfile
  } catch {
    /* ignore */
  }
  return { name: 'Visitor', favoriteCharacter: '', interests: [], firstSeen: Date.now() }
}

export function setProfile(patch: Partial<UserProfile>): UserProfile {
  const next = { ...getProfile(), ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  return next
}

interface SessionInfo {
  chats: number
  stories: number
  battles: number
  lastTopics: string[]
  lastSummary: string
}

export function getSession(): SessionInfo {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw) as SessionInfo
  } catch {
    /* ignore */
  }
  return { chats: 0, stories: 0, battles: 0, lastTopics: [], lastSummary: '' }
}

export function touchSession(patch: Partial<SessionInfo>): void {
  const next = { ...getSession(), ...patch }
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

/**
 * Build a compact personalization block that shapes both demo answers
 * and real-LLM prompts from player stats and preferences.
 */
export function buildUserContext(): string {
  const p = getProfile()
  const g = useGame.getState()
  return [
    `Player name: ${p.name || 'Visitor'}`,
    p.favoriteCharacter ? `Favorite character: ${p.favoriteCharacter}` : '',
    `Total XP: ${g.xp} · Unlocked achievements: ${g.unlocked.length}`,
    g.suits.length ? `Designed suits: ${g.suits.length}` : '',
    `Stats: ${g.stats.chats} chats, ${g.stats.stories} stories, ${g.stats.battles} battles`,
  ]
    .filter(Boolean)
    .join('\n')
}
