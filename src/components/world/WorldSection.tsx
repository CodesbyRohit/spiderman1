import { useState } from 'react'
import { motion } from 'framer-motion'
import { History, Globe2, Network, GitBranch } from 'lucide-react'
import TimelineExplorer from './TimelineExplorer'
import MultiverseMap from './MultiverseMap'
import RelationshipGraph from './RelationshipGraph'
import SkillTree from './SkillTree'

const TABS = [
  { id: 'timeline', label: 'Saga Timeline', icon: History },
  { id: 'multiverse', label: 'Multiverse Map', icon: Globe2 },
  { id: 'relationships', label: 'Relationships', icon: Network },
  { id: 'skills', label: 'Skill Tree', icon: GitBranch },
]

/** Interactive World — four explorable views of the ARACHNID multiverse. */
export default function WorldSection() {
  const [tab, setTab] = useState('timeline')

  return (
    <section id="world" aria-label="Interactive world" className="relative mx-auto max-w-7xl px-5 py-24 md:px-8">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}>
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-violet to-transparent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.45em] text-white/50">The World</span>
        </div>
        <h2 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
          Explore the <span className="grad-text-blue">multiverse</span>
        </h2>
        <p className="mt-3 max-w-xl text-white/60">Every universe is connected. Every timeline is a thread. Dive in — the web will catch you.</p>
      </motion.div>

      <div className="mt-10 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="World views">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                active ? 'border-violet/60 bg-violet/12 text-violet shadow-[0_0_24px_rgba(123,47,247,0.25)]' : 'border-white/10 text-white/55 hover:border-white/30 hover:text-white'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {tab === 'timeline' && <TimelineExplorer />}
          {tab === 'multiverse' && <MultiverseMap />}
          {tab === 'relationships' && <RelationshipGraph />}
          {tab === 'skills' && <SkillTree />}
        </motion.div>
      </div>
    </section>
  )
}
