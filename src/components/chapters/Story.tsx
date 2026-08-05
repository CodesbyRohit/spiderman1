import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from './chapters'
import ChapterParticles from './ChapterParticles'
import { useGame } from '../../lib/gamification/game'
import { useReducedMotion } from '../../lib/hooks/core'

gsap.registerPlugin(ScrollTrigger)

/** Scroll-driven storytelling: five chapters, each with its own atmosphere. */
export default function Story() {
  const root = useRef<HTMLElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      // Chapter progress rail
      gsap.to(rail.current, {
        height: '100%',
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
      })
      // Per-chapter progress ring highlight
      CHAPTERS.forEach((ch, i) => {
        ScrollTrigger.create({
          trigger: `#${ch.id}`,
          start: 'top 62%',
          onEnter: () => {
            const stats = useGame.getState().stats
            if (i + 1 > stats.chapters) {
              useGame.setState({ stats: { ...stats, chapters: i + 1 } })
              if (i >= 1) useGame.getState().award('story_scroll')
            }
          },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={root} id="story" aria-label="Story chapters" className="relative">
      {/* progress rail */}
      <div className="fixed left-5 top-1/2 z-[60] hidden h-[46vh] w-px -translate-y-1/2 bg-white/10 md:block">
        <div ref={rail} className="h-0 w-full bg-gradient-to-b from-ember via-electric to-violet" />
      </div>

      {CHAPTERS.map((ch, i) => (
        <article
          key={ch.id}
          id={ch.id}
          className="relative flex min-h-[100svh] items-center overflow-hidden border-b border-white/5"
          style={{ background: `radial-gradient(1000px 500px at ${i % 2 ? '80%' : '20%'} 70%, ${ch.accentSoft}, transparent 60%), #060609` }}
        >
          {/* chapter ambience */}
          <div className="pointer-events-none absolute -top-24 right-[8%] h-72 w-72 rounded-full blur-[100px]" style={{ background: ch.glow, opacity: 0.5 }} />
          <ChapterParticles kind={ch.particleKind} accent={ch.accent} />

          <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 py-24 md:grid-cols-[auto_1fr] md:px-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(5rem,16vw,11rem)] font-extrabold leading-none"
              style={{ color: ch.accent, textShadow: `0 0 60px ${ch.glow}` }}
            >
              {ch.number}
            </motion.div>

            <div className="flex max-w-2xl flex-col justify-center">
              <motion.span
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.6 }}
                className="mb-3 font-mono text-[11px] uppercase tracking-[0.5em]"
                style={{ color: ch.accent }}
              >
                {ch.kicker}
              </motion.span>

              <h2 className="font-display text-4xl font-extrabold uppercase tracking-tight text-white md:text-6xl">
                <span className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: '105%' }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  >
                    {ch.title}
                  </motion.span>
                </span>
              </h2>

              <div className="mt-6 space-y-4">
                {ch.paragraphs.map((p, pi) => (
                  <motion.p
                    key={pi}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.4 }}
                    transition={{ duration: 0.7, delay: 0.25 + pi * 0.18 }}
                    className="text-base leading-relaxed text-white/65 md:text-lg"
                  >
                    {p}
                  </motion.p>
                ))}
              </div>

              {/* chapter footer nav */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ delay: 0.7 }}
                className="mt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40"
              >
                <span>
                  {String(i + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}
                </span>
                <span className="h-px w-16" style={{ background: ch.accent }} />
                <span>{i < CHAPTERS.length - 1 ? 'keep scrolling' : 'the web continues'}</span>
              </motion.div>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
