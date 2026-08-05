import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Check } from 'lucide-react'
import { makeMissions } from '../../lib/ai/engine'
import type { GeneratedMission } from '../../lib/ai/types'
import { useGame } from '../../lib/gamification/game'
import { engine } from '../../lib/audio/engine'
import { useApp } from '../../lib/state/app'

/** Mission Generator — AI-produced patrol objectives with XP payouts. */
export default function Missions() {
  const [persona, setPersona] = useState('Silkspire patrol')
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1)
  const [missions, setMissions] = useState<GeneratedMission[] | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const { addXp } = useGame()
  const pushToast = useApp((s) => s.pushToast)

  const generate = () => {
    const m = makeMissions({ persona, difficulty })
    setMissions(m)
    setDone(new Set())
    engine.portal()
  }

  const complete = (mission: GeneratedMission) => {
    if (done.has(mission.id)) return
    setDone((d) => new Set(d).add(mission.id))
    addXp(mission.reward)
    engine.achievement()
    pushToast({ title: `Mission complete · +${mission.reward} XP`, body: mission.title, tone: 'success', icon: '🏆' })
  }

  return (
    <div className="space-y-5">
      <div className="glass glass-edge grid gap-4 rounded-2xl p-5 md:grid-cols-[1fr_auto]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Patrol persona</span>
          <input value={persona} onChange={(e) => setPersona(e.target.value)} placeholder="Silkspire patrol" className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-ember/60 focus:outline-none" />
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Difficulty</span>
          <div className="mt-1.5 flex gap-1.5">
            {([1, 2, 3] as const).map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} className={`grid h-11 w-11 place-items-center rounded-xl font-display text-sm font-bold transition ${difficulty === d ? 'bg-ember/25 text-ember ring-1 ring-ember/50' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                {d === 1 ? 'I' : d === 2 ? 'II' : 'III'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ember to-electric px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:shadow-emberGlow">
          <Target size={15} /> Generate Missions
        </button>
      </div>

      {missions && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {missions.map((m, i) => {
            const isDone = done.has(m.id)
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className={`glass glass-edge hud-corner relative overflow-hidden rounded-2xl p-5 transition ${isDone ? 'opacity-70' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Op {String(i + 1).padStart(2, '0')}</span>
                  <span className="rounded-md bg-ember/15 px-2 py-0.5 font-mono text-[10px] text-ember">+{m.reward} XP</span>
                </div>
                <h4 className="mt-2 font-display text-sm font-bold uppercase tracking-wide text-white">{m.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{m.desc}</p>
                <button
                  onClick={() => complete(m)}
                  disabled={isDone}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    isDone ? 'border-emerald-400/40 text-emerald-300' : 'border-white/15 text-white/75 hover:border-ember/50 hover:text-ember'
                  }`}
                >
                  {isDone ? <Check size={13} /> : null} {isDone ? 'Completed' : 'Simulate completion'}
                </button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
