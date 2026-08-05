import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Terminal, X } from 'lucide-react'
import { useApp, type TimeOfDay } from '../lib/state/app'
import { useGame } from '../lib/gamification/game'
import { engine } from '../lib/audio/engine'

const TODS: TimeOfDay[] = ['night', 'dawn', 'day', 'dusk']

/** DEV MODE — a floating engineer HUD with live telemetry. */
export default function DevOverlay() {
  const dev = useApp((s) => s.dev)
  const setDev = useApp((s) => s.setDev)
  const { tod, setTod, quality, setQuality, retro, toggleRetro, spiderSense } = useApp()
  const [fps, setFps] = useState(0)
  const frames = useRef(0)
  const last = useRef(performance.now())
  const { xp, unlocked, stats } = useGame()

  useEffect(() => {
    if (!dev) return
    const timer = window.setInterval(() => {
      const now = performance.now()
      const dt = now - last.current
      setFps(Math.round((frames.current / dt) * 1000))
      frames.current = 0
      last.current = now
    }, 800)
    return () => window.clearInterval(timer)
  }, [dev])

  useEffect(() => {
    if (!dev) return
    const raf = () => {
      frames.current += 1
      if (dev) requestAnimationFrame(raf)
    }
    const id = requestAnimationFrame(raf)
    return () => cancelAnimationFrame(id)
  }, [dev])

  useEffect(() => {
    if (dev) useGame.getState().award('dev_mode')
  }, [dev])

  if (!dev) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={dev ? { opacity: 1, x: 0 } : {}}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className={`fixed bottom-24 right-4 z-[105] w-[300px] rounded-2xl border border-emerald-400/30 bg-[#050b08]/90 p-4 font-mono backdrop-blur-xl transition-all`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-emerald-300">
          <Terminal size={12} /> Dev Mode
        </span>
        <button onClick={() => setDev(false)} aria-label="Close dev mode" className="text-white/50 hover:text-white">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2 text-[11px] text-white/70">
        <Row label="FPS" value={`${fps}`} color={fps >= 55 ? 'text-emerald-300' : fps >= 30 ? 'text-amber-300' : 'text-red-400'} />
        <Row label="Engine" value="three@0.169 · R3F" />
        <Row label="WebGL" value={detectGL()} />
        <Row label="Spider-Sense" value={spiderSense ? 'ACTIVE' : 'idle'} color={spiderSense ? 'text-red-400' : 'text-white/40'} />
        <Row label="XP / Achievements" value={`${xp} / ${unlocked.length}`} />
        <Row label="Battles run" value={`${stats.battles}`} />
      </div>

      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="mb-1.5 text-[9px] uppercase tracking-[0.3em] text-white/40">Time of day</div>
        <div className="flex gap-1">
          {TODS.map((t) => (
            <button key={t} onClick={() => setTod(t)} className={`flex-1 rounded border px-1 py-1 text-[9px] uppercase ${tod === t ? 'border-ember/60 bg-ember/15 text-ember' : 'border-white/10 text-white/40'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-1">
          <button onClick={() => setQuality(quality === 'high' ? 'low' : 'high')} className="flex-1 rounded border border-white/10 py-1 text-[9px] uppercase text-white/50">
            quality: {quality}
          </button>
          <button onClick={() => { toggleRetro(); engine.uiTick() }} className="flex-1 rounded border border-white/10 py-1 text-[9px] uppercase text-white/50">
            retro: {retro ? 'on' : 'off'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function Row({ label, value, color = 'text-white/60' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="uppercase tracking-widest text-white/35">{label}</span>
      <span className={color}>{value}</span>
    </div>
  )
}

function detectGL(): string {
  try {
    const c = document.createElement('canvas')
    return c.getContext('webgl2') ? '2.0 ✓' : c.getContext('webgl') ? '1.0 ✓' : 'unavailable'
  } catch {
    return 'unavailable'
  }
}
