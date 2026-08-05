export interface StreamHandle {
  cancel: () => void
  done: Promise<void>
}

/**
 * Simulated token streaming for Demo Mode — splits text into word-ish
 * chunks and emits them with a natural variable cadence.
 */
export function simulateStream(
  full: string,
  onToken: (chunk: string) => void,
  opts: { cps?: number; jitter?: number; onDone?: () => void } = {},
): StreamHandle {
  const { cps = 28, jitter = 0.7, onDone } = opts
  const tokens = full.match(/\S+\s*/g) ?? [full]
  let i = 0
  let cancelled = false

  let resolve!: () => void
  const done = new Promise<void>((r) => (resolve = r))
  let timer: number | null = null

  const step = () => {
    if (cancelled) return resolve()
    if (i >= tokens.length) {
      onDone?.()
      return resolve()
    }
    onToken(tokens[i])
    i++
    const delay = (1000 / cps) * tokens[i - 1]!.length * (0.6 + Math.random() * jitter)
    timer = window.setTimeout(step, Math.min(120, delay))
  }
  timer = window.setTimeout(step, 60)

  return {
    cancel: () => {
      cancelled = true
      if (timer !== null) window.clearTimeout(timer)
      resolve()
    },
    done,
  }
}

/** Simple deterministic pseudo-random generator (mulberry32) for seeded output. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
