import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useMediaQuery } from '../../lib/hooks/core'

/** A morphing dot + ring cursor. Disabled automatically on coarse pointers. */
export default function Cursor() {
  const coarse = useMediaQuery('(pointer: coarse)')
  const [hovering, setHovering] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [visible, setVisible] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.6 })
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.6 })

  useEffect(() => {
    if (coarse) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const target = (e.target as HTMLElement)?.closest?.('a, button, [data-magnetic], input, textarea, select, [role="button"]')
      setHovering(Boolean(target))
    }
    const down = () => setPressed(true)
    const up = () => setPressed(false)
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [coarse, x, y])

  if (coarse) return null

  return (
    <>
      {/* core dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120] h-2 w-2 rounded-full bg-white mix-blend-difference"
        style={{ x, y, translateX: '-50%', translateY: '-50%', opacity: visible ? 1 : 0 }}
        animate={{ scale: pressed ? 0.5 : 1 }}
        transition={{ duration: 0.15 }}
      />
      {/* spring ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[119] rounded-full border border-white/70 mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%', opacity: visible ? 1 : 0 }}
        animate={{
          width: hovering ? 44 : 28,
          height: hovering ? 44 : 28,
          scale: pressed ? 0.7 : 1,
          borderColor: hovering ? 'rgba(255,59,59,0.9)' : 'rgba(255,255,255,0.7)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      />
    </>
  )
}
