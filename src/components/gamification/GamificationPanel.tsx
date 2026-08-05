import { useState } from 'react'
import { motion } from 'framer-motion'
import { ACHIEVEMENTS, levelFromXp, levelTitle } from '../../lib/gamification/achievements'
import { useGame, refreshMissions, type SuitCard, type CoverCard } from '../../lib/gamification/game'
import { useApp } from '../../lib/state/app'
import Panel from '../ui/Panel'

type Tab = 'progress' | 'achievements' | 'missions' | 'collection'

/** The gamification hub: levels, achievements, daily missions, collection. */
export default function GamificationPanel() {
  const open = useApp((s) => s.gameOpen)
  const setOpen = useApp((s) => s.setGameOpen)
  const [tab, setTab] = useState<Tab>('progress')
  const { xp, unlocked, suits, covers, missions, missionDone, stats, reset } = useGame()
  refreshMissions()
  const { level, progress } = levelFromXp(xp)
  const nextAch = ACHIEVEMENTS.filter((a) => !unlocked.includes(a.id)).length

  const tabs: { id: Tab; label: string }[] = [
    { id: 'progress', label: 'Progress' },
    { id: 'achievements', label: `Achievements (${unlocked.length}/${ACHIEVEMENTS.length})` },
    { id: 'missions', label: 'Daily Missions' },
    { id: 'collection', label: `Collection (${suits.length})` },
  ]

  return (
    <Panel open={open} onClose={() => setOpen(false)} title="Guardian Profile" subtitle={`Level ${level} · ${levelTitle(level)}`}>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
              tab === t.id ? 'border-ember/60 bg-ember/12 text-ember' : 'border-white/10 text-white/55 hover:border-white/30 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'progress' && (
        <div className="space-y-5">
          <div className="glass glass-edge rounded-2xl p-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/45">Level</div>
                <div className="font-display text-5xl font-black text-white">{level}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ember">{levelTitle(level)}</div>
              </div>
              <div className="text-right font-mono text-xs text-white/50">
                <div>{xp} total XP</div>
                <div>{nextAch} achievements remaining</div>
              </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-crimson via-ember to-electric" animate={{ width: `${Math.max(3, progress * 100)}%` }} transition={{ type: 'spring', stiffness: 80, damping: 18 }} />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-widest text-white/35">
              <span>Progress to level {level + 1}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {(
              [
                ['Chapters read', stats.chapters],
                ['Stories forged', stats.stories],
                ['Suits designed', stats.suits],
                ['Battles simulated', stats.battles],
                ['Universes visited', stats.universes],
                ['Chats with LUMEN', stats.chats],
                ['Skills unlocked', stats.skills],
                ['Senses triggered', stats.senses],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <div className="font-display text-2xl font-black text-white">{value}</div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-white/40">{label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset all progress, XP and achievements?')) reset()
            }}
            className="text-xs text-white/35 underline-offset-4 transition hover:text-crimson hover:underline"
          >
            Reset progress
          </button>
        </div>
      )}

      {tab === 'achievements' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a, i) => {
            const got = unlocked.includes(a.id)
            const show = got || !a.secret
            if (!show) return null
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`glass glass-edge rounded-xl p-4 ${got ? '' : 'opacity-45 grayscale'}`}>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-lg">{a.icon}</span>
                  <div>
                    <div className="font-display text-xs font-bold uppercase tracking-wider text-white">{a.title}</div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-ember">{got ? `+${a.xp} XP earned` : `${a.xp} XP`}</div>
                  </div>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-white/50">{a.desc}</p>
              </motion.div>
            )
          })}
        </div>
      )}

      {tab === 'missions' && (
        <div className="space-y-3">
          {missions.map((m) => {
            const done = missionDone.includes(m.id)
            const cur = Math.min(stats[m.stat], m.target)
            return (
              <div key={m.id} className={`glass glass-edge rounded-xl p-5 ${done ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden>{m.icon}</span>
                  <div className="flex-1">
                    <div className="font-display text-sm font-bold uppercase tracking-wide text-white">{m.title}</div>
                    <div className="text-xs text-white/55">{m.desc}</div>
                  </div>
                  <span className={`rounded-md px-2 py-1 font-mono text-[10px] ${done ? 'bg-emerald-400/15 text-emerald-300' : 'bg-ember/15 text-ember'}`}>
                    {done ? '✓ DONE' : `+${m.xp} XP`}
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-gradient-to-r from-ember to-electric" style={{ width: `${(cur / m.target) * 100}%` }} />
                </div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-white/35">{cur}/{m.target} · resets daily</div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'collection' && (
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-white/60">Suit Collection</h4>
            {suits.length === 0 ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/30">No suits yet — forge one in the Lab</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {suits.map((s: SuitCard) => (
                  <div key={s.id} className="glass rounded-xl p-4">
                    <div className="flex gap-2">
                      {s.colors.map((c) => (
                        <span key={c} className="h-5 w-5 rounded-full border border-white/20" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="mt-2 font-display text-sm font-bold text-white">{s.name}</div>
                    <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-white/40">
                      tech {s.tech}% · power {s.power}% · {s.webType}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-white/60">Cover Gallery</h4>
            {covers.length === 0 ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/30">No covers yet — generate one in the Lab</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {covers.map((c: CoverCard) => (
                  <div key={c.id} className="aspect-[2/3] overflow-hidden rounded-lg border border-white/10">
                    <div className="h-full w-full" style={{ background: `linear-gradient(160deg, ${c.palette[0]}, ${c.palette[3]})` }}>
                      <div className="flex h-full items-end p-2">
                        <div className="w-full truncate text-center font-display text-[9px] font-bold uppercase text-white">{c.title}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Panel>
  )
}
