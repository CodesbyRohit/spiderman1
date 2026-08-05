/**
 * A dependency-free TF-IDF vector store.
 *
 * Enables RAG-style semantic-ish retrieval over the lore corpus in the
 * browser (Demo Mode). When a real LLM provider is configured, the same
 * retrieval results are injected into the prompt as cited context.
 */

export interface VectorDoc {
  id: string
  title: string
  content: string
  tags: string[]
}

interface IndexedDoc extends VectorDoc {
  terms: Map<string, number> // raw counts
  norm: number
}

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'to', 'of', 'in', 'on', 'at', 'for', 'with', 'about', 'his', 'her', 'its',
  'it', 'he', 'she', 'they', 'them', 'you', 'your', 'this', 'that', 'these',
  'those', 'what', 'who', 'how', 'why', 'when', 'where', 'which', 'has', 'have',
  'had', 'do', 'does', 'did', 'not', 'no', 'can', 'could', 'will', 'would', 'should',
])

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
}

export class VectorStore<T extends VectorDoc = VectorDoc> {
  private docs: IndexedDoc[] = []
  private idf = new Map<string, number>()

  constructor(docs: T[] = []) {
    if (docs.length) this.addAll(docs)
  }

  add(doc: T): void {
    const terms = new Map<string, number>()
    for (const t of tokenize(`${doc.title} ${doc.content} ${doc.tags.join(' ')}`)) {
      terms.set(t, (terms.get(t) ?? 0) + 1)
    }
    let norm = 0
    for (const c of terms.values()) norm += c * c
    norm = Math.sqrt(norm)
    this.docs.push({ ...doc, terms, norm })
    this.rebuildIdf()
  }

  addAll(docs: T[]): void {
    for (const d of docs) {
      const terms = new Map<string, number>()
      for (const t of tokenize(`${d.title} ${d.content} ${d.tags.join(' ')}`)) {
        terms.set(t, (terms.get(t) ?? 0) + 1)
      }
      let norm = 0
      for (const c of terms.values()) norm += c * c
      norm = Math.sqrt(norm)
      this.docs.push({ ...d, terms, norm })
    }
    this.rebuildIdf()
  }

  private rebuildIdf(): void {
    const df = new Map<string, number>()
    for (const d of this.docs) {
      for (const t of d.terms.keys()) df.set(t, (df.get(t) ?? 0) + 1)
    }
    const n = Math.max(1, this.docs.length)
    this.idf = new Map()
    for (const [t, count] of df) this.idf.set(t, Math.log(1 + n / count))
  }

  private queryVec(query: string): { vec: Map<string, number>; norm: number } {
    const vec = new Map<string, number>()
    for (const t of tokenize(query)) vec.set(t, (vec.get(t) ?? 0) + 1)
    let norm = 0
    for (const c of vec.values()) norm += c * c
    return { vec, norm: Math.sqrt(norm) }
  }

  /** Cosine similarity search. Returns docs with a 0..1 score. */
  search(query: string, k = 4): { doc: T; score: number }[] {
    const { vec, norm } = this.queryVec(query)
    if (norm === 0) return []
    const scored: { doc: T; score: number }[] = []
    for (const d of this.docs) {
      let dot = 0
      for (const [t, qw] of vec) {
        const dw = d.terms.get(t)
        if (dw !== undefined) dot += (qw * (this.idf.get(t) ?? 0)) * (dw * (this.idf.get(t) ?? 0))
      }
      if (dot === 0 || d.norm === 0) continue
      scored.push({ doc: d as unknown as T, score: dot / (norm * d.norm) })
    }
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, k)
  }

  get size(): number {
    return this.docs.length
  }
}

export const tokenCount = (text: string): number => text.split(/\s+/).filter(Boolean).length
