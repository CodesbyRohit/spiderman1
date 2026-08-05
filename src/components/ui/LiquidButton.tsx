import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

/** Experimental "liquid" button — an energy blob chases the cursor inside the glass. */
export default function LiquidButton({ children, className = '', ...rest }: Props) {
  const blob = useRef<HTMLSpanElement>(null)

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const b = blob.current
    if (!b) return
    const rect = e.currentTarget.getBoundingClientRect()
    b.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) scale(1)`
  }

  return (
    <button
      onMouseMove={onMove}
      onMouseLeave={() => {
        if (blob.current) blob.current.style.transform = 'translate(-50%,-50%) scale(0)'
      }}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-frost backdrop-blur-md transition-colors hover:border-white/35 ${className}`}
      {...rest}
    >
      <span
        ref={blob}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-28 w-28 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full opacity-40 blur-xl transition-transform duration-500 ease-out"
        style={{ background: 'radial-gradient(circle, rgba(255,59,59,0.9), rgba(47,107,255,0.6) 55%, transparent 75%)' }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  )
}
