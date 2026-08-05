import { useEffect } from 'react'
import { useApp } from './lib/state/app'
import { useGame } from './lib/gamification/game'
import { levelFromXp } from './lib/gamification/achievements'
import { useLenis } from './lib/hooks/useLenis'
import { setScrollApi } from './lib/scrollApi'
import { useReducedMotion } from './lib/hooks/core'
import { todFromHour, TOD_CONFIG } from './components/hero/heroData'
import { engine } from './lib/audio/engine'
import { useKonami } from './secrets/konami'
import { installConsoleSurprises } from './secrets/consoleSurprises'

import LoadingScreen from './components/ui/LoadingScreen'
import HUD from './components/ui/HUD'
import SettingsPanel from './components/ui/SettingsPanel'
import Toaster from './components/ui/Toaster'
import Grain from './components/fx/Grain'
import Cursor from './components/fx/Cursor'
import WebShoot from './components/fx/WebShoot'
import SpiderSenseOverlay from './components/fx/SpiderSenseOverlay'
import PortalTransition from './components/fx/PortalTransition'
import Hero from './components/hero/Hero'
import Story from './components/chapters/Story'
import WorldSection from './components/world/WorldSection'
import StatsSection from './components/StatsSection'
import Footer from './components/Footer'
import Lab from './components/lab/Lab'
import GamificationPanel from './components/gamification/GamificationPanel'
import DevOverlay from './secrets/DevOverlay'

export default function App() {
  const reduced = useReducedMotion()
  const setReducedMotion = useApp((s) => s.setReducedMotion)
  const booted = useApp((s) => s.booted)
  const { tod, todAuto, retro, soundOn, setTod, triggerSense, setLabOpen, setSettingsOpen, setDev, cycleTod } = useApp()
  const xp = useGame((s) => s.xp)

  useKonami()

  // Smooth scroll + expose the API globally for components.
  const lenis = useLenis(reduced)
  useEffect(() => {
    setScrollApi(lenis)
  }, [lenis])

  // Reduce-motion preference into the store.
  useEffect(() => {
    setReducedMotion(reduced)
  }, [reduced, setReducedMotion])

  // Follow the visitor's local clock in auto mode.
  useEffect(() => {
    if (!todAuto) return
    setTod(todFromHour(new Date().getHours()))
    const iv = window.setInterval(() => setTod(todFromHour(new Date().getHours())), 60_000)
    return () => window.clearInterval(iv)
  }, [todAuto, setTod])

  // Console secrets + engine sync after boot.
  useEffect(() => {
    if (!booted) return
    installConsoleSurprises()
    engine.setEnabled(soundOn)
  }, [booted, soundOn])

  // Retro mode visual filter.
  useEffect(() => {
    document.body.classList.toggle('retro-mode', retro)
    document.body.classList.toggle('retro-font', retro)
    return () => {
      document.body.classList.remove('retro-mode', 'retro-font')
    }
  }, [retro])

  // Level milestones as XP grows.
  useEffect(() => {
    const level = levelFromXp(xp).level
    if (level >= 10) useGame.getState().award('level_10')
    else if (level >= 5) useGame.getState().award('level_5')
  }, [xp])

  // Global keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return
      switch (e.key.toLowerCase()) {
        case 'x':
          triggerSense()
          break
        case 'm':
          useApp.getState().setSound(!soundOn)
          engine.setEnabled(!soundOn)
          break
        case 't':
          cycleTod()
          break
        case 'l':
          setLabOpen(!useApp.getState().labOpen)
          break
        case 's':
          setSettingsOpen(!useApp.getState().settingsOpen)
          break
        case 'd':
          setDev(!useApp.getState().dev)
          break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          document.querySelector(`#ch${e.key}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [triggerSense, cycleTod, setLabOpen, setSettingsOpen, setDev, soundOn, reduced])

  const sky = TOD_CONFIG[tod].skyClass

  return (
    <div className="relative min-h-screen">
      {/* time-of-day sky */}
      <div className={`tod-sky ${sky}`} aria-hidden />

      {/* fixed cinematic FX */}
      <Grain />
      <Cursor />
      <WebShoot />
      <SpiderSenseOverlay />
      <PortalTransition />
      <Toaster />

      <a href="#top" className="skip-link">Skip to content</a>

      <HUD />

      <main id="content">
        <Hero />
        <Story />
        <WorldSection />
        <StatsSection />
      </main>

      <Footer />

      {/* overlays */}
      <Lab />
      <SettingsPanel />
      <GamificationPanel />
      <DevOverlay />
      <LoadingScreen />
    </div>
  )
}
