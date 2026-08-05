import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import { makeTrivia } from '../../lib/ai/engine'
import type { TriviaQuestion } from '../../lib/ai/types'
import { useGame } from '../../lib/gamification/game'
import { engine } from '../../lib/audio/engine'

/** Trivia Engine — test your ARACHNID lore. */
export default function Trivia() {
  const [questions, setQuestions] = useState<TriviaQuestion[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const { addXp } = useGame()

  const start = () => {
    setQuestions(makeTrivia(5))
    setIdx(0)
    setScore(0)
    setPicked(null)
    setFinished(false)
    engine.uiOpen()
  }

  const pick = (i: number) => {
    if (picked !== null || !questions) return
    setPicked(i)
    if (i === questions[idx].answer) {
      setScore((s) => s + 1)
      addXp(10)
      engine.uiTick()
    } else {
      engine.alert()
    }
    window.setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setFinished(true)
        engine.achievement()
      } else {
        setIdx((v) => v + 1)
        setPicked(null)
      }
    }, 1400)
  }

  if (!questions) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/15 text-center">
        <Brain size={30} className="text-white/25" />
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">Five questions · ten XP per correct answer</p>
        <button onClick={start} className="rounded-xl bg-gradient-to-r from-electric to-violet px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:shadow-electricGlow">
          Start Quiz
        </button>
      </div>
    )
  }

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border p-8 text-center" style={{ borderColor: 'rgba(255,176,32,0.3)', background: 'rgba(255,176,32,0.06)' }}>
        <div className="font-display text-5xl font-black text-amber-300">{score}/{questions.length}</div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/50">
          {score >= 4 ? 'Lorekeeper of the Web' : score >= 2 ? 'Initiate of the Loom' : 'The web still needs you'}
        </p>
        <button onClick={start} className="mt-2 rounded-xl border border-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/80 transition hover:border-amber-400/60 hover:text-amber-300">
          Run it again
        </button>
      </motion.div>
    )
  }

  const q = questions[idx]
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/45">
        <span>Question {idx + 1} / {questions.length}</span>
        <span>Score · {score}</span>
      </div>
      <motion.div key={idx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="glass glass-edge rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold text-white">{q.q}</h3>
        <div className="mt-5 grid gap-2.5 md:grid-cols-2">
          {q.options.map((opt, i) => {
            const isAnswer = i === q.answer
            const isPicked = picked === i
            const show = picked !== null
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={picked !== null}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  show && isAnswer
                    ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                    : show && isPicked
                      ? 'border-crimson/60 bg-crimson/10 text-red-300'
                      : 'border-white/12 bg-white/[0.03] text-white/75 hover:border-white/40 hover:bg-white/[0.06]'
                }`}
              >
                <span className="mr-2 font-mono text-[10px] text-white/40">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            )
          })}
        </div>
        {picked !== null && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl bg-white/[0.04] p-3 text-xs leading-relaxed text-white/60">
            💡 {q.fact}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
