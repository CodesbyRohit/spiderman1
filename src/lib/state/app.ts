import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGame } from '../gamification/game'

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'
export type Quality = 'high' | 'low'

export interface Toast {
  id: number
  title: string
  body?: string
  icon?: string
  tone: 'achievement' | 'info' | 'danger' | 'success'
  /** Suppress any associated sound when this toast fires. */
  silent?: boolean
}

interface WebShootEvent {
  seq: number
  x: number
  y: number
}

interface AppState {
  booted: boolean
  entering: boolean
  soundOn: boolean
  tod: TimeOfDay
  todAuto: boolean
  quality: Quality
  reducedMotion: boolean

  spiderSense: boolean
  retro: boolean
  dev: boolean
  labOpen: boolean
  settingsOpen: boolean
  gameOpen: boolean
  statsOpen: boolean

  toasts: Toast[]
  webShoot: WebShootEvent | null
  senseCount: number

  boot: () => void
  setReducedMotion: (v: boolean) => void
  setSound: (v: boolean) => void
  setTod: (v: TimeOfDay) => void
  setTodAuto: (v: boolean) => void
  cycleTod: () => void
  setQuality: (v: Quality) => void
  triggerSense: () => void
  endSense: () => void
  toggleRetro: () => void
  setDev: (v: boolean) => void
  setLabOpen: (v: boolean) => void
  setSettingsOpen: (v: boolean) => void
  setGameOpen: (v: boolean) => void
  setStatsOpen: (v: boolean) => void
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: number) => void
  fireWebShoot: (x: number, y: number) => void
}

let toastSeq = 1

const TOD_ORDER: TimeOfDay[] = ['night', 'dawn', 'day', 'dusk']

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      booted: false,
      entering: false,
      soundOn: true,
      tod: 'night',
      todAuto: true,
      quality: 'high',
      reducedMotion: false,

      spiderSense: false,
      retro: false,
      dev: false,
      labOpen: false,
      settingsOpen: false,
      gameOpen: false,
      statsOpen: false,

      toasts: [],
      webShoot: null,
      senseCount: 0,

      boot: () => set({ booted: true }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setSound: (v) => set({ soundOn: v }),
      setTod: (v) => set({ tod: v, todAuto: false }),
      setTodAuto: (v) => set({ todAuto: v }),
      cycleTod: () => {
        const { tod } = get()
        const next = TOD_ORDER[(TOD_ORDER.indexOf(tod) + 1) % TOD_ORDER.length]
        if (next === 'night') useGame.getState().award('night_owl')
        set({ tod: next, todAuto: false })
      },
      setQuality: (v) => set({ quality: v }),

      triggerSense: () => {
        const count = get().senseCount + 1
        set({ spiderSense: true, senseCount: count })
        useGame.getState().increment('senses')
        if (count === 1) useGame.getState().award('spider_sense')
        // Auto-resolve after a cinematic pulse.
        window.setTimeout(() => get().endSense(), 6500)
      },
      endSense: () => set({ spiderSense: false }),

      toggleRetro: () => set((s) => ({ retro: !s.retro })),
      setDev: (v) => set({ dev: v }),
      setLabOpen: (v) => set({ labOpen: v }),
      setSettingsOpen: (v) => set({ settingsOpen: v }),
      setGameOpen: (v) => set({ gameOpen: v }),
      setStatsOpen: (v) => set({ statsOpen: v }),

      pushToast: (t) => {
        const id = toastSeq++
        set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }))
        window.setTimeout(() => get().dismissToast(id), 4600)
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      fireWebShoot: (x, y) => set((s) => ({ webShoot: { seq: (s.webShoot?.seq ?? 0) + 1, x, y } })),
    }),
    {
      name: 'arachnid-settings-v1',
      partialize: (s) => ({
        soundOn: s.soundOn,
        tod: s.tod,
        todAuto: s.todAuto,
        quality: s.quality,
        retro: s.retro,
      }),
    },
  ),
)
