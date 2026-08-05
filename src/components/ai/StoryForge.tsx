import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wand2, FileText } from 'lucide-react'
import { streamStory } from '../../lib/ai/engine'
import type { StoryInput } from '../../lib/ai/types'
import { useGame } from '../../lib/gamification/game'
import { engine } from '../../lib/audio/engine'

const EMOTIONS = ['hope', 'fear', 'rage', 'love', 'doubt']
const POWERS = ['the Spider-Sense', 'wall-crawling', 'programmable web', 'precognition']

interface Manuscript {
  title: string
  text: string
  chapters: string[]
  twist: string
}

/** Story Forge — an AI-generated four-chapter ARACHNID tale. */
export default function StoryForge() {
  const [input, setInput] = useState<StoryInput>({ villain: '', city: '', power: POWERS[0], emotion: 'hope' })
  const [busy, setBusy] = useState(false)
  const [manuscript, setManuscript] = useState<Manuscript | null>(null)
  const award = useGame((s) => s.award)
  const increment = useGame((s) => s.increment)

  const generate = async () => {
    if (busy) return
    setBusy(true)
    setManuscript(null)
    let text = ''
    setManuscript({ title: '', text, chapters: [], twist: '' })
    const abort = new AbortController()
    engine.portal()
    const result = await streamStory(input, (chunk) => {
      text += chunk
      setManuscript((m) => (m ? { ...m, text } : m))
    }, abort.signal)
    setManuscript({ title: result.title, text, chapters: result.chapters, twist: result.twist })
    setBusy(false)
    increment('stories', 1)
    award('story_made')
    engine.achievement()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="glass glass-edge rounded-2xl p-5">
        <h3 className="font-display text-xs font-bold uppercase tracking-widest text-white/70">Parameters</h3>
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Villain</span>
            <input
              value={input.villain}
              onChange={(e) => setInput({ ...input, villain: e.target.value })}
              placeholder="Dr. Nullweave"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-ember/60 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">City</span>
            <input
              value={input.city}
              onChange={(e) => setInput({ ...input, city: e.target.value })}
              placeholder="Silkspire"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-ember/60 focus:outline-none"
            />
          </label>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Power</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {POWERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setInput({ ...input, power: p })}
                  className={`rounded-full px-3 py-1 text-xs transition ${input.power === p ? 'bg-ember/20 text-ember ring-1 ring-ember/50' : 'bg-white/5 text-white/55 hover:bg-white/10'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Emotion</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {EMOTIONS.map((em) => (
                <button
                  key={em}
                  onClick={() => setInput({ ...input, emotion: em })}
                  className={`rounded-full px-3 py-1 text-xs capitalize transition ${input.emotion === em ? 'bg-electric/20 text-blue-300 ring-1 ring-electric/50' : 'bg-white/5 text-white/55 hover:bg-white/10'}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => void generate()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-crimson to-ember px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:shadow-emberGlow disabled:opacity-50"
          >
            <Wand2 size={15} className={busy ? 'animate-spin' : ''} /> {busy ? 'Weaving…' : 'Generate Story'}
          </button>
        </div>
      </div>

      <div className="glass glass-edge relative min-h-[420px] rounded-2xl p-6 md:p-8">
        {!manuscript ? (
          <div className="flex h-full min-h-[380px] flex-col items-center justify-center gap-3 text-center">
            <FileText size={30} className="text-white/20" />
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/35">
              Your story will appear here — strand by strand
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {manuscript.title && (
              <h4 className="font-display text-2xl font-extrabold uppercase tracking-tight text-white">{manuscript.title}</h4>
            )}
            <div className="mt-4 whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-white/75">{manuscript.text}</div>
            {manuscript.twist && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6 rounded-xl border border-violet/30 bg-violet/10 p-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-violet">The twist</span>
                <p className="mt-1 text-sm text-white/80">{manuscript.twist}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
