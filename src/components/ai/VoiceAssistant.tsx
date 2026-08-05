import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff } from 'lucide-react'
import { useApp } from '../../lib/state/app'
import { useGame } from '../../lib/gamification/game'
import { scrollApi } from '../../lib/scrollApi'
import { engine } from '../../lib/audio/engine'
import { env } from '../../lib/env'

type Status = 'idle' | 'listening' | 'heard' | 'unsupported'

const COMMANDS: { match: RegExp; label: string; run: () => void }[] = [
  { match: /spider[- ]?sense|danger|alert/i, label: 'Triggering Spider-Sense', run: () => useApp.getState().triggerSense() },
  { match: /open (the )?lab|lab/i, label: 'Opening the AI Lab', run: () => useApp.getState().setLabOpen(true) },
  { match: /open (the )?achievements|achievement|troph/i, label: 'Opening achievements', run: () => useApp.getState().setGameOpen(true) },
  { match: /settings/, label: 'Opening settings', run: () => useApp.getState().setSettingsOpen(true) },
  { match: /night mode|dark mode/i, label: 'Night mode engaged', run: () => useApp.getState().setTod('night') },
  { match: /day mode|morning/i, label: 'Day mode engaged', run: () => useApp.getState().setTod('day') },
  { match: /dusk|sunset/i, label: 'Dusk engaged', run: () => useApp.getState().setTod('dusk') },
  { match: /dawn|sunrise/i, label: 'Dawn engaged', run: () => useApp.getState().setTod('dawn') },
  { match: /sound on|audio on|unmute/i, label: 'Sound on', run: () => { useApp.getState().setSound(true); engine.setEnabled(true) } },
  { match: /sound off|mute/i, label: 'Sound off', run: () => { useApp.getState().setSound(false); engine.setEnabled(false) } },
  { match: /go to story|chapter/i, label: 'Navigating to the story', run: () => scrollApi.scrollTo('#story', { offset: -60 }) },
  { match: /go to world|multiverse|timeline/i, label: 'Navigating to the world', run: () => scrollApi.scrollTo('#world', { offset: -60 }) },
  { match: /who are you|what are you/i, label: 'I am LUMEN, the ARACHNID assistant', run: () => {} },
  { match: /hello|hey/i, label: 'Hello, traveler of the web', run: () => {} },
]

/** Voice Assistant — speaks commands, responds via TTS. Web Speech API. */
export default function VoiceAssistant() {
  const [status, setStatus] = useState<Status>('idle')
  const [heard, setHeard] = useState('')
  const [log, setLog] = useState<{ time: string; text: string }[]>([])
  const recRef = useRef<SpeechRecognition | null>(null)
  const supported = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
  const award = useGame((s) => s.award)
  const increment = useGame((s) => s.increment)

  useEffect(() => {
    if (!supported) {
      setStatus('unsupported')
      return
    }
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition!
    const rec = new Ctor()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onstart = () => setStatus('listening')
    rec.onerror = () => setStatus('idle')
    rec.onend = () => setStatus((s) => (s === 'listening' ? 'idle' : s))
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? ''
      setHeard(text)
      setStatus('heard')
      increment('voiceUses', 1)
      award('voice_use')

      const cmd = COMMANDS.find((c) => c.match.test(text))
      const response = cmd ? cmd.label : `I heard "${text}". I can open the lab, trigger spider-sense, switch day and night, or navigate the story.`
      setLog((l) => [...l.slice(-6), { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `${cmd ? '✓ ' : ''}${response}` }])
      if (cmd) cmd.run()
      speak(response)
    }
    recRef.current = rec
    return () => rec.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported])

  const toggle = () => {
    const rec = recRef.current
    if (!rec) return
    if (status === 'listening') {
      rec.stop()
      setStatus('idle')
    } else {
      rec.start()
    }
  }

  const speak = (text: string) => {
    if (!env.voiceEnabled || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.02
    u.pitch = 0.9
    window.speechSynthesis.speak(u)
  }

  if (status === 'unsupported' || !env.voiceEnabled) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 text-center">
        <MicOff size={28} className="text-white/25" />
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">Voice commands unsupported in this browser</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-6">
      <button
        onClick={toggle}
        aria-label={status === 'listening' ? 'Stop listening' : 'Start listening'}
        className={`relative grid h-28 w-28 place-items-center rounded-full border transition-all duration-300 ${
          status === 'listening' ? 'border-ember bg-ember/15 text-ember' : 'border-white/20 bg-white/[0.04] text-white/70 hover:border-ember/60 hover:text-ember'
        }`}
      >
        {status === 'listening' && (
          <motion.span className="absolute inset-0 rounded-full border-2 border-ember/50" animate={{ scale: [1, 1.5], opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 1.4 }} />
        )}
        {status === 'listening' ? <Mic size={34} className="animate-pulse" /> : <Mic size={30} />}
      </button>

      <div className="text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/60">{status === 'listening' ? 'Listening…' : 'Tap to speak'}</div>
        {heard && <div className="mt-2 text-sm italic text-white/70">“{heard}”</div>}
      </div>

      <div className="w-full max-w-md space-y-2">
        {log.length === 0 ? (
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
            try: “trigger spider-sense” · “open the lab” · “night mode”
          </p>
        ) : (
          log.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass flex items-start gap-3 rounded-xl px-4 py-2.5 text-sm text-white/75">
              <span className="mt-0.5 font-mono text-[9px] text-white/35">{l.time}</span>
              {l.text}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
