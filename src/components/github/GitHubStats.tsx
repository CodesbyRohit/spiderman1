import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, GitFork, AlertCircle, GitCommit, RefreshCw, ExternalLink } from 'lucide-react'
import { fetchGitHubBundle, type GitHubBundle } from '../../lib/github/api'
import { env } from '../../lib/env'

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/** Live GitHub repository intelligence for CodesbyRohit/spiderman1. */
export default function GitHubStats() {
  const [bundle, setBundle] = useState<GitHubBundle | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await fetchGitHubBundle()
    setBundle(data)
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading && !bundle) {
    return (
      <div className="glass glass-edge grid h-56 place-items-center rounded-2xl">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
          <RefreshCw size={16} className="animate-spin" /> Pulling live repo data…
        </div>
      </div>
    )
  }

  const repo = bundle?.repo

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] font-mono text-sm text-white">git</span>
          <div>
            <div className="font-display text-sm font-bold text-white">CodesbyRohit/spiderman1</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">Live from the GitHub API</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {bundle?.offline && (
            <span className="rounded-full bg-amber-400/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-300">offline sample</span>
          )}
          <button onClick={() => void load()} aria-label="Refresh stats" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:border-white/40 hover:text-white">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <a
            href={`https://github.com/${env.githubRepo}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70 transition hover:border-ember/50 hover:text-ember"
          >
            View on GitHub <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<Star size={16} />} label="Stars" value={repo ? fmt(repo.stars) : '—'} tone="text-amber-300" />
        <StatCard icon={<GitFork size={16} />} label="Forks" value={repo ? fmt(repo.forks) : '—'} tone="text-blue-300" />
        <StatCard icon={<AlertCircle size={16} />} label="Open issues" value={repo ? fmt(repo.openIssues) : '—'} tone="text-red-300" />
        <StatCard icon={<GitCommit size={16} />} label="Watchers" value={repo ? fmt(repo.watchers) : '—'} tone="text-emerald-300" />
      </div>

      <div className="glass glass-edge rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">Commit activity · 52 weeks</span>
          {repo?.language && <span className="rounded-md bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-white/60">{repo.language}</span>}
        </div>
        {bundle?.heatmap && bundle.heatmap.length > 0 ? (
          <Heatmap weeks={bundle.heatmap} />
        ) : (
          <p className="py-6 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-white/30">Commit data unavailable</p>
        )}
      </div>

      <div className="glass glass-edge rounded-2xl p-5">
        <span className="mb-3 block font-mono text-[10px] uppercase tracking-widest text-white/45">Recent commits</span>
        {bundle?.commits && bundle.commits.length > 0 ? (
          <div className="space-y-2">
            {bundle.commits.map((c) => (
              <div key={c.sha} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
                <span className="font-mono text-[10px] text-ember">{c.sha}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-white/75">{c.message}</span>
                <span className="hidden shrink-0 font-mono text-[10px] text-white/40 sm:block">{c.author}</span>
                <span className="hidden shrink-0 font-mono text-[10px] text-white/40 md:block">{new Date(c.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-white/30">No commit history yet — this is a fresh thread</p>
        )}
        {bundle?.offline && (
          <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
            No token configured (rate-limited) — add VITE_GITHUB_TOKEN for live data
          </p>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="glass glass-edge hud-corner rounded-xl p-4">
      <div className={`flex items-center gap-2 ${tone}`}>{icon}<span className="font-mono text-[9px] uppercase tracking-widest text-white/40">{label}</span></div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-3xl font-black text-white">{value}</motion.div>
    </div>
  )
}

function Heatmap({ weeks }: { weeks: { week: number; total: number }[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.total))
  const total = weeks.reduce((s, w) => s + w.total, 0)
  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {weeks.map((w, i) => {
          const level = w.total === 0 ? 0 : Math.min(4, Math.ceil((w.total / max) * 4))
          const colors = ['#16161f', '#2a1030', '#4a0f28', '#7a0f2a', '#dc143c']
          return (
            <div key={i} title={`${w.total} commits`} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: colors[level] }} />
          )
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9px] uppercase tracking-widest text-white/35">
        <span>{total} commits in the last year</span>
        <span>less ▁▂▃▄ more</span>
      </div>
    </div>
  )
}
