import { AnimatePresence, motion } from 'framer-motion'
import { useApp, type Toast } from '../../lib/state/app'

/** Imperative entry point used across the app (e.g. achievements). */
export function pushToast(t: Omit<Toast, 'id'>) {
  useApp.getState().pushToast(t)
}

const TONES: Record<Toast['tone'], string> = {
  achievement: 'border-ember/50 text-ember',
  success: 'border-emerald-400/50 text-emerald-300',
  danger: 'border-crimson/60 text-red-300',
  info: 'border-electric/40 text-blue-200',
}

/** Fixed toast stack, bottom-right, above everything. */
export default function Toaster() {
  const toasts = useApp((s) => s.toasts)
  const dismiss = useApp((s) => s.dismissToast)

  return (
    <div aria-live="polite" className="fixed bottom-6 right-4 z-[130] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={() => dismiss(t.id)}
            className={`glass-edge glass-strong hud-corner cursor-pointer rounded-xl border p-4 text-left ${TONES[t.tone]}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl" aria-hidden>{t.icon ?? '🕸️'}</span>
              <div className="min-w-0">
                <div className="font-display text-xs font-semibold uppercase tracking-wider">{t.title}</div>
                {t.body && <div className="mt-0.5 text-xs leading-relaxed text-white/60">{t.body}</div>}
              </div>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
