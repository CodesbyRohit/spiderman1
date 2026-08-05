import { useReducedMotion } from '../../lib/hooks/core'

/** Fixed film-grain overlay for the cinematic feel. aria-hidden, no layout cost. */
export default function Grain() {
  const reduced = useReducedMotion()
  if (reduced) return null
  return (
    <>
      <div className="grain" aria-hidden />
      <div className="scanlines pointer-events-none fixed inset-0 z-[94]" aria-hidden />
    </>
  )
}
