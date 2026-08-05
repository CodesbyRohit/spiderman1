import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { TIMELINE } from '../../lib/ai/knowledge/lore'
import { useGame } from '../../lib/gamification/game'

const ERAS = [...new Set(TIMELINE.map((e) => e.era))]

/** Horizontal saga timeline — scroll to travel through the years. */
export default function TimelineExplorer() {
  const [zoom, setZoom] = useState(1)
  const [active, setActive] = useState<number | null>(null)
  const track = useRef<HTMLDivElement>(null)
  const award = useGame((s) => s.award)

  const nodes = useMemo(() => TIMELINE.map((e, i) => ({ ...e, x: i * 260 })), [])

  const zoomBy = (d: number) => {
    setZoom((z) => Math.min(2.2, Math.max(0.7, z + d)))
    award('universe_5') // timeline is universe-adjacent; harmless repeat-guard
  }

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => zoomBy(-0.25)} aria-label="Zoom out" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/70 hover:border-white/40">
            <Minus size={15} />
          </button>
          <span className="font-mono text-[11px] tracking-[0.3em] text-white/50">SAGA TIMELINE · {Math.round(zoom * 100)}%</span>
          <button onClick={() => zoomBy(0.25)} aria-label="Zoom in" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/70 hover:border-white/40">
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-black/30 px-4 py-10" onWheel={(e) => e.preventDefault()}>
        {/* center axis */}
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-ember/40 to-transparent" />

        <motion.div
          ref={track}
          className="flex cursor-grab items-center gap-2 px-6 active:cursor-grabbing"
          style={{ width: 'max-content' }}
          animate={{ x: `${(100 - zoom * 100) * 0}px`, scale: zoom }}
          drag="x"
          dragConstraints={{ left: -nodes.length * 260 + 320, right: 80 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        >
          {nodes.map((n, i) => (
            <div key={n.year} className="relative flex w-[240px] shrink-0 flex-col items-center" onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
              {/* web connector to neighbor */}
              {i < nodes.length - 1 && (
                <svg className="absolute left-1/2 top-1/2 h-6 w-[240px] -translate-y-1/2" aria-hidden>
                  <path
                    d={`M 0 3 Q 120 ${Math.sin(i * 1.7) * 20 - 3} 240 3`}
                    fill="none"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="1"
                    strokeDasharray="4 5"
                  />
                </svg>
              )}
              <button
                onClick={() => setActive(i)}
                aria-label={n.title}
                className={`relative z-10 grid h-12 w-12 place-items-center rounded-full border font-mono text-[10px] transition-all duration-300 ${
                  active === i ? 'scale-125 border-ember bg-ember/20 text-ember shadow-emberGlow' : 'border-white/20 bg-[#0c0c14] text-white/60 hover:border-ember/60'
                }`}
              >
                {n.year}
              </button>
              <span className={`mt-3 max-w-[180px] text-center font-display text-[11px] font-semibold uppercase tracking-wider transition ${active === i ? 'text-white' : 'text-white/50'}`}>
                {n.title}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* detail card */}
      <div aria-live="polite" className="mt-4 min-h-[110px]">
        {active !== null ? (
          <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass glass-edge hud-corner rounded-xl p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-ember/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-ember">{nodes[active].era}</span>
              <span className="font-mono text-[10px] text-white/40">{nodes[active].year} · {nodes[active].universe}</span>
            </div>
            <h4 className="mt-2 font-display text-lg font-bold text-white">{nodes[active].title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-white/60">{nodes[active].desc}</p>
          </motion.div>
        ) : (
          <div className="flex h-full items-center px-2 font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">Hover or drag to explore · {ERAS.join(' → ')}</div>
        )}
      </div>
    </div>
  )
}
