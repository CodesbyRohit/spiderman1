import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { engine } from '../../lib/audio/engine'
import { useApp } from '../../lib/state/app'
import { useGame } from '../../lib/gamification/game'
import GlassButton from './GlassButton'

function WebMark({ size = 220 }: { size?: number }) {
  const spokes = 12
  const rings = 5
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden className="drop-shadow-[0_0_30px_rgba(255,59,59,0.25)]">
      {Array.from({ length: spokes }).map((_, i) => {
        const angle = (i / spokes) * 360
        return (
          <motion.line
            key={`s${i}`}
            x1="100"
            y1="100"
            x2={100 + 96 * Math.cos((angle * Math.PI) / 180)}
            y2={100 + 96 * Math.sin((angle * Math.PI) / 180)}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.8"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: i * 0.05, ease: 'easeOut' }}
          />
        )
      })}
      {Array.from({ length: rings }).map((_, r) => (
        <motion.circle
          key={`r${r}`}
          cx="100"
          cy="100"
          r={20 + r * 19}
          stroke="rgba(255,59,59,0.5)"
          strokeWidth="0.9"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.25 + r * 0.15, ease: 'easeOut' }}
        />
      ))}
      <motion.circle
        cx="100"
        cy="100"
        r="10"
        fill="#ff3b3b"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.6, delay: 1 }}
      />
    </svg>
  )
}

/** Full-screen boot gate. Clicking ENTER starts audio and fades into the experience. */
export default function LoadingScreen() {
  const booted = useApp((s) => s.booted)
  const boot = useApp((s) => s.boot)
  const soundOn = useApp((s) => s.soundOn)
  const [progress, setProgress] = useState(0)
  const raf = useRef(0)

  // Simulated asset-progress while the first paint settles.
  useEffect(() => {
    let p = 0
    const tick = () => {
      p = Math.min(100, p + (100 - p) * 0.012 + 0.4)
      setProgress(p)
      if (p < 100) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !booted) enter()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted])

  const enter = () => {
    if (booted) return
    // Audio is best-effort: Web Audio init must never block entry into the app.
    try {
      engine.start()
      if (!soundOn) engine.setEnabled(false)
    } catch {
      /* audio unavailable — proceed silently */
    }
    // Gamification is best-effort: a storage/achievement failure must not trap the user.
    try {
      const g = useGame.getState()
      if (!g.bootedOnce) {
        g.award('first_visit')
        useGame.setState({ bootedOnce: true })
      }
    } catch {
      /* persistence unavailable — proceed */
    }
    // Always finish the boot: leaving the loading screen is non-negotiable.
    boot()
  }

  return (
    <AnimatePresence>
      {!booted && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 px-6"
          style={{ background: 'radial-gradient(1200px 700px at 50% 40%, #160a12 0%, #050508 60%)' }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <WebMark />
          <div className="text-center">
            <motion.h1
              className="font-display text-4xl font-extrabold tracking-[0.3em] text-white md:text-6xl"
              initial={{ opacity: 0, letterSpacing: '0.8em' }}
              animate={{ opacity: 1, letterSpacing: '0.3em' }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            >
              ARACHNID
            </motion.h1>
            <motion.p
              className="mt-3 font-mono text-[11px] uppercase tracking-[0.55em] text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
            >
              The Web Guardian · AI Experience
            </motion.p>
          </div>

          <div className="w-[min(320px,70vw)]">
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-crimson via-ember to-electric transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-white/40">
              <span>Calibrating spider-sense</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <GlassButton size="lg" onClick={enter}>
              Enter the Web
            </GlassButton>
          </motion.div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/30">or press ENTER · headphones recommended</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
