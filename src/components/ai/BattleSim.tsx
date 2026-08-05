import { useState } from 'react'
import { motion } from 'framer-motion'
import { Swords } from 'lucide-react'
import { characters, simulateBattle } from '../../lib/ai/engine'
import type { BattleResult } from '../../lib/ai/types'
import { useGame } from '../../lib/gamification/game'
import { engine } from '../../lib/audio/engine'

/** Battle Simulator — probability engine + animated round-by-round outcome. */
export default function BattleSim() {
  const heroes = characters()
  const [aId, setAId] = useState(heroes[0]?.id ?? '')
  const [bId, setBId] = useState(heroes[5]?.id ?? heroes[1]?.id ?? '')
  const [result, setResult] = useState<BattleResult | null>(null)
  const [running, setRunning] = useState(false)
  const { award, increment } = useGame()

  const a = heroes.find((h) => h.id === aId)
  const b = heroes.find((h) => h.id === bId)

  const run = () => {
    if (!a || !b || running) return
    setRunning(true)
    setResult(null)
    increment('battles', 1)
    award('battle_ran')
    engine.alert()
    window.setTimeout(() => {
      const r = simulateBattle(a.id, b.id)
      setResult(r)
      setRunning(false)
      engine.achievement()
    }, 1400)
  }

  const winner = result ? (result.winner === 'a' ? a : result.winner === 'b' ? b : null) : null

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="glass glass-edge rounded-2xl p-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Contender A</span>
          <select value={aId} onChange={(e) => setAId(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#101018] px-3 py-3 text-sm text-white focus:border-ember/60 focus:outline-none">
            {heroes.map((h) => (
              <option key={h.id} value={h.id}>{h.name} — {h.role}</option>
            ))}
          </select>
          {a && <StatBars stats={a.stats} color={a.color} />}
        </div>

        <div className="flex items-center justify-center">
          <motion.div animate={{ rotate: running ? 360 : 0 }} transition={{ duration: 1, repeat: running ? Infinity : 0, ease: 'linear' }} className={`grid h-14 w-14 place-items-center rounded-full border ${running ? 'border-ember bg-ember/15 text-ember' : 'border-white/20 text-white/70'}`}>
            <Swords size={20} />
          </motion.div>
        </div>

        <div className="glass glass-edge rounded-2xl p-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Contender B</span>
          <select value={bId} onChange={(e) => setBId(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#101018] px-3 py-3 text-sm text-white focus:border-electric/60 focus:outline-none">
            {heroes.map((h) => (
              <option key={h.id} value={h.id}>{h.name} — {h.role}</option>
            ))}
          </select>
          {b && <StatBars stats={b.stats} color={b.color} />}
        </div>
      </div>

      <button
        onClick={run}
        disabled={!a || !b || running || aId === bId}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ember to-violet px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:shadow-emberGlow disabled:opacity-45"
      >
        {running ? 'Simulating outcomes…' : 'Run Battle Simulation'}
      </button>

      {result && a && b && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* probability */}
          <div className="glass glass-edge rounded-2xl p-5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/50">
              <span style={{ color: a.color }}>{a.name} — {result.winProbA}%</span>
              <span style={{ color: b.color }}>{100 - result.winProbA}% — {b.name}</span>
            </div>
            <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-white/8">
              <motion.div initial={{ width: 0 }} animate={{ width: `${result.winProbA}%` }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} style={{ background: a.color }} />
              <motion.div initial={{ width: 0 }} animate={{ width: `${100 - result.winProbA}%` }} transition={{ duration: 1, delay: 0.3 }} style={{ background: b.color }} />
            </div>
          </div>

          {/* round graph */}
          <div className="glass glass-edge rounded-2xl p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/50">Health through the rounds</div>
            <RoundGraph rounds={result.rounds} colorA={a.color} colorB={b.color} />
          </div>

          {/* narration */}
          <div className="glass glass-edge rounded-2xl p-5">
            {result.narration.map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.5 }} className="flex gap-3 py-1.5 text-sm text-white/70">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: winner?.color ?? '#fff' }} />
                {line}
              </motion.p>
            ))}
          </div>

          {/* winner */}
          {winner && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2.6, type: 'spring', stiffness: 200, damping: 18 }} className="rounded-2xl border p-6 text-center" style={{ borderColor: `${winner.color}55`, background: `${winner.color}14` }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/50">Victor</div>
              <div className="mt-1 font-display text-3xl font-black uppercase tracking-wide" style={{ color: winner.color, textShadow: `0 0 40px ${winner.color}88` }}>
                {winner.name}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}

function StatBars({ stats, color }: { stats: { power: number; speed: number; tech: number; durability: number; stealth: number; intelligence: number }; color: string }) {
  const rows: [string, number][] = [
    ['PWR', stats.power],
    ['SPD', stats.speed],
    ['TECH', stats.tech],
    ['DUR', stats.durability],
    ['STL', stats.stealth],
    ['INT', stats.intelligence],
  ]
  return (
    <div className="mt-3 space-y-1.5">
      {rows.map(([label, v]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="w-8 font-mono text-[9px] text-white/40">{label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: color }} />
          </div>
          <span className="w-7 text-right font-mono text-[9px] text-white/50">{v}</span>
        </div>
      ))}
    </div>
  )
}

function RoundGraph({ rounds, colorA, colorB }: { rounds: { a: number; b: number }[]; colorA: string; colorB: string }) {
  const max = Math.max(100, ...rounds.map((r) => Math.max(r.a, r.b)))
  return (
    <div className="flex h-32 items-end gap-1.5">
      {rounds.map((r, i) => (
        <div key={i} className="group relative flex flex-1 items-end gap-[2px]">
          <div className="relative w-1/2 rounded-t-sm" style={{ height: `${(r.a / max) * 100}%`, background: colorA, opacity: 0.85 }}>
            <div className="absolute inset-x-0 -top-5 hidden font-mono text-[8px] text-white/50 group-hover:block">{r.a}</div>
          </div>
          <div className="relative w-1/2 rounded-t-sm" style={{ height: `${(r.b / max) * 100}%`, background: colorB, opacity: 0.85 }}>
            <div className="absolute inset-x-0 -top-5 hidden font-mono text-[8px] text-white/50 group-hover:block">{r.b}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
