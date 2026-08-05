import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { engine } from '../../lib/audio/engine'
import { useApp } from '../../lib/state/app'

/** Danger-mode overlay + heartbeat loop while Spider-Sense is active. */
export default function SpiderSenseOverlay() {
  const spiderSense = useApp((s) => s.spiderSense)
  const soundOn = useApp((s) => s.soundOn)

  useEffect(() => {
    if (spiderSense && soundOn) {
      engine.startHeartbeat()
      engine.alert()
    } else {
      engine.stopHeartbeat()
    }
    return () => engine.stopHeartbeat()
  }, [spiderSense, soundOn])

  useEffect(() => {
    document.body.classList.toggle('shake-hard', spiderSense)
    return () => document.body.classList.remove('shake-hard')
  }, [spiderSense])

  return (
    <AnimatePresence>
      {spiderSense && (
        <>
          <div className="danger-tint" aria-hidden />
          <div className="danger-vignette" aria-hidden />
          <motion.div
            role="alert"
            className="pointer-events-none fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
          >
            <div className="font-mono text-xs uppercase tracking-[0.5em] text-red-400">⚠ Danger</div>
            <div className="font-display neon-red mt-1 text-4xl font-extrabold tracking-widest md:text-6xl">SPIDER-SENSE</div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.4em] text-white/50">Precognitive reflex engaged · 6.5s</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
