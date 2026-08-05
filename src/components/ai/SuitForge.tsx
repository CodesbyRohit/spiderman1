import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Wand2 } from 'lucide-react'
import { makeSuit } from '../../lib/ai/engine'
import type { SuitOptions, SuitResult } from '../../lib/ai/types'
import { useGame } from '../../lib/gamification/game'
import { engine } from '../../lib/audio/engine'

const BASE_COLORS = ['#dc143c', '#2f6bff', '#0e0e16', '#7b2ff7', '#00e5a0', '#ffb020', '#ff2fa0', '#e8e8f0']
const ACCENT_COLORS = ['#ff3b3b', '#40c4ff', '#ffffff', '#7b2ff7', '#ffb020', '#00e5a0']
const VISOR_COLORS = ['#eaf4ff', '#7bd0ff', '#ffd166', '#ff5b8a', '#00e5a0']

const WEB_TYPES: SuitOptions['webType'][] = ['web-shooters', 'organic', 'nano', 'energy']

function SuitSchematic({ o }: { o: SuitOptions }) {
  const glow = o.power / 100
  const stealthDim = o.stealth ? 0.55 : 1
  return (
    <svg viewBox="0 0 220 340" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="suitBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={o.base} />
          <stop offset="55%" stopColor={o.base} />
          <stop offset="100%" stopColor={shade(o.base, -22)} />
        </linearGradient>
        <filter id="energyGlow">
          <feGaussianBlur stdDeviation={2 + glow * 2} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* silhouette shadow */}
      <ellipse cx="110" cy="326" rx="56" ry="8" fill="#000" opacity="0.5" />

      {/* legs */}
      <path d="M88 226 L80 322 L98 324 L104 238 Z" fill={o.base} opacity={stealthDim} />
      <path d="M132 226 L140 322 L122 324 L116 238 Z" fill={o.base} opacity={stealthDim} />
      <rect x="80" y="304" width="20" height="18" rx="3" fill="#0a0a10" />
      <rect x="120" y="304" width="20" height="18" rx="3" fill="#0a0a10" />

      {/* arms */}
      <path d="M52 118 L38 200 Q36 210 46 212 L66 214 L74 128 Z" fill={o.base} opacity={stealthDim} />
      <path d="M168 118 L182 200 Q184 210 174 212 L154 214 L146 128 Z" fill={o.base} opacity={stealthDim} />
      {/* arm accent stripes */}
      <path d="M56 132 L66 132 L64 152 L54 152 Z" fill={o.accent} opacity={stealthDim} />
      <path d="M164 132 L154 132 L156 152 L166 152 Z" fill={o.accent} opacity={stealthDim} />

      {/* torso */}
      <path d="M74 96 Q110 82 146 96 L158 132 Q160 210 138 236 Q110 250 82 236 Q60 210 62 132 Z" fill="url(#suitBody)" filter="url(#energyGlow)" style={{ opacity: 0.92 }} />

      {/* chest emblem — stylized arachnid mark */}
      <g transform="translate(110,148)" opacity={stealthDim}>
        <circle r="16" fill="none" stroke={o.accent} strokeWidth="2.4" />
        <circle r="6" fill={o.accent} />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return <line key={i} x1={Math.cos(a) * 6} y1={Math.sin(a) * 6} x2={Math.cos(a) * 16} y2={Math.sin(a) * 16} stroke={o.accent} strokeWidth="1.6" />
        })}
        <circle r="2.2" fill="#0a0a10" />
      </g>

      {/* belt */}
      <rect x="76" y="222" width="68" height="12" rx="4" fill="#0a0a10" opacity={stealthDim} />
      <rect x="104" y="222" width="12" height="12" rx="2" fill={o.accent} opacity={stealthDim} />

      {/* head + visor */}
      <ellipse cx="110" cy="72" rx="30" ry="34" fill={shade(o.base, -30)} opacity={stealthDim} />
      <g filter="url(#energyGlow)">
        <path d="M84 74 Q96 62 110 62 Q124 62 136 74 Q128 82 110 82 Q92 82 84 74 Z" fill={o.visor} opacity={stealthDim} />
        <path d="M88 74 L96 70 L104 74 L104 78 L88 78 Z" fill="#0a0a10" opacity={0.85} />
        <path d="M132 74 L124 70 L116 74 L116 78 L132 78 Z" fill="#0a0a10" opacity={0.85} />
      </g>

      {/* tech lines */}
      <g opacity={0.4 + glow * 0.5} stroke={o.accent} strokeWidth="1">
        <path d="M78 100 Q110 92 142 100" fill="none" strokeDasharray="4 5" />
        {o.tech > 50 && <path d="M70 180 Q110 172 150 180" fill="none" strokeDasharray="3 6" />}
        {o.power > 60 && <path d="M110 236 L110 250" fill="none" />}
      </g>
    </svg>
  )
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, (n >> 16) + amt))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt))
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/** Suit Forge — design a custom Guardian suit, generate specs, save to collection. */
export default function SuitForge() {
  const [o, setO] = useState<SuitOptions>({ base: '#dc143c', accent: '#ff3b3b', visor: '#eaf4ff', tech: 55, stealth: false, power: 60, webType: 'web-shooters' })
  const [result, setResult] = useState<SuitResult | null>(null)
  const { suits, saveSuit, award, increment } = useGame()

  const spec = useMemo(() => makeSuit(o), [o])

  const generate = () => {
    setResult(spec)
    engine.portal()
    award('suit_made')
  }

  const save = () => {
    if (!result) return
    saveSuit({ name: result.name, colors: [o.base, o.accent, o.visor], tech: o.tech, stealth: o.stealth, power: o.power, webType: o.webType })
    increment('suits', 1)
    if (suits.length >= 2) award('collector')
    engine.achievement()
  }

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">{label}</span>
      <div className="mt-1.5 flex flex-wrap gap-1.5">{children}</div>
    </div>
  )

  const Swatch = ({ active, color, onClick }: { active: boolean; color: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      aria-label={`Select ${color}`}
      className={`h-7 w-7 rounded-full border-2 transition ${active ? 'scale-110 border-white' : 'border-transparent hover:scale-105'}`}
      style={{ background: color }}
    />
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="glass glass-edge rounded-2xl p-5">
        <h3 className="font-display text-xs font-bold uppercase tracking-widest text-white/70">Parameters</h3>
        <div className="mt-4 space-y-5">
          <Row label="Base fabric">
            {BASE_COLORS.map((c) => (
              <Swatch key={c} active={o.base === c} color={c} onClick={() => setO({ ...o, base: c })} />
            ))}
          </Row>
          <Row label="Accent energy">
            {ACCENT_COLORS.map((c) => (
              <Swatch key={c} active={o.accent === c} color={c} onClick={() => setO({ ...o, accent: c })} />
            ))}
          </Row>
          <Row label="Visor">
            {VISOR_COLORS.map((c) => (
              <Swatch key={c} active={o.visor === c} color={c} onClick={() => setO({ ...o, visor: c })} />
            ))}
          </Row>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">
              Tech matrix — <span className="text-electric">{o.tech}%</span>
            </span>
            <input type="range" min={0} max={100} value={o.tech} onChange={(e) => setO({ ...o, tech: Number(e.target.value) })} className="mt-2 w-full accent-ember" aria-label="Tech matrix" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">
              Power output — <span className="text-ember">{o.power}%</span>
            </span>
            <input type="range" min={0} max={100} value={o.power} onChange={(e) => setO({ ...o, power: Number(e.target.value) })} className="mt-2 w-full accent-ember" aria-label="Power output" />
          </div>
          <Row label="Web system">
            {WEB_TYPES.map((w) => (
              <button
                key={w}
                onClick={() => setO({ ...o, webType: w })}
                className={`rounded-full px-3 py-1 text-xs capitalize transition ${o.webType === w ? 'bg-electric/20 text-blue-300 ring-1 ring-electric/50' : 'bg-white/5 text-white/55 hover:bg-white/10'}`}
              >
                {w.replace('-', ' ')}
              </button>
            ))}
          </Row>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">Stealth mode</span>
            <button
              role="switch"
              aria-checked={o.stealth}
              onClick={() => setO({ ...o, stealth: !o.stealth })}
              className={`relative h-6 w-11 rounded-full transition ${o.stealth ? 'bg-crimson' : 'bg-white/15'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${o.stealth ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </label>
          <button
            onClick={generate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-crimson to-ember px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:shadow-emberGlow"
          >
            <Wand2 size={15} /> Forge Suit
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="glass glass-edge relative h-[360px] overflow-hidden rounded-2xl">
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: `radial-gradient(240px 240px at 50% 30%, ${o.accent}22, transparent 70%)` }} />
          <div className="h-full p-6">
            <SuitSchematic o={o} />
          </div>
          <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Live preview</div>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass glass-edge rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-extrabold tracking-wide text-white">{result.name}</h4>
              <span className="rounded-md bg-ember/15 px-2 py-0.5 font-mono text-[10px] text-ember">SCORE {result.mark}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/60">{result.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {result.specs.map((s) => (
                <div key={s.label} className="rounded-lg bg-white/[0.04] px-3 py-2">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">{s.label}</div>
                  <div className="text-xs text-white/85">{s.value}</div>
                </div>
              ))}
            </div>
            <button onClick={save} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:border-ember/50 hover:text-ember">
              <Save size={14} /> Save to collection
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
