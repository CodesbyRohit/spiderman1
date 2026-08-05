import { useEffect } from 'react'
import { useApp } from '../lib/state/app'
import { useGame } from '../lib/gamification/game'
import { engine } from '../lib/audio/engine'

const SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

/** The Konami code unlocks 8-BIT ARCHIVE mode. */
export function useKonami() {
  useEffect(() => {
    let pos = 0
    const onKey = (e: KeyboardEvent) => {
      if (e.key.length === 1) e = e as KeyboardEvent
      if ((e.key === 'b' || e.key === 'a') && (e.target as HTMLElement)?.tagName === 'INPUT') return
      const expected = SEQUENCE[pos]
      if (e.key.toLowerCase() === expected.toLowerCase()) {
        pos += 1
        if (pos === SEQUENCE.length) {
          pos = 0
          const app = useApp.getState()
          app.toggleRetro()
          useGame.getState().award('konami')
          engine.portal()
          engine.uiOpen()
        }
      } else {
        pos = e.key === SEQUENCE[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
