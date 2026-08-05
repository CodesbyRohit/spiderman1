import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { UNIVERSES, type Universe } from '../../lib/ai/knowledge/lore'
import { useGame } from '../../lib/gamification/game'
import { useReducedMotion } from '../../lib/hooks/core'

interface NodePos {
  u: Universe
  x: number
  y: number
}

/** Canvas-based zoomable multiverse map with animated web strands. */
export default function MultiverseMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const award = useGame((s) => s.award)
  const increment = useGame((s) => s.increment)

  const [hover, setHover] = useState<NodePos | null>(null)
  const [selected, setSelected] = useState<Universe | null>(null)
  const visited = useRef<Set<string>>(new Set())

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const W = () => canvas.clientWidth
    const H = () => canvas.clientHeight
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    // Layout: ring of universes around the Prime hub.
    const cx = W() / 2
    const cy = H() / 2
    const baseR = Math.min(W(), H()) * 0.32
    const nodes: NodePos[] = UNIVERSES.map((u, i) => {
      const angle = (i / UNIVERSES.length) * Math.PI * 2 - Math.PI / 2
      const jitter = 0.85 + (i % 3) * 0.1
      return { u, x: cx + Math.cos(angle) * baseR * jitter, y: cy + Math.sin(angle) * baseR * jitter }
    })
    const hub = nodes.find((n) => n.u.id === 'u01')!

    let zoom = 1
    let panX = 0
    let panY = 0
    let dragging = false
    let lastX = 0
    let lastY = 0
    let t = 0

    const project = (n: NodePos) => ({ x: (n.x - cx) * zoom + cx + panX, y: (n.y - cy) * zoom + cy + panY })

    const resize = () => {
      canvas.width = W() * dpr
      canvas.height = H() * dpr
    }
    resize()
    window.addEventListener('resize', resize)

    const hitTest = (mx: number, my: number): NodePos | null => {
      for (const n of nodes) {
        const p = project(n)
        if (Math.hypot(mx - p.x, my - p.y) < 22 / zoom + 8) return n
      }
      return null
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      if (dragging) {
        panX += e.clientX - lastX
        panY += e.clientY - lastY
        lastX = e.clientX
        lastY = e.clientY
      }
      setHover(hitTest(mx, my))
    }
    const onDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    }
    const onUp = (e: PointerEvent) => {
      dragging = false
      const rect = canvas.getBoundingClientRect()
      const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top)
      if (hit && !visited.current.has(hit.u.id)) {
        visited.current.add(hit.u.id)
        increment('universes', 1)
        if (visited.current.size >= 5) award('universe_5')
      }
      if (hit) setSelected(hit.u)
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoom = Math.min(3, Math.max(0.6, zoom * (e.deltaY < 0 ? 1.12 : 0.9)))
    }

    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    const draw = () => {
      t += 0.016
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W(), H())

      // web strands
      ctx.lineWidth = 1
      const strands: [NodePos, NodePos][] = []
      for (let i = 0; i < nodes.length; i++) strands.push([hub, nodes[i]])
      for (let i = 1; i < nodes.length; i++) strands.push([nodes[i - 1], nodes[i]])
      for (const [a, b] of strands) {
        const pa = project(a)
        const pb = project(b)
        const mx = (pa.x + pb.x) / 2 + Math.sin(t * 0.5 + a.u.danger * 6) * 14
        const my = (pa.y + pb.y) / 2 + Math.cos(t * 0.4 + b.u.danger * 5) * 14
        const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y)
        grad.addColorStop(0, `${a.u.color}55`)
        grad.addColorStop(1, `${b.u.color}55`)
        ctx.strokeStyle = grad
        ctx.beginPath()
        ctx.moveTo(pa.x, pa.y)
        ctx.quadraticCurveTo(mx, my, pb.x, pb.y)
        ctx.stroke()
        // traveling pulse
        const pulse = (t * 0.15) % 1
        const px = pa.x + (pb.x - pa.x) * pulse
        const py = pa.y + (pb.y - pa.y) * pulse
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(px, py, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }

      // nodes
      for (const n of nodes) {
        const p = project(n)
        const r = (n.u.id === 'u01' ? 12 : 8) / zoom + 2
        const pulse = 1 + Math.sin(t * 1.6 + n.u.danger * 8) * 0.15
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * pulse, 0, Math.PI * 2)
        ctx.fillStyle = n.u.color
        ctx.globalAlpha = 0.18
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.fillStyle = n.u.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 0.62, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 0.2, 0, Math.PI * 2)
        ctx.fill()
        // label
        ctx.font = '10px IBM Plex Mono, monospace'
        ctx.fillStyle = hover?.u.id === n.u.id ? '#fff' : 'rgba(255,255,255,0.45)'
        ctx.textAlign = 'center'
        ctx.fillText(n.u.code, p.x, p.y + r + 16)
      }
    }

    const loop = () => {
      draw()
      if (!reduced) raf = requestAnimationFrame(loop)
    }
    if (reduced) {
      draw()
    } else {
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('wheel', onWheel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return (
    <div className="relative">
      <div ref={wrapRef} className="relative h-[420px] overflow-hidden rounded-2xl border border-white/8 bg-black/30">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" aria-label="Interactive multiverse map" />
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none absolute z-10 rounded-xl border border-white/15 bg-black/75 px-4 py-3 backdrop-blur-md"
            style={{ left: Math.min(hover.x + 14, window.innerWidth - 240), top: hover.y - 90 }}
          >
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: hover.u.color }}>{hover.u.code} · danger {Math.round(hover.u.danger * 100)}%</div>
            <div className="font-display text-sm font-bold text-white">{hover.u.name}</div>
          </motion.div>
        )}
      </div>

      <div aria-live="polite" className="mt-4 min-h-[84px]">
        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass glass-edge hud-corner rounded-xl p-5">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ background: selected.color, boxShadow: `0 0 14px ${selected.color}` }} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">{selected.code}</span>
              <span className="font-display text-lg font-bold text-white">{selected.name}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{selected.desc}</p>
          </motion.div>
        ) : (
          <div className="flex h-full items-center px-2 font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">Scroll to zoom · drag to pan · visit universes</div>
        )}
      </div>
    </div>
  )
}
