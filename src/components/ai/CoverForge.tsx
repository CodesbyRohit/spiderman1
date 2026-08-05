import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Save } from 'lucide-react'
import { makeCover, characters } from '../../lib/ai/engine'
import { mulberry32 } from '../../lib/ai/streaming'
import type { CoverOptions } from '../../lib/ai/types'
import { useGame } from '../../lib/gamification/game'
import { engine } from '../../lib/audio/engine'

const PALETTES: { name: string; colors: string[] }[] = [
  { name: 'Classic', colors: ['#dc143c', '#2f6bff', '#f5f5f7', '#0b1026'] },
  { name: 'Noir', colors: ['#1a1a22', '#d0d0dc', '#7b2ff7', '#0a0a10'] },
  { name: 'Neon', colors: ['#1a0b2e', '#ff2fa0', '#40c4ff', '#0a0a10'] },
  { name: 'Cosmic', colors: ['#0a0a18', '#7b2ff7', '#40c4ff', '#e8e8f0'] },
  { name: 'Ember', colors: ['#2a0a0a', '#ff3b3b', '#ffb020', '#0a0a10'] },
]

const MOODS = ['epic', 'noir', 'neon', 'cosmic', 'dark']
const STYLES: CoverOptions['style'][] = ['classic', 'modern', 'neon', 'minimal']

/** Cover Forge — generative comic covers with export and collection. */
export default function CoverForge() {
  const heroes = characters()
  const [o, setO] = useState<CoverOptions>({ hero: heroes[0]?.name ?? 'ARACHNID', palette: PALETTES[0].colors, mood: 'epic', style: 'classic' })
  const [seed, setSeed] = useState(0)
  const [coverTitle, setCoverTitle] = useState('')
  const { saveCover, award, increment } = useGame()

  const rand = useMemo(() => mulberry32(seed || 1), [seed])

  const generate = () => {
    const r = makeCover(o)
    setSeed(r.seed)
    setCoverTitle(r.title)
    engine.portal()
    award('cover_made')
    increment('covers', 1)
  }

  const issue = Math.floor(rand() * 900) + 1

  const exportPng = () => {
    const c = document.createElement('canvas')
    c.width = 800
    c.height = 1200
    const ctx = c.getContext('2d')
    if (!ctx) return
    const [c1, c2, c3, bg] = o.palette
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 800, 1200)
    // rays
    const rayGrad = ctx.createConicGradient(0.3, 400, 560)
    rayGrad.addColorStop(0, c1)
    rayGrad.addColorStop(0.25, bg)
    rayGrad.addColorStop(0.5, c2)
    rayGrad.addColorStop(0.75, bg)
    rayGrad.addColorStop(1, c1)
    ctx.fillStyle = rayGrad
    ctx.globalAlpha = 0.35
    ctx.fillRect(0, 0, 800, 1200)
    ctx.globalAlpha = 1
    // title block
    ctx.fillStyle = '#0a0a10'
    ctx.fillRect(60, 80, 680, 130)
    ctx.fillStyle = c3
    ctx.font = '900 84px Unbounded, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(coverTitle || 'ARACHNID', 400, 165)
    // hero silhouette
    ctx.fillStyle = c1
    ctx.beginPath()
    ctx.ellipse(400, 660, 180, 240, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.ellipse(400, 640, 96, 128, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = c2
    ctx.font = '700 44px Unbounded, sans-serif'
    ctx.fillText(o.hero.toUpperCase(), 400, 1050)
    ctx.fillStyle = c3
    ctx.font = '400 24px IBM Plex Mono, monospace'
    ctx.fillText(`ISSUE #${issue} — ${o.mood.toUpperCase()}`, 400, 1090)
    ctx.fillStyle = '#ffffff'
    ctx.font = '400 18px IBM Plex Mono, monospace'
    ctx.fillText('ARACHNID UNIVERSE · ORIGINAL IP', 400, 1130)
    const a = document.createElement('a')
    a.download = `arachnid-cover-${issue}.png`
    a.href = c.toDataURL('image/png')
    a.click()
  }

  const save = () => {
    if (!coverTitle) return
    saveCover({ title: coverTitle, palette: o.palette, seed })
    engine.achievement()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="glass glass-edge rounded-2xl p-5">
        <h3 className="font-display text-xs font-bold uppercase tracking-widest text-white/70">Cover controls</h3>
        <div className="mt-4 space-y-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Hero</span>
            <select value={o.hero} onChange={(e) => setO({ ...o, hero: e.target.value })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#101018] px-3 py-2.5 text-sm text-white focus:border-ember/60 focus:outline-none">
              {heroes.map((h) => (
                <option key={h.id} value={h.name}>{h.name}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Palette</span>
            <div className="mt-2 flex flex-col gap-2">
              {PALETTES.map((p) => (
                <button key={p.name} onClick={() => setO({ ...o, palette: p.colors })} className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition ${o.palette === p.colors ? 'border-white/40 bg-white/5' : 'border-white/10 hover:border-white/25'}`}>
                  <span className="flex gap-1">
                    {p.colors.map((c) => (
                      <span key={c} className="h-4 w-4 rounded-full border border-white/20" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="text-xs text-white/70">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Mood</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button key={m} onClick={() => setO({ ...o, mood: m })} className={`rounded-full px-3 py-1 text-xs capitalize transition ${o.mood === m ? 'bg-violet/20 text-violet ring-1 ring-violet/50' : 'bg-white/5 text-white/55 hover:bg-white/10'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Style</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <button key={s} onClick={() => setO({ ...o, style: s })} className={`rounded-full px-3 py-1 text-xs capitalize transition ${o.style === s ? 'bg-ember/20 text-ember ring-1 ring-ember/50' : 'bg-white/5 text-white/55 hover:bg-white/10'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={generate} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet to-electric px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:shadow-electricGlow">
            Generate Cover
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative mx-auto aspect-[2/3] w-full max-w-[340px] overflow-hidden rounded-2xl border border-white/10">
          {seed === 0 ? (
            <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">Generate your cover</div>
          ) : (
            <motion.div key={seed} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative h-full">
              {/* burst rays */}
              <div className="absolute inset-0 opacity-40" style={{ background: `conic-gradient(from ${seed % 360}deg at 50% 45%, ${o.palette[0]} 0deg, transparent 40deg, ${o.palette[1]} 90deg, transparent 140deg, ${o.palette[2]} 200deg, transparent 260deg, ${o.palette[0]} 320deg, transparent 360deg)` }} />
              <div className="halftone absolute inset-0 opacity-30" />
              <div className="absolute inset-0" style={{ background: `radial-gradient(300px 400px at 50% 52%, transparent 30%, ${o.palette[3]}cc 100%)` }} />
              {/* title block */}
              <div className="absolute left-[8%] right-[8%] top-[7%] rounded-sm bg-black/80 px-4 py-3 text-center">
                <div className="font-display text-2xl font-black uppercase leading-none tracking-tight text-white md:text-3xl" style={{ color: o.palette[2], textShadow: `0 0 24px ${o.palette[0]}` }}>
                  {coverTitle}
                </div>
              </div>
              {/* hero silhouette */}
              <div className="absolute left-1/2 top-[30%] h-[44%] w-[52%] -translate-x-1/2" style={{ background: `radial-gradient(circle at 50% 38%, ${o.palette[2]} 0 9%, transparent 9.5%), radial-gradient(circle at 50% 38%, ${o.palette[0]} 0 16%, transparent 16.5%), linear-gradient(${o.palette[0]}, ${shadeHex(o.palette[0], -30)})`, borderRadius: '48% 48% 42% 42% / 60% 60% 40% 40%', boxShadow: `0 0 60px ${o.palette[0]}66` }} />
              {/* issue */}
              <div className="absolute bottom-[8%] left-[8%] font-mono text-[10px] uppercase tracking-widest" style={{ color: o.palette[2] }}>Issue #{issue}</div>
              <div className="absolute bottom-[8%] right-[8%] font-mono text-[10px] uppercase tracking-widest text-white/60">{o.style} · {o.mood}</div>
              <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 font-display text-sm font-bold uppercase tracking-[0.4em]" style={{ color: o.palette[2] }}>{o.hero}</div>
            </motion.div>
          )}
        </div>

        {seed !== 0 && (
          <div className="flex gap-3">
            <button onClick={exportPng} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:border-electric/60 hover:text-blue-300">
              <Download size={14} /> Export PNG
            </button>
            <button onClick={save} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:border-ember/50 hover:text-ember">
              <Save size={14} /> Save cover
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function shadeHex(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, (n >> 16) + amt))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt))
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
