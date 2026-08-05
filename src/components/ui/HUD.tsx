import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Volume2, VolumeX, Settings, Trophy, FlaskConical, X } from 'lucide-react'
import { engine } from '../../lib/audio/engine'
import { useApp } from '../../lib/state/app'
import { levelFromXp, levelTitle } from '../../lib/gamification/achievements'
import { useGame } from '../../lib/gamification/game'
import { scrollApi } from '../../lib/scrollApi'
import { useMediaQuery } from '../../lib/hooks/core'

const NAV = [
  { label: 'Home', target: '#top' },
  { label: 'Story', target: '#story' },
  { label: 'World', target: '#world' },
  { label: 'Stats', target: '#stats' },
]

export default function HUD() {
  const booted = useApp((s) => s.booted)
  const soundOn = useApp((s) => s.soundOn)
  const setSound = useApp((s) => s.setSound)
  const setSettingsOpen = useApp((s) => s.setSettingsOpen)
  const setGameOpen = useApp((s) => s.setGameOpen)
  const setLabOpen = useApp((s) => s.setLabOpen)
  const retro = useApp((s) => s.retro)

  const { xp, unlocked } = useGame()
  const { level, progress } = levelFromXp(xp)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hint, setHint] = useState(false)
  const desktop = useMediaQuery('(min-width: 768px)')

  // Show the spider-sense hint once, briefly, after boot.
  useEffect(() => {
    if (!booted) return
    const t = window.setTimeout(() => setHint(true), 2600)
    const t2 = window.setTimeout(() => setHint(false), 8600)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(t2)
    }
  }, [booted])

  const toggleSound = () => {
    const next = !soundOn
    setSound(next)
    engine.setEnabled(next)
  }

  const navTo = (target: string) => {
    setMenuOpen(false)
    scrollApi.scrollTo(target, { offset: -72 })
  }

  const navItems = (
    <>
      {NAV.map((n) => (
        <button key={n.label} onClick={() => navTo(n.target)} className="nav-btn relative px-1 py-1 font-mono text-[11px] uppercase tracking-[0.25em] text-white/60 transition hover:text-white">
          {n.label}
        </button>
      ))}
      <button
        onClick={() => {
          setMenuOpen(false)
          setLabOpen(true)
        }}
        className="flex items-center gap-1.5 rounded-lg border border-ember/40 bg-ember/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ember transition hover:bg-ember/20"
      >
        <FlaskConical size={13} /> Lab
      </button>
    </>
  )

  return (
    <>
      <AnimatePresence>
        {booted && (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="fixed inset-x-0 top-0 z-[100]"
          >
            <div className="glass-edge mx-auto mt-3 flex max-w-7xl items-center justify-between gap-3 rounded-2xl px-4 py-2.5 md:mx-4 md:px-5 lg:mx-auto">
              <button onClick={() => navTo('#top')} className="flex items-center gap-2.5" aria-label="Back to top">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-crimson to-ember text-[13px] font-black text-white shadow-emberGlow">
                  A
                </span>
                <span className="font-display text-sm font-bold tracking-[0.25em] text-white">
                  ARACHNID<span className="text-ember">.</span>
                </span>
              </button>

              {desktop && <nav className="flex items-center gap-5">{navItems}</nav>}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleSound}
                  aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:border-ember/50 hover:text-ember"
                >
                  {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => setGameOpen(true)}
                  aria-label="Achievements"
                  className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:border-amber-400/50 hover:text-amber-300"
                >
                  <Trophy size={16} />
                  {unlocked.length > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ember px-1 font-mono text-[9px] font-bold text-white">
                      {unlocked.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Settings"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:border-electric/60 hover:text-blue-300"
                >
                  <Settings size={16} />
                </button>
                {!desktop && (
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Menu"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/70"
                  >
                    {menuOpen ? <X size={16} /> : <Menu size={16} />}
                  </button>
                )}
              </div>
            </div>

            {/* mobile menu */}
            <AnimatePresence>
              {menuOpen && !desktop && (
                <motion.nav
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="glass-strong mx-4 mt-2 flex flex-col gap-1 rounded-2xl p-3"
                >
                  {navItems}
                </motion.nav>
              )}
            </AnimatePresence>
          </motion.header>
        )}
      </AnimatePresence>

      {/* XP strip */}
      <AnimatePresence>
        {booted && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="fixed bottom-4 left-4 z-[100] hidden w-56 md:block"
          >
            <button onClick={() => setGameOpen(true)} className="glass glass-edge hud-corner block w-full rounded-xl p-3 text-left">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/60">
                <span>LV {level} · {levelTitle(level)}</span>
                <span>{xp} XP</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-crimson to-electric"
                  animate={{ width: `${Math.max(3, progress * 100)}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* spider-sense hint chip */}
      <AnimatePresence>
        {hint && !retro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.6 }}
            className="fixed bottom-5 right-5 z-[100] hidden md:block"
          >
            <button
              onClick={() => useApp.getState().triggerSense()}
              className="glass-edge glass rounded-xl px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:text-ember"
            >
              <span className="text-ember">X</span> · Spider-Sense
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
