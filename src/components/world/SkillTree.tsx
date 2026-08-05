import { motion } from 'framer-motion'
import { Lock, Unlock } from 'lucide-react'
import { useGame } from '../../lib/gamification/game'
import { useLocalStorage } from '../../lib/hooks/core'
import { engine } from '../../lib/audio/engine'

interface SkillDef {
  id: string
  name: string
  desc: string
  cost: number
  branch: string
}

const BRANCHES = [
  { id: 'combat', name: 'Combat', color: '#ff3b3b', icon: '⚔️' },
  { id: 'mobility', name: 'Mobility', color: '#40c4ff', icon: '🕸️' },
  { id: 'senses', name: 'Senses', color: '#ffb020', icon: '⚡' },
  { id: 'tech', name: 'Tech', color: '#7b2ff7', icon: '🔧' },
]

const SKILLS: SkillDef[] = [
  { id: 'webshot', name: 'Web Shot', desc: 'Fast single-target web projectile.', cost: 120, branch: 'combat' },
  { id: 'impact', name: 'Impact Web', desc: 'Kinetic web burst with knockback.', cost: 240, branch: 'combat' },
  { id: 'shield', name: 'Web Shield', desc: 'Conjure a temporary silk barrier.', cost: 360, branch: 'combat' },
  { id: 'swing', name: 'Swing', desc: 'Silky-smooth city traversal.', cost: 120, branch: 'mobility' },
  { id: 'wallrun', name: 'Wall-Run', desc: 'Adhere and sprint up vertical faces.', cost: 240, branch: 'mobility' },
  { id: 'glider', name: 'Web Glider', desc: 'Deploy wing-like silk for glide dives.', cost: 360, branch: 'mobility' },
  { id: 'danger', name: 'Danger Sense', desc: 'Extended precognitive reflex range.', cost: 120, branch: 'senses' },
  { id: 'precog', name: 'Precognition', desc: 'Model 4000 danger scenarios/sec.', cost: 240, branch: 'senses' },
  { id: 'omni', name: 'Omnisense', desc: 'Sense threats city-wide through the web.', cost: 360, branch: 'senses' },
  { id: 'repair', name: 'Nano Repair', desc: 'Suit self-heals mid-combat.', cost: 120, branch: 'tech' },
  { id: 'overclock', name: 'Suit Overclock', desc: '+40% reaction amplification.', cost: 240, branch: 'tech' },
  { id: 'loom', name: 'Loom Mastery', desc: 'Weave programmable constructs.', cost: 360, branch: 'tech' },
]

/** XP-powered skill tree. Spending XP is permanent per browser. */
export default function SkillTree() {
  const [unlocked, setUnlocked] = useLocalStorage<string[]>('arachnid-skills-v1', [])
  const { xp, award, addXp } = useGame()

  const unlock = (skill: SkillDef) => {
    if (unlocked.includes(skill.id) || xp < skill.cost) return
    setUnlocked((u) => [...u, skill.id])
    addXp(-skill.cost, 'skill')
    engine.uiTick()
    award('skill_unlock')
    const all = SKILLS.every((s) => [...unlocked, skill.id].includes(s.id))
    if (all) award('all_skills')
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/50">
          GUARDIAN PROTOCOL · <span className="text-ember">{unlocked.length}/{SKILLS.length}</span> unlocked
        </div>
        <div className="glass rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white/70">XP available · {xp}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {BRANCHES.map((b) => {
          const skills = SKILLS.filter((s) => s.branch === b.id)
          const branchUnlocked = skills.filter((s) => unlocked.includes(s.id)).length
          return (
            <div key={b.id} className="glass glass-edge relative overflow-hidden rounded-2xl p-5">
              <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl" style={{ background: `${b.color}22` }} />
              <div className="mb-4 flex items-center gap-2.5">
                <span className="text-lg" aria-hidden>{b.icon}</span>
                <h3 className="font-display text-sm font-bold uppercase tracking-widest" style={{ color: b.color }}>
                  {b.name}
                </h3>
                <span className="ml-auto font-mono text-[10px] text-white/40">{branchUnlocked}/3</span>
              </div>

              <div className="relative space-y-3 pl-6">
                {/* branch spine */}
                <div className="absolute bottom-6 left-[7px] top-2 w-px bg-white/10" />
                {skills.map((s, i) => {
                  const isUnlocked = unlocked.includes(s.id)
                  const affordable = xp >= s.cost
                  return (
                    <motion.button
                      key={s.id}
                      onClick={() => unlock(s)}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ delay: i * 0.08 }}
                      className={`group relative flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 ${
                        isUnlocked
                          ? 'border-transparent'
                          : affordable
                            ? 'border-white/15 hover:border-white/40 hover:bg-white/5'
                            : 'border-white/8 opacity-55 hover:opacity-80'
                      }`}
                      style={isUnlocked ? { background: `${b.color}18`, boxShadow: `inset 0 0 0 1px ${b.color}44` } : undefined}
                      aria-pressed={isUnlocked}
                    >
                      {/* node dot on the spine */}
                      <span
                        className="absolute -left-[22px] grid h-4 w-4 place-items-center rounded-full border transition-all duration-300"
                        style={{
                          borderColor: isUnlocked ? b.color : 'rgba(255,255,255,0.25)',
                          background: isUnlocked ? b.color : '#0c0c14',
                          boxShadow: isUnlocked ? `0 0 12px ${b.color}` : 'none',
                        }}
                      >
                        {isUnlocked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>

                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-white/60 transition group-hover:text-white">
                        {isUnlocked ? <Unlock size={14} style={{ color: b.color }} /> : <Lock size={14} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-xs font-bold uppercase tracking-wider text-white">{s.name}</span>
                        <span className="block truncate text-[11px] text-white/45">{s.desc}</span>
                      </span>
                      <span
                        className="shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px]"
                        style={isUnlocked ? { background: `${b.color}22`, color: b.color } : affordable ? { background: 'rgba(255,255,255,0.08)', color: '#fff' } : { background: 'rgba(255,255,255,0.06)', color: '#777' }}
                      >
                        {isUnlocked ? '✓' : `${s.cost} XP`}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
