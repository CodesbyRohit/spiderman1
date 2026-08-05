import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/**
 * The static #boot splash in index.html is a first-paint placeholder with an
 * opaque background and z-index 9999. Nothing else ever hides it, so once
 * React is mounted it would cover the whole app and swallow every click
 * (the app's own top layer is only z-[200]). Remove it as soon as React takes
 * over, with a load-event + timer fallback so the boot gate can never stick.
 */
const removeBootSplash = () => {
  document.getElementById('boot')?.remove()
}
removeBootSplash()
window.addEventListener('load', removeBootSplash)
window.setTimeout(removeBootSplash, 3000)

// Optional PWA shell caching in production builds.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* SW optional */
    })
  })
}
