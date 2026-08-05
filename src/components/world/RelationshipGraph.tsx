import { useEffect, useRef, useState } from 'react'
import { CHARACTERS, type Character } from '../../lib/ai/knowledge/lore'

interface SimNode extends Character {
  x: number
  y: number
  vx: number
  vy: number
  els: {
    halo: SVGCircleElement
    body: SVGCircleElement
    core: SVGCircleElement
    dot: SVGCircleElement
    label: SVGTextElement
    g: SVGGElement
  }
}

const EDGES: [string, string][] = [
  ['arx', 'scarlet'],
  ['arx', 'silk'],
  ['arx', 'patriarch'],
  ['arx', 'quantum'],
  ['arx', 'vox'],
  ['arx', 'nullweave'],
  ['arx', 'widow'],
  ['silk', 'quantum'],
  ['scarlet', 'silk'],
  ['nullweave', 'widow'],
  ['nullweave', 'vox'],
  ['vox', 'widow'],
  ['patriarch', 'nullweave'],
]

const NS = 'http://www.w3.org/2000/svg'

/** Interactive force-directed graph of the ARACHNID cast — pure imperative SVG. */
export default function RelationshipGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selected, setSelected] = useState<Character | null>(null)
  const dragRef = useRef<string | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const W = svg.clientWidth
    const H = svg.clientHeight

    const mk = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>): SVGElementTagNameMap[K] => {
      const el = document.createElementNS(NS, tag)
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
      return el
    }

    const nodes: SimNode[] = CHARACTERS.map((c, i) => {
      const g = mk('g', {})
      const halo = mk('circle', { r: '18', fill: c.color, opacity: '0.12' })
      const body = mk('circle', { r: '9', fill: c.color, opacity: '0.75' })
      const core = mk('circle', { r: '3.2', fill: '#0a0a10' })
      const dot = mk('circle', { r: '1.3', fill: '#ffffff' })
      const label = mk('text', { y: '26', 'text-anchor': 'middle', 'font-size': '9', 'font-family': 'IBM Plex Mono, monospace', fill: 'rgba(255,255,255,0.55)' })
      label.textContent = c.name
      g.append(halo, body, core, dot, label)
      svg.appendChild(g)
      return {
        ...c,
        x: W / 2 + Math.cos((i / CHARACTERS.length) * Math.PI * 2) * Math.min(W, H) * 0.34,
        y: H / 2 + Math.sin((i / CHARACTERS.length) * Math.PI * 2) * Math.min(W, H) * 0.3,
        vx: 0,
        vy: 0,
        els: { halo, body, core, dot, label, g },
      }
    })
    const byId = new Map(nodes.map((n) => [n.id, n]))

    const lines: Record<string, SVGLineElement> = {}
    for (const [a, b] of EDGES) {
      const line = mk('line', { stroke: 'rgba(255,255,255,0.16)', 'stroke-width': '1', 'stroke-dasharray': '3 5' })
      svg.insertBefore(line, svg.firstChild)
      lines[`${a}-${b}`] = line
    }

    let raf = 0
    const tick = () => {
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d2 = Math.max(9, dx * dx + dy * dy)
          const d = Math.sqrt(d2)
          const f = 1500 / d2
          a.vx -= (dx / d) * f
          a.vy -= (dy / d) * f
          b.vx += (dx / d) * f
          b.vy += (dy / d) * f
        }
      }
      for (const [ida, idb] of EDGES) {
        const a = byId.get(ida)!
        const b = byId.get(idb)!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d = Math.max(1, Math.hypot(dx, dy))
        const f = (d - 130) * 0.012
        a.vx += (dx / d) * f
        a.vy += (dy / d) * f
        b.vx -= (dx / d) * f
        b.vy -= (dy / d) * f
      }
      for (const n of nodes) {
        if (n.id !== dragRef.current) {
          n.vx *= 0.85
          n.vy *= 0.85
          n.x = Math.max(30, Math.min(W - 30, n.x + n.vx))
          n.y = Math.max(30, Math.min(H - 30, n.y + n.vy))
        }
        n.els.g.setAttribute('transform', `translate(${n.x},${n.y})`)
      }
      for (const [a, b] of EDGES) {
        const na = byId.get(a)!
        const nb = byId.get(b)!
        const line = lines[`${a}-${b}`]
        if (line) {
          line.setAttribute('x1', String(na.x))
          line.setAttribute('y1', String(na.y))
          line.setAttribute('x2', String(nb.x))
          line.setAttribute('y2', String(nb.y))
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const hovered = (id: string | null) => {
      for (const n of nodes) {
        const on = n.id === id
        n.els.halo.setAttribute('r', on ? '24' : '18')
        n.els.halo.setAttribute('opacity', on ? '0.2' : '0.12')
        n.els.body.setAttribute('r', on ? '12' : '9')
        n.els.label.setAttribute('fill', on ? '#ffffff' : 'rgba(255,255,255,0.55)')
      }
    }

    const hitTest = (mx: number, my: number): string | null => {
      let best: string | null = null
      let bestD = 26
      for (const n of nodes) {
        const d = Math.hypot(mx - n.x, my - n.y)
        if (d < bestD) {
          bestD = d
          best = n.id
        }
      }
      return best
    }

    const onMove = (e: PointerEvent) => {
      const rect = svg.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const id = dragRef.current
      if (id) {
        const n = byId.get(id)
        if (n) {
          n.x = mx
          n.y = my
        }
        return
      }
      hovered(hitTest(mx, my))
    }
    const onDown = (e: PointerEvent) => {
      const rect = svg.getBoundingClientRect()
      const id = hitTest(e.clientX - rect.left, e.clientY - rect.top)
      if (id) {
        dragRef.current = id
        hovered(id)
      }
    }
    const onUp = () => {
      if (dragRef.current) {
        const c = byId.get(dragRef.current)
        if (c) setSelected(c)
      }
      dragRef.current = null
      hovered(null)
    }

    svg.addEventListener('pointermove', onMove)
    svg.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    return () => {
      cancelAnimationFrame(raf)
      svg.removeEventListener('pointermove', onMove)
      svg.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      svg.replaceChildren()
    }
  }, [])

  return (
    <div className="relative">
      <svg ref={svgRef} className="h-[320px] w-full cursor-crosshair" role="img" aria-label="Relationship graph of the ARACHNID cast" />
      <div aria-live="polite" className="mt-4 min-h-[64px]">
        {selected ? (
          <div className="glass glass-edge hud-corner rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ background: selected.color, boxShadow: `0 0 12px ${selected.color}` }} />
              <span className="font-display text-sm font-bold text-white">{selected.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">{selected.role}</span>
            </div>
            <p className="mt-1.5 text-sm text-white/60">{selected.blurb}</p>
          </div>
        ) : (
          <div className="flex h-full items-center px-2 font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">Drag nodes · click to inspect a character</div>
        )}
      </div>
    </div>
  )
}
