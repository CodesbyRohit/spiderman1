import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ParticleKind } from './chapters'
import { useReducedMotion } from '../../lib/hooks/core'

interface Props {
  kind: ParticleKind
  accent: string
}

const CONFIG: Record<ParticleKind, { count: number; size: [number, number]; duration: [number, number]; behavior: 'rise' | 'fall' | 'drift' | 'orbit' }> = {
  motes: { count: 16, size: [2, 4], duration: [7, 13], behavior: 'drift' },
  sparks: { count: 20, size: [2, 5], duration: [2.5, 5], behavior: 'rise' },
  embers: { count: 14, size: [3, 6], duration: [4, 8], behavior: 'fall' },
  circuit: { count: 18, size: [1, 3], duration: [3, 7], behavior: 'drift' },
  portal: { count: 24, size: [2, 6], duration: [2, 4], behavior: 'orbit' },
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

/** Lightweight ambient particle layer unique to each chapter. */
export default function ChapterParticles({ kind, accent }: Props) {
  const reduced = useReducedMotion()
  const cfg = CONFIG[kind]

  const items = useMemo(
    () =>
      Array.from({ length: cfg.count }, (_, i) => ({
        id: i,
        left: rand(0, 100),
        top: rand(0, 100),
        size: rand(cfg.size[0], cfg.size[1]),
        dur: rand(cfg.duration[0], cfg.duration[1]),
        delay: rand(0, 3),
        driftX: rand(-60, 60),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind],
  )

  if (reduced) return null

  const behaviors = {
    rise: { y: [-14, -140], opacity: [0, 0.9, 0] },
    fall: { y: [-40, 120], opacity: [0, 0.9, 0] },
    drift: { x: [-20, 60], y: [-30, 30], opacity: [0, 0.7, 0] },
    orbit: { scale: [0, 1, 0], x: [-30, 30], y: [-30, 30], opacity: [0, 0.9, 0] },
  }[cfg.behavior]

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, background: accent, boxShadow: `0 0 12px ${accent}` }}
          animate={behaviors}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
