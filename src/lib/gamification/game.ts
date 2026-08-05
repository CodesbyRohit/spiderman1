import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ACHIEVEMENTS, levelFromXp } from './achievements'

export interface SuitCard {
  id: string
  name: string
  colors: string[]
  tech: number
  stealth: boolean
  power: number
  webType: string
  createdAt: number
}

export interface CoverCard {
  id: string
  title: string
  palette: string[]
  seed: number
  createdAt: number
}

export interface Mission {
  id: string
  title: string
  desc: string
  stat: keyof GameStats
  target: number
  xp: number
  icon: string
}

export interface GameStats {
  chapters: number
  chats: number
  stories: number
  suits: number
  covers: number
  battles: number
  skills: number
  universes: number
  missions: number
  senses: number
  voiceUses: number
}

const ZERO_STATS: GameStats = {
  chapters: 0,
  chats: 0,
  stories: 0,
  suits: 0,
  covers: 0,
  battles: 0,
  skills: 0,
  universes: 0,
  missions: 0,
  senses: 0,
  voiceUses: 0,
}

const MISSION_POOL: Omit<Mission, 'stat' | 'target'>[] = [
  { id: 'm_chat', title: 'Open a Channel', desc: 'Ask the AI assistant three questions.', icon: '💬', xp: 60 },
  { id: 'm_story', title: 'Spin a Tale', desc: 'Generate one story in the Forge.', icon: '✍️', xp: 80 },
  { id: 'm_suit', title: 'Designer Genes', desc: 'Forge a custom suit.', icon: '🧵', xp: 80 },
  { id: 'm_cover', title: 'Front Page', desc: 'Generate one comic cover.', icon: '🎨', xp: 80 },
  { id: 'm_battle', title: 'Ring the Bell', desc: 'Run a battle simulation.', icon: '⚔️', xp: 80 },
  { id: 'm_universe', title: 'Door-to-Door', desc: 'Visit three universes on the map.', icon: '🌌', xp: 70 },
  { id: 'm_sense', title: 'Tingle', desc: 'Trigger Spider-Sense mode (X).', icon: '⚡', xp: 70 },
  { id: 'm_skill', title: 'Upgrade Path', desc: 'Unlock a skill node.', icon: '🌟', xp: 70 },
]

const MISSION_STAT: Record<string, { stat: keyof GameStats; target: number }> = {
  m_chat: { stat: 'chats', target: 3 },
  m_story: { stat: 'stories', target: 1 },
  m_suit: { stat: 'suits', target: 1 },
  m_cover: { stat: 'covers', target: 1 },
  m_battle: { stat: 'battles', target: 1 },
  m_universe: { stat: 'universes', target: 3 },
  m_sense: { stat: 'senses', target: 1 },
  m_skill: { stat: 'skills', target: 1 },
}

/** Deterministic daily mission selection so the date seeds the same set for everyone. */
function daySeed(): number {
  const now = new Date()
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000)
}

function pickMissions(): Mission[] {
  const seed = daySeed()
  const shuffled = [...MISSION_POOL].sort((a, b) => {
    const ha = (a.id.charCodeAt(1) + seed) % 17
    const hb = (b.id.charCodeAt(1) + seed) % 17
    return ha - hb
  })
  return shuffled.slice(0, 3).map((m) => ({ ...m, ...MISSION_STAT[m.id] }))
}

interface GameState {
  xp: number
  unlocked: string[]
  stats: GameStats
  suits: SuitCard[]
  covers: CoverCard[]
  missions: Mission[]
  missionDone: string[]
  missionDate: string
  bootedOnce: boolean

  addXp: (n: number, source?: string) => void
  award: (id: string, silent?: boolean) => boolean
  increment: (stat: keyof GameStats, by?: number) => void
  saveSuit: (suit: Omit<SuitCard, 'id' | 'createdAt'>) => void
  saveCover: (cover: Omit<CoverCard, 'id' | 'createdAt'>) => void
  reset: () => void
}

const todayKey = () => new Date().toISOString().slice(0, 10)

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      unlocked: [],
      stats: { ...ZERO_STATS },
      suits: [],
      covers: [],
      missions: pickMissions(),
      missionDone: [],
      missionDate: todayKey(),
      bootedOnce: false,

      addXp: (n, _source) => set((s) => ({ xp: s.xp + Math.max(0, Math.round(n)) })),

      award: (id, silent) => {
        if (get().unlocked.includes(id)) return false
        const def = ACHIEVEMENTS.find((a) => a.id === id)
        if (!def) return false
        set((s) => ({ unlocked: [...s.unlocked, id], xp: s.xp + def.xp }))
        // Surface a toast when a UI shell is mounted (imported lazily to avoid cycles).
        void import('../../components/ui/Toaster').then((m) => m.pushToast({
          title: `Achievement: ${def.title}`,
          body: def.desc,
          icon: def.icon,
          tone: 'achievement',
          silent: silent === true,
        }))
        return true
      },

      increment: (stat, by = 1) =>
        set((s) => {
          const stats = { ...s.stats, [stat]: s.stats[stat] + by }
          // Daily missions resolve against stats as they change.
          const done = new Set(s.missionDone)
          let xpGain = 0
          for (const m of s.missions) {
            if (!done.has(m.id) && stats[m.stat] >= m.target) {
              done.add(m.id)
              xpGain += m.xp
            }
          }
          return {
            stats,
            missionDone: [...done],
            missionDate: s.missionDate,
            xp: s.xp + xpGain,
          }
        }),

      saveSuit: (suit) =>
        set((s) => ({
          suits: [{ ...suit, id: crypto.randomUUID(), createdAt: Date.now() }, ...s.suits].slice(0, 24),
        })),

      saveCover: (cover) =>
        set((s) => ({
          covers: [{ ...cover, id: crypto.randomUUID(), createdAt: Date.now() }, ...s.covers].slice(0, 24),
        })),

      reset: () => set({ xp: 0, unlocked: [], stats: { ...ZERO_STATS }, suits: [], covers: [], missionDone: [] }),
    }),
    { name: 'arachnid-save-v1' },
  ),
)

/** Refresh daily missions when the date rolls over. */
export function refreshMissions() {
  const s = useGame.getState()
  if (s.missionDate !== todayKey()) {
    useGame.setState({ missions: pickMissions(), missionDone: [], missionDate: todayKey() })
  }
}

export { levelFromXp }
