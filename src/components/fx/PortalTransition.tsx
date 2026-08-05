import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { engine } from '../../lib/audio/engine'
import { useApp } from '../../lib/state/app'

/**
 * Watches the overlay flags and plays a portal vortex flash on each open/close.
 * The origin is the center of the viewport — the "spider enters the web".
 */
export default function PortalTransition() {
  const labOpen = useApp((s) => s.labOpen)
  const gameOpen = useApp((s) => s.gameOpen)
  const statsOpen = useApp((s) => s.statsOpen)
  const settingsOpen = useApp((s) => s.settingsOpen)
  const dev = useApp((s) => s.dev)
  const soundOn = useApp((s) => s.soundOn)

  const [flash, setFlash] = useState(0)
  const open = labOpen || gameOpen || statsOpen || settingsOpen || dev

  useEffect(() => {
    if (open) {
      setFlash((f) => f + 1)
      if (soundOn) engine.portal()
    }
  }, [open, soundOn])

  return (
    <AnimatePresence>
      {flash > 0 && (
        <motion.div
          key={flash}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[99] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="h-[160vmax] w-[160vmax] rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(255,59,59,0.14) 40deg, transparent 90deg, rgba(47,107,255,0.14) 160deg, transparent 220deg, rgba(255,59,59,0.1) 300deg, transparent 360deg)',
            }}
            initial={{ scale: 0.05, rotate: 0, opacity: 0.9 }}
            animate={{ scale: 1.1, rotate: 360 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
