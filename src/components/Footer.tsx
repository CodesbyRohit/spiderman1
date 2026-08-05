import { useRef, useState } from 'react'
import { Github, Heart, Shield } from 'lucide-react'
import { useApp } from '../lib/state/app'
import { useGame } from '../lib/gamification/game'
import { engine } from '../lib/audio/engine'
import { APP } from '../lib/constants'
import { UNIVERSES } from '../lib/ai/knowledge/lore'

/** Footer — credits, live repo link, and the hidden portal. */
export default function Footer() {
  const setDev = useApp((s) => s.setDev)
  const taps = useRef(0)
  const timer = useRef<number | null>(null)
  const [portalGlow, setPortalGlow] = useState(false)
  const award = useGame((s) => s.award)

  const portalTap = () => {
    taps.current += 1
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      taps.current = 0
    }, 1600)
    if (taps.current >= 3) {
      taps.current = 0
      setPortalGlow(true)
      setDev(true)
      award('portal')
      engine.portal()
      window.setTimeout(() => setPortalGlow(false), 2400)
    }
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/8">
      {/* universe marquee */}
      <div className="border-b border-white/5 py-3 opacity-60">
        <div className="marquee-track font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
          {[...UNIVERSES, ...UNIVERSES].map((u, i) => (
            <span key={i} className="flex items-center gap-2">
              <span style={{ color: u.color }}>{u.code}</span>
              <span>{u.name}</span>
              <span className="text-white/15">·</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-crimson to-ember text-sm font-black text-white">A</span>
            <span className="font-display text-lg font-bold tracking-[0.25em] text-white">ARACHNID<span className="text-ember">.</span></span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
            A cinematic, AI-powered interactive experience — an original arachnid-inspired universe built with
            React, TypeScript, Three.js and a layered AI engine. No copyrighted characters. All lore, suits and
            universes are original creations.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['React 18', 'TypeScript', 'Vite', 'Three.js', 'R3F', 'GSAP', 'Framer Motion', 'Tailwind', 'Lenis', 'Zustand'].map((t) => (
              <span key={t} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-white/45">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ['Story', '#story'],
              ['World', '#world'],
              ['AI Lab', 'lab'],
              ['Stats', '#stats'],
            ].map(([label, target]) => (
              <li key={label}>
                <button
                  onClick={() => {
                    if (target === 'lab') useApp.getState().setLabOpen(true)
                    else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-white/60 transition hover:text-ember"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">The Thread</h4>
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            Built as a flagship portfolio project. Every scroll should reveal something unexpected —
            try pressing <kbd className="rounded border border-white/15 bg-black/30 px-1.5 font-mono text-[10px] text-ember">X</kbd>,{' '}
            the Konami code, or open the browser console.
          </p>
          <a
            href={`https://github.com/${APP.githubRepo}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm text-white/75 transition hover:border-ember/50 hover:text-ember"
          >
            <Github size={15} /> CodesbyRohit/spiderman1
          </a>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
            <Heart size={11} className="text-ember" /> Original IP · {new Date().getFullYear()} · The web never sleeps
          </p>
          <button
            onClick={portalTap}
            aria-label="Hidden portal"
            className={`group relative grid h-10 w-10 place-items-center rounded-full border transition-all duration-500 ${
              portalGlow ? 'border-violet bg-violet/25 text-violet shadow-[0_0_30px_rgba(123,47,247,0.8)]' : 'border-white/15 text-white/40 hover:border-white/40 hover:text-white'
            }`}
          >
            <Shield size={15} className="transition group-hover:rotate-12" />
            {portalGlow && <span className="absolute inset-0 animate-ping rounded-full bg-violet/40" />}
          </button>
        </div>
      </div>
    </footer>
  )
}
