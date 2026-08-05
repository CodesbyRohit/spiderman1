import { env } from '../env'

export interface RepoStats {
  stars: number
  forks: number
  openIssues: number
  watchers: number
  language: string | null
  description: string
  pushedAt: string | null
  license: string | null
}

export interface CommitActivity {
  week: number
  total: number
}

export interface RecentCommit {
  sha: string
  message: string
  author: string
  date: string
}

export interface GitHubBundle {
  repo: RepoStats | null
  heatmap: CommitActivity[] | null
  commits: RecentCommit[] | null
  fetchedAt: number
  offline: boolean
}

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
const FETCH_TIMEOUT = 12_000 // hard ceiling: a hung API must never stall the UI
const KEY = 'arachnid-gh-v1'

async function gh<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (env.githubToken) headers.Authorization = `Bearer ${env.githubToken}`
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  const onOuterAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onOuterAbort)
  }
  try {
    const res = await fetch(`https://api.github.com${path}`, { headers, signal: controller.signal })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
    signal?.removeEventListener('abort', onOuterAbort)
  }
}

/** Fetch all repo data with caching. Never throws — falls back to cache/offline. */
export async function fetchGitHubBundle(signal?: AbortSignal): Promise<GitHubBundle> {
  try {
    const cachedRaw = localStorage.getItem(KEY)
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw) as GitHubBundle
      if (cached && typeof cached.fetchedAt === 'number' && Date.now() - cached.fetchedAt < CACHE_TTL) {
        return cached
      }
    }
  } catch {
    /* corrupt cache — ignore and refetch */
  }

  const repo = await gh<{
    stargazers_count: number
    forks_count: number
    open_issues_count: number
    subscribers_count: number
    language: string | null
    description: string | null
    pushed_at: string | null
    license: { name: string } | null
  }>(`/repos/${env.githubRepo}`, signal)

  const activity = await gh<{ week: number; total: number }[]>(`/repos/${env.githubRepo}/stats/commit_activity`, signal)
  const commits = await gh<
    { sha: string; commit: { message: string; author: { name: string; date: string } } }[]
  >(`/repos/${env.githubRepo}/commits?per_page=10`, signal)

  const bundle: GitHubBundle = {
    repo: repo
      ? {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count,
          watchers: repo.subscribers_count,
          language: repo.language,
          description: repo.description ?? '',
          pushedAt: repo.pushed_at,
          license: repo.license?.name ?? null,
        }
      : null,
    heatmap: activity ?? null,
    commits: commits?.map((c) => ({ sha: c.sha.slice(0, 7), message: c.commit.message.split('\n')[0], author: c.commit.author.name, date: c.commit.author.date })) ?? null,
    fetchedAt: Date.now(),
    offline: repo === null,
  }

  try {
    localStorage.setItem(KEY, JSON.stringify(bundle))
  } catch {
    /* ignore */
  }
  return bundle
}
