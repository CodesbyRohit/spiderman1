import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface PanelProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  width?: string
  lockScroll?: boolean
}

/** Fullscreen glass modal with portal-style entrance. */
export default function Panel({ open, onClose, title, subtitle, children, width = 'max-w-6xl', lockScroll = true }: PanelProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = lockScroll ? 'hidden' : ''
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, lockScroll])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`glass-strong glass-edge hud-corner relative z-10 flex max-h-[92vh] w-full ${width} flex-col overflow-hidden rounded-2xl`}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-7">
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-widest">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-white/50">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-white/70 transition hover:border-ember/60 hover:text-ember"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-7">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
