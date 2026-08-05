import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { useApp } from '../../lib/state/app'
import { useGame } from '../../lib/gamification/game'
import { useMousePosition, useReducedMotion } from '../../lib/hooks/core'
import { scrollApi } from '../../lib/scrollApi'
import { UNIVERSES } from '../../lib/ai/knowledge/lore'
import GlassButton from '../ui/GlassButton'
import HeroFallback from './HeroFallback'

const HeroScene = lazy(() => import('./HeroScene'))

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const TITLE_LINES = ['WEB', 'GUARDIAN']

/** The cinematic hero — 3D city stage + branded overlay. */
export default function Hero() {
  const booted = useApp((s) => s.booted)
  const tod = useApp((s) => s.tod)
  const quality = useApp((s) => s.quality)
  const setLabOpen = useApp((s) => s.setLabOpen)
  const { xp, unlocked } = useGame()
  const reduced = useReducedMotion()
  const mouse = useMousePosition()

  const [gl] = useState(hasWebGL)
  const [inView, setInView] = useState(true)
  const ref = useRef<HTMLElement>(null)
  const use3D = gl && quality === 'high'

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const overlayParallax = useMemo(
    () => ({
      x: reduced ? 0 : -mouse.nx * 14,
      y: reduced ? 0 : -mouse.ny * 10,
    }),
    [mouse.nx, mouse.ny, reduced],
  )

  return (
    <section ref={ref} id="top" aria-label="Hero" className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Stage */}
      <div className="absolute inset-0">
        {use3D ? (
          <Suspense fallback={<div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_60%,#120a16_0%,#050508_60%)]" />}>
            <HeroScene tod={tod} quality={quality} active={booted && inView} reducedMotion={reduced} />
          </Suspense>
        ) : (
          <HeroFallback tod={tod} reducedMotion={reduced} />
        )}
        {/* cinematic bottom fade into the page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050508] to-transparent" />
      </div>

      {/* Overlay copy */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-28 md:px-8"
        animate={{ x: overlayParallax.x, y: overlayParallax.y }}
        transition={{ type: 'spring', stiffness: 60, damping: 20 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={booted ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 flex items-center gap-3"
        >
          <span className="h-px w-10 bg-gradient-to-r from-ember to-transparent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.45em] text-white/60">
            The Spider-Verse-inspired AI Experience
          </span>
        </motion.div>

        <h1 className="font-display text-[clamp(2.6rem,9vw,7.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
          {TITLE_LINES.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                className={i === 1 ? 'grad-text block' : 'block text-white'}
                initial={{ y: '110%' }}
                animate={booted ? { y: 0 } : {}}
                transition={{ delay: 1.05 + i * 0.14, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={booted ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-white/65 md:text-lg"
        >
          A fully original, arachnid-inspired universe. A living 3D city with dynamic weather, a five-chapter
          scroll story, and an AI that dreams in silk.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={booted ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.7, duration: 0.8 }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <GlassButton size="lg" onClick={() => scrollApi.scrollTo('#story', { offset: -60 })}>
            <Sparkles size={16} /> Begin the Story
          </GlassButton>
          <GlassButton variant="glass" size="lg" onClick={() => setLabOpen(true)}>
            Open the AI Lab
          </GlassButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={booted ? { opacity: 1 } : {}}
          transition={{ delay: 2, duration: 1 }}
          className="mt-10 flex flex-wrap gap-x-10 gap-y-3 font-mono text-[11px] uppercase tracking-[0.25em] text-white/45"
        >
          <span>{UNIVERSES.length} universes</span>
          <span>{unlocked.length} achievements</span>
          <span>{xp} XP</span>
          <span className="text-ember/80">press X — spider-sense</span>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={booted ? { opacity: 1 } : {}}
        transition={{ delay: 2.4, duration: 1 }}
        onClick={() => scrollApi.scrollTo('#story', { offset: -60 })}
        aria-label="Scroll to story"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/40 transition hover:text-white"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
          <ChevronDown size={26} />
        </motion.div>
      </motion.button>
    </section>
  )
}
