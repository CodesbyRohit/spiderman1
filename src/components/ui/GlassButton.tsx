import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Magnetic from './Magnetic'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop'> {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'glass' | 'danger'
  magnetic?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const VARIANTS: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-crimson to-ember text-white shadow-emberGlow hover:shadow-[0_0_40px_rgba(255,59,59,0.6)] border border-white/10',
  ghost: 'bg-transparent text-frost border border-white/15 hover:border-white/40 hover:bg-white/5',
  glass: 'glass text-frost hover:bg-white/[0.08]',
  danger: 'bg-crimson/20 text-red-300 border border-crimson/50 hover:bg-crimson/30',
}

const SIZES: Record<string, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

/** A glassy, magnetic, hover-glow CTA button. */
export default function GlassButton({ children, variant = 'primary', magnetic = true, size = 'md', className = '', ...rest }: Props) {
  const btn = (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={`group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl font-display font-semibold uppercase tracking-wider transition-colors duration-300 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {/* sheen sweep on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
  return magnetic ? <Magnetic>{btn}</Magnetic> : btn
}
