import { useApp } from '../lib/state/app'
import { useGame } from '../lib/gamification/game'
import { ACHIEVEMENTS } from '../lib/gamification/achievements'
import { engine } from '../lib/audio/engine'
import { mode } from '../lib/ai/engine'
import { APP } from '../lib/constants'

const ART = `
   ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄       ▄▄  ▄▄▄▄▄▄▄▄▄▄▄
  ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░▌     ▐░░▌▐░░░░░░░░░░░▌
  ▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀█░▌▐░▌       ▐░▌▐░█▀▀▀▀▀▀▀▀▀
  ▐░▌       ▐░▌▐░▌       ▐░▌▐░▌          ▐░▌       ▐░▌▐░▌       ▐░▌▐░▌
  ▐░█▄▄▄▄▄▄▄█░▌▐░█▄▄▄▄▄▄▄█░▌▐░█▄▄▄▄▄▄▄▄▄ ▐░█▄▄▄▄▄▄▄█░▌▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄▄▄
  ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░▌       ▐░▌▐░░░░░░░░░░░▌
   ▀▀▀▀▀▀█░█▀▀ ▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀█░▌▐░▌       ▐░▌ ▀▀▀▀▀▀▀▀▀█░▌
        ▐░▌    ▐░▌       ▐░▌▐░▌          ▐░▌       ▐░▌▐░▌       ▐░▌         ▐░▌
  ▄▄▄▄▄█░▌    ▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄▄▄ ▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄█░▌ ▄▄▄▄▄▄▄▄▄█░▌
  ▐░░░░░░░▌    ▐░▌       ▐░▌▐░░░░░░░░░░░▌▐░▌       ▐░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌
   ▀▀▀▀▀▀▀      ▀         ▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀         ▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀
`

/**
 * Installs the console easter eggs once, after boot.
 * Try: arachnid.help()
 */
export function installConsoleSurprises(): void {
  const w = window as unknown as Record<string, unknown>
  if (w.arachnid) return

  const arachnid = {
    help: () => {
      console.log(
        `%c${ART}%c\n\nWelcome to ${APP.full}.\n\nCommands:\n  arachnid.sense()     trigger spider-sense\n  arachnid.dev()       open developer mode\n  arachnid.stats()     player statistics\n  arachnid.mode()      intelligence mode\n  arachnid.unlock()    unlock every achievement\n  arachnid.suit()      roll a random suit\n  arachnid.theme()     cycle time of day`,
        'color:#ff3b3b;font-weight:bold',
        'color:#888',
      )
      useGame.getState().award('console_lore')
    },
    sense: () => useApp.getState().triggerSense(),
    dev: () => useApp.getState().setDev(true),
    stats: () => console.table(useGame.getState().stats),
    mode: () => console.log(`Intelligence mode: ${mode().toUpperCase()}`, mode() === 'ai' ? '— live LLM connected 🟢' : '— local Lore Engine 🕸️'),
    unlock: () => {
      ACHIEVEMENTS.forEach((a) => useGame.getState().award(a.id, true))
      console.log('%cAll achievements unlocked. The web acknowledges you.', 'color:#7b2ff7;font-weight:bold')
      engine.achievement()
    },
    suit: () => {
      const prefixes = ['NANO', 'GHOST', 'VOLT', 'OMNI', 'ARC']
      const suffixes = ['WEAVE', 'SHIFT', 'LOOM', 'PULSE', 'STRAND']
      console.log(`%cDesigned: ${prefixes[Math.floor(Math.random() * prefixes.length)]}-${suffixes[Math.floor(Math.random() * suffixes.length)]} MK-${1 + Math.floor(Math.random() * 9)}`, 'color:#ffb020;font-weight:bold')
    },
    theme: () => useApp.getState().cycleTod(),
  }

  w.arachnid = arachnid
  console.log(
    `%c${ART}%c\n%cThe web is alive. Type %carachnid.help()%c for secrets.`,
    'color:#ff3b3b;font-weight:bold',
    'color:#888',
    'color:#2f6bff;font-weight:bold',
    'color:#fff;font-weight:bold',
    'color:#888',
  )
}
