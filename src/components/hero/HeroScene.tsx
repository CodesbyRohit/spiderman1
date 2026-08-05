import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { TimeOfDay, Quality } from '../../lib/state/app'
import { TOD_CONFIG } from './heroData'
import { createCity, createCityLife, createGuardian, createParticles, createWeather, disposeScene, makeFlashBus } from './builders'
import { useMediaQuery } from '../../lib/hooks/core'

interface SceneProps {
  tod: TimeOfDay
  quality: Quality
  active: boolean
  reducedMotion: boolean
}

function SceneContents({ tod, reducedMotion }: { tod: TimeOfDay; reducedMotion: boolean }) {
  const pointer = useThree((s) => s.pointer)
  const cfg = TOD_CONFIG[tod]

  const { city, weather, particles, guardian, life, flashBus } = useMemo(() => {
    return {
      city: createCity(),
      weather: createWeather(),
      particles: createParticles(),
      guardian: createGuardian(),
      life: createCityLife(),
      flashBus: makeFlashBus(),
    }
  }, [])

  const dirLight = useRef<THREE.DirectionalLight>(null)
  const hemiLight = useRef<THREE.HemisphereLight>(null)
  const rimLight = useRef<THREE.PointLight>(null)
  const fogRef = useRef<THREE.FogExp2>(null)
  const cameraState = useRef({ x: 0, y: 6.4, z: 16.8 })

  useEffect(() => {
    if (fogRef.current) fogRef.current.color.set(cfg.fogColor)
  }, [cfg.fogColor])

  // Free GPU resources when the scene unmounts or quality remounts the canvas.
  useEffect(() => {
    const handles = [city, weather, particles, guardian, life]
    return () => {
      for (const h of handles) disposeScene(h.group)
    }
  }, [city, weather, particles, guardian, life])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)

    // Cinematic camera: mouse parallax + idle drift.
    const target = cameraState.current
    const px = reducedMotion ? 0 : pointer.x * 1.1
    const py = reducedMotion ? 0 : pointer.y * 0.55
    target.x += ((px + Math.sin(t * 0.07) * 0.6) - target.x) * 0.035
    target.y += ((py * 0.6 + 6.4 + Math.sin(t * 0.11) * 0.25) - target.y) * 0.035
    target.z += ((16.8 + Math.sin(t * 0.05) * 0.4) - target.z) * 0.03
    state.camera.position.set(target.x, target.y, target.z)
    state.camera.lookAt(0, 4.1, 0)

    // Flash decay + lighting
    flashBus.value *= Math.pow(0.001, dt)
    if (dirLight.current) {
      dirLight.current.intensity = cfg.sunIntensity + flashBus.value * 70
      dirLight.current.color.set(cfg.daylight > 0.75 ? '#ffe9c8' : cfg.daylight > 0.3 ? '#ffd0a8' : '#b8c8ff')
    }
    if (hemiLight.current) hemiLight.current.intensity = cfg.ambient
    if (rimLight.current) rimLight.current.intensity = cfg.rim + flashBus.value * 40

    // Drive the world
    weather.update(dt, t, cfg, flashBus)
    particles.update(dt, t, cfg)
    guardian.update(dt, t)
    life.update(dt, t, cfg)
    city.update(t, cfg, flashBus.value)
  })

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={[cfg.fogColor, 0.0135]} />
      <hemisphereLight ref={hemiLight} args={['#8fb2ff', '#12060c', cfg.ambient]} />
      <directionalLight ref={dirLight} position={[24, 40, 14]} intensity={cfg.sunIntensity} />
      <pointLight ref={rimLight} position={[-9, 6, 2]} color="#ff2a2a" intensity={cfg.rim} distance={30} decay={1.6} />
      <pointLight position={[10, 7, 6]} color="#2f6bff" intensity={0.7} distance={26} decay={1.6} />

      <primitive object={city.group} />
      <primitive object={weather.group} />
      <primitive object={particles.group} />
      <primitive object={life.group} />
      <primitive object={guardian.group} />
    </>
  )
}

/** The cinematic hero stage. Lazy-loaded; pauses when off-screen. */
export default function HeroScene({ tod, quality, active, reducedMotion }: SceneProps) {
  const reduceDpr = useMediaQuery('(max-width: 640px)')

  return (
    <Canvas
      key={quality}
      dpr={[1, quality === 'high' ? (reduceDpr ? 1.4 : 1.75) : 1.1]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: quality === 'high', alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 50, position: [0, 6.4, 16.8] }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <SceneContents tod={tod} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
