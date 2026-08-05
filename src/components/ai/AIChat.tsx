import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { chatStream, mode } from '../../lib/ai/engine'
import type { ChatMessage, Citation } from '../../lib/ai/types'
import { useGame } from '../../lib/gamification/game'

const SUGGESTIONS = [
  'Who is the Guardian?',
  'Explain the powers',
  'Fun facts',
  'What is the movie order?',
  'Compare ARACHNID and DR. NULLWEAVE',
]

interface UiMsg extends ChatMessage {
  id: number
  citations?: Citation[]
}

let idSeq = 1

/** LUMEN — the streaming AI assistant. */
export default function AIChat() {
  const [messages, setMessages] = useState<UiMsg[]>([
    {
      id: idSeq++,
      role: 'assistant',
      content:
        mode() === 'ai'
          ? 'LUMEN online — live LLM connected. Ask me anything about the ARACHNID universe.'
          : 'LUMEN online — Demo Mode. I answer from the local lore archive. Add an API key in .env for full LLM mode. Ask me anything about the ARACHNID universe.',
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const award = useGame((s) => s.award)
  const increment = useGame((s) => s.increment)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    const clean = text.trim()
    if (!clean || busy) return
    setInput('')
    increment('chats', 1)
    award('first_chat')

    const userMsg: UiMsg = { id: idSeq++, role: 'user', content: clean }
    setMessages((m) => [...m, userMsg])
    setBusy(true)

    const assistantId = idSeq++
    setMessages((m) => [...m, { id: assistantId, role: 'assistant', content: '' }])

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const { citations } = await chatStream(
        [...messages, userMsg].map(({ role, content }) => ({ role, content })),
        (chunk) => {
          setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg)))
        },
        abort.signal,
      )
      setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, citations } : msg)))
    } catch {
      setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: 'The connection frayed. Try again.' } : msg)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full min-h-[520px] flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-crimson to-electric text-white">
            <Bot size={17} />
          </span>
          <div>
            <div className="font-display text-sm font-bold uppercase tracking-wider text-white">LUMEN</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Arachnid Intelligence</div>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
            mode() === 'ai' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-ember/15 text-ember'
          }`}
        >
          {mode() === 'ai' ? '● AI Mode' : '● Demo Mode'}
        </span>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <span className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${m.role === 'user' ? 'bg-electric/20 text-blue-300' : 'bg-ember/15 text-ember'}`}>
              {m.role === 'user' ? <User size={13} /> : <Sparkles size={13} />}
            </span>
            <div className={`max-w-[82%] rounded-2xl border p-3.5 text-sm leading-relaxed ${m.role === 'user' ? 'rounded-tr-sm border-electric/25 bg-electric/10 text-white/90' : 'glass-edge glass rounded-tl-sm text-white/80'}`}>
              {m.content || (m.role === 'assistant' && <span className="inline-block h-4 w-2 animate-pulse bg-ember" />)}
              {m.citations && m.citations.length > 0 && m.role === 'assistant' && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.citations.map((c, i) => (
                    <span key={i} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/40">
                      📚 {c.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 transition hover:border-ember/50 hover:text-white">
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void send(input)
        }}
        className="glass flex items-center gap-2 rounded-2xl p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the Guardian, the multiverse, battles…"
          aria-label="Message LUMEN"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send message"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-crimson to-ember text-white transition hover:shadow-emberGlow disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}
