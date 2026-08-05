import { LOREDOCS, type LoreDoc } from './lore'
import { VectorStore } from './vectorStore'

let store: VectorStore<LoreDoc> | null = null

export function getStore(): VectorStore<LoreDoc> {
  if (!store) {
    store = new VectorStore<LoreDoc>(LOREDOCS)
  }
  return store
}

export interface Retrieved {
  title: string
  excerpt: string
  score: number
}

/** Retrieve the top-k most relevant lore documents for a query. */
export function retrieve(query: string, k = 3): Retrieved[] {
  return getStore()
    .search(query, k)
    .map((r) => ({
      title: r.doc.title,
      excerpt: r.doc.content.slice(0, 320),
      score: Math.round(r.score * 1000) / 10,
    }))
}

/** Build a compact, cited context block to inject into an LLM prompt. */
export function buildContext(query: string, k = 3, maxChars = 2200): string {
  const hits = retrieve(query, k)
  if (!hits.length) return ''
  let out = '### Retrieved lore (with citations)\n'
  let used = 0
  for (const h of hits) {
    if (used + h.excerpt.length > maxChars) break
    out += `\n[${h.title}] ${h.excerpt}`
    used += h.excerpt.length
  }
  return out
}
