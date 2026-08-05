import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export interface LenisHandle {
  lenis: Lenis | null
  scrollTo: (target: string | number | HTMLElement, opts?: { offset?: number; duration?: number }) => void
  lock: (locked: boolean) => void
}

/**
 * Sets up Lenis buttery-smooth scrolling for the whole document.
 * - Disabled smoothing when the user prefers reduced motion.
 * - `lock(true)` freezes scrolling while overlays are open.
 */
export function useLenis(reducedMotion: boolean): LenisHandle {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (reducedMotion) return
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    })
    lenisRef.current = lenis

    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reducedMotion])

  const scrollTo = (target: string | number | HTMLElement, opts?: { offset?: number; duration?: number }) => {
    const lenis = lenisRef.current
    if (lenis) {
      lenis.scrollTo(target, { offset: opts?.offset ?? 0, duration: opts?.duration ?? 1.4 })
    } else if (typeof target === 'string') {
      const el = document.querySelector(target)
      el?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: reducedMotion ? 'auto' : 'smooth' })
    }
  }

  const lock = (locked: boolean) => {
    const lenis = lenisRef.current
    if (!lenis) return
    if (locked) lenis.stop()
    else lenis.start()
  }

  return { lenis: lenisRef.current, scrollTo, lock }
}
