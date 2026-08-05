import { motion } from 'framer-motion'
import GitHubStats from './github/GitHubStats'

/** Live statistics — GitHub repository intelligence and the build stack. */
export default function StatsSection() {
  return (
    <section id="stats" aria-label="Live statistics" className="relative mx-auto max-w-7xl px-5 py-24 md:px-8">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }}>
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-electric to-transparent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.45em] text-white/50">Live Statistics</span>
        </div>
        <h2 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight md:text-6xl">
          The repository, <span className="grad-text">in real time</span>
        </h2>
        <p className="mt-3 max-w-xl text-white/60">
          Pulled live from the GitHub API — stars, forks, issues, contribution heatmap and recent commits for{' '}
          <span className="font-mono text-ember">CodesbyRohit/spiderman1</span>.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-10">
        <GitHubStats />
      </motion.div>
    </section>
  )
}
