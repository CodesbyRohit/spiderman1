import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { engine } from '../../lib/audio/engine'
import { useApp } from '../../lib/state/app'

interface Strand {
  id: number
  angle: number
  length: number
}

const STRAND_COUNT = 14

/** Radial web-burst that fires on every pointer down. Pure DOM, GPU-cheap. */
export default function WebShoot() {
  const [strands, setStrands] = useState<Strand[]>([])
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const seq = useRef(0)
  const soundOn = useApp((s) => s.soundOn)

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input, textarea, [contenteditable]')) return
      const burst: Strand[] = []
      for (let i = 0; i < STRAND_COUNT; i++) {
        burst.push({ id: seq.current * 100 + i, angle: (i / STRAND_COUNT) * Math.PI * 2 + Math.random() * 0.25, length: 70 + Math.random() * 90 })
      }
      seq.current += 1
      setOrigin({ x: e.clientX, y: e.clientY })
      setStrands(burst)
      if (soundOn) engine.webShoot()
      window.setTimeout(() => setStrands([]), 750)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [soundOn])

  return (
    <AnimatePresence>
      {strands.length > 0 && (
        <motion.div key={strands[0]?.id} aria-hidden className="pointer-events-none fixed inset-0 z-[118]">
          <div className="web-burst" style={{ left: origin.x, top: origin.y, width: 46, height: 46, transform: 'translate(-50%,-50%)' }} />
          {strands.map((s) => (
            <motion.div
              key={s.id}
              className="web-line"
              initial={{ left: origin.x, top: origin.y, width: 0, rotate: s.angle }}
              animate={{ width: s.length, opacity: [0.9, 0.35, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: (s.id % 7) * 0.02 }}
              style={{ left: origin.x, top: origin.y, transform: `rotate(${s.angle}rad)` }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
