import { lazy, Suspense, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Wand2, Shirt, Image, Swords, Target, Brain, Mic } from 'lucide-react'
import Panel from '../ui/Panel'
import { useApp } from '../../lib/state/app'
import { engine } from '../../lib/audio/engine'

const AIChat = lazy(() => import('../ai/AIChat'))
const StoryForge = lazy(() => import('../ai/StoryForge'))
const SuitForge = lazy(() => import('../ai/SuitForge'))
const CoverForge = lazy(() => import('../ai/CoverForge'))
const BattleSim = lazy(() => import('../ai/BattleSim'))
const Missions = lazy(() => import('../ai/Missions'))
const Trivia = lazy(() => import('../ai/Trivia'))
const VoiceAssistant = lazy(() => import('../ai/VoiceAssistant'))

const TABS = [
  { id: 'chat', label: 'Assistant', icon: Bot },
  { id: 'story', label: 'Story Forge', icon: Wand2 },
  { id: 'suit', label: 'Suit Forge', icon: Shirt },
  { id: 'cover', label: 'Cover Forge', icon: Image },
  { id: 'battle', label: 'Battle Sim', icon: Swords },
  { id: 'missions', label: 'Missions', icon: Target },
  { id: 'trivia', label: 'Trivia', icon: Brain },
  { id: 'voice', label: 'Voice', icon: Mic },
]

const FALLBACK = <div className="grid min-h-[420px] place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ember border-t-transparent" /></div>

/** The AI Lab — eight intelligence modules behind a portal door. */
export default function Lab() {
  const open = useApp((s) => s.labOpen)
  const setOpen = useApp((s) => s.setLabOpen)
  const [tab, setTab] = useState('chat')

  const switchTab = (id: string) => {
    if (id === tab) return
    engine.uiTick()
    setTab(id)
  }

  return (
    <Panel open={open} onClose={() => setOpen(false)} title="The AI Lab" subtitle="Eight intelligence modules · Demo Mode uses the local Lore Engine">
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Lab modules">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => switchTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                active ? 'border-ember/60 bg-ember/12 text-ember shadow-emberGlow' : 'border-white/10 text-white/55 hover:border-white/30 hover:text-white'
              }`}
            >
              <Icon size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          <Suspense fallback={FALLBACK}>
            {tab === 'chat' && <AIChat />}
            {tab === 'story' && <StoryForge />}
            {tab === 'suit' && <SuitForge />}
            {tab === 'cover' && <CoverForge />}
            {tab === 'battle' && <BattleSim />}
            {tab === 'missions' && <Missions />}
            {tab === 'trivia' && <Trivia />}
            {tab === 'voice' && <VoiceAssistant />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </Panel>
  )
}
