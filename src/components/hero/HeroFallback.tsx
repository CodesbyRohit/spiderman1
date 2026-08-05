import { useEffect, useRef } from 'react'
import type { TimeOfDay } from '../../lib/state/app'
import { TOD_CONFIG } from './heroData'

interface Props {
  tod: TimeOfDay
  reducedMotion: boolean
}

/** A compact 2D-canvas skyline so the experience survives without WebGL. */
export default function HeroFallback({ tod, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cfg = TOD_CONFIG[tod]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const buildings: { x: number; w: number; h: number; seed: number; color: string }[] = []
    const rng = () => Math.random()
    for (let i = 0; i < 60; i++) {
      const w = 12 + rng() * 30
      const h = 60 + rng() * 220
      buildings.push({
        x: (i * 34) % 1400 - 100,
        w,
        h,
        seed: rng() * 1000,
        color: `hsl(${210 + rng() * 30}, ${20 + rng() * 20}%, ${8 + rng() * 8}%)`,
      })
    }

    let raf = 0
    let t = 0
    const rain: { x: number; y: number; s: number }[] = Array.from({ length: 220 }, () => ({ x: rng() * 1600, y: rng() * 900, s: 10 + rng() * 14 }))

    const resize = () => {
      canvas.width = canvas.clientWidth * devicePixelRatio
      canvas.height = canvas.clientHeight * devicePixelRatio
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // sky
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, cfg.skyClass.includes('dawn') ? '#241040' : cfg.skyClass.includes('day') ? '#101c3a' : cfg.skyClass.includes('dusk') ? '#1c0c2e' : '#05050e')
      g.addColorStop(1, cfg.fogColor)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // lightning flash
      if (Math.random() < 0.004 * (cfg.lightningFreq < 10 ? 1 : 0.2)) {
        ctx.fillStyle = 'rgba(220,230,255,0.35)'
        ctx.fillRect(0, 0, w, h)
      }

      // buildings
      for (const b of buildings) {
        const x = b.x - 60
        const y = h - b.h * (h / 900)
        ctx.fillStyle = b.color
        ctx.fillRect(x, y, b.w * (h / 900), b.h * (h / 900))
        // windows
        const cols = Math.floor((b.w * (h / 900)) / 8)
        const rows = Math.floor((b.h * (h / 900)) / 14)
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const seed = Math.sin(b.seed + c * 3.1 + r * 7.7) * 43758.5453
            if (Math.abs(seed - Math.floor(seed)) < 0.32 + (1 - cfg.daylight) * 0.3) {
              const tw = 0.6 + 0.4 * Math.sin(t * 2 + b.seed + c + r)
              ctx.fillStyle = `rgba(255,235,180,${(0.25 + (1 - cfg.daylight) * 0.7) * tw})`
              ctx.fillRect(x + 2 + c * 8, y + 4 + r * 14, 4, 7)
            }
          }
        }
      }

      // rain
      if (cfg.rainOpacity > 0.03) {
        ctx.strokeStyle = `rgba(170,200,255,${0.25 * cfg.rainOpacity})`
        for (const r of rain) {
          r.y += r.s * 1.6
          r.x -= 2
          if (r.y > h) {
            r.y = -10
            r.x = rng() * 1600
          }
          ctx.beginPath()
          ctx.moveTo(r.x, r.y)
          ctx.lineTo(r.x - 4, r.y - 12)
          ctx.stroke()
        }
      }

      // fog band
      const fogY = h * (0.82 + Math.sin(t * 0.2) * 0.02)
      const fg = ctx.createLinearGradient(0, fogY, 0, h)
      fg.addColorStop(0, 'rgba(150,165,200,0.12)')
      fg.addColorStop(1, 'rgba(150,165,200,0)')
      ctx.fillStyle = fg
      ctx.fillRect(0, fogY, w, h - fogY)
    }

    const loop = () => {
      t += 0.016
      draw()
      raf = requestAnimationFrame(loop)
    }

    const cleanup = () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }

    if (reducedMotion) {
      draw()
      return cleanup
    }
    raf = requestAnimationFrame(loop)
    return cleanup
  }, [cfg, reducedMotion])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
}
