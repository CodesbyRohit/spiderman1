import * as THREE from 'three'
import type { TodConfig } from './heroData'

export interface FlashBus {
  value: number
}

/** Shared mutable state passed between the builders and the R3F canvas. */
export function makeFlashBus(): FlashBus {
  return { value: 0 }
}

/* ============================================================
   Helpers
   ============================================================ */

function radialTexture(inner = 'rgba(255,255,255,0.9)', outer = 'rgba(255,255,255,0)', size = 128): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, inner)
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

function cloudTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 256, 256)
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,0.85)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.28)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  for (let i = 0; i < 7; i++) {
    const x = 60 + Math.random() * 136
    const y = 70 + Math.random() * 116
    const r = 26 + Math.random() * 34
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

/* ============================================================
   City — instanced buildings with procedural glowing windows
   ============================================================ */

export interface CityHandle {
  group: THREE.Group
  update: (t: number, tod: TodConfig, flash: number) => void
}

export function createCity(count = 280): CityHandle {
  const group = new THREE.Group()

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const positions = new Float32Array(count * 3)
  const scales = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const seeds = new Float32Array(count)

  const palette = [
    new THREE.Color('#14141f'),
    new THREE.Color('#1a1a2a'),
    new THREE.Color('#0f1220'),
    new THREE.Color('#181424'),
    new THREE.Color('#12203a'),
  ]

  const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial(), count)
  const dummy = new THREE.Object3D()

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = rand(14, 78)
    let x = Math.cos(angle) * radius
    let z = Math.sin(angle) * radius
    // Keep a clear arena right in front of the camera.
    if (x > -6 && x < 10 && z > 4 && z < 18) {
      if (x < 0) { z += 8 } else { x += 8 }
    }
    const w = rand(2.5, 7)
    const h = rand(5, 42)
    const d = rand(2.5, 7)

    positions[i * 3] = x
    positions[i * 3 + 1] = h / 2 - 0.4
    positions[i * 3 + 2] = z
    scales[i * 3] = w
    scales[i * 3 + 1] = h
    scales[i * 3 + 2] = d
    seeds[i] = Math.random()

    const col = palette[Math.floor(Math.random() * palette.length)]
    // Accent buildings — a few crimson / electric towers.
    if (Math.random() < 0.06) col.setHex(Math.random() < 0.5 ? 0x2f1a2a : 0x10203a)
    colors[i * 3] = col.r
    colors[i * 3 + 1] = col.g
    colors[i * 3 + 2] = col.b

    dummy.position.set(x, h / 2 - 0.4, z)
    dummy.scale.set(w, h, d)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }

  geometry.setAttribute('aPos', new THREE.InstancedBufferAttribute(positions, 3))
  geometry.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 3))
  geometry.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3))
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uDaylight: { value: 0 }, uFlash: { value: 0 } },
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSeed;
      varying vec3 vColor;
      varying float vSeed;
      varying vec2 vUv;
      varying float vH;
      void main() {
        vColor = aColor;
        vSeed = aSeed;
        vUv = uv;
        #ifdef USE_INSTANCING
          vec3 transformed = position;
          transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
          vH = (modelMatrix * vec4(transformed, 1.0)).y;
        #else
          vH = (modelMatrix * vec4(position, 1.0)).y;
        #endif
        gl_Position = projectionMatrix * viewMatrix * vec4(transformed, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uDaylight;
      uniform float uFlash;
      varying vec3 vColor;
      varying float vSeed;
      varying vec2 vUv;
      varying float vH;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        // window grid across the building face
        vec2 grid = vec2(5.0, 16.0);
        vec2 cellPos = floor(vUv * grid);
        vec2 cell = fract(vUv * grid);
        float litSeed = hash(cellPos + vSeed * 13.7);
        float window = step(0.55, cell.x) * step(0.55, cell.y);
        float lit = step(0.62, litSeed) * window;
        // rooftop accent line
        float roof = smoothstep(0.965, 1.0, vUv.y) * step(0.55, cell.x);
        float twinkle = 0.65 + 0.35 * sin(uTime * (1.0 + vSeed * 6.0) + vSeed * 40.0);
        float night = 1.0 - uDaylight;
        vec3 base = vColor;
        vec3 windowCol = vec3(1.0, 0.93, 0.72) * lit * (0.25 + 0.75 * night) * twinkle;
        vec3 roofCol = vec3(1.0, 0.25, 0.2) * roof * (0.5 + 0.5 * night);
        vec3 flashCol = vec3(0.95, 0.85, 0.75) * uFlash * 0.9;
        // soft base illumination that scales with daylight
        vec3 shaded = base * (0.35 + 0.65 * uDaylight);
        gl_FragColor = vec4(shaded + windowCol + roofCol + flashCol, 1.0);
      }
    `,
    side: THREE.DoubleSide,
  })

  mesh.count = count
  mesh.instanceMatrix.needsUpdate = true
  group.add(mesh)

  const update = (t: number, tod: TodConfig, flash: number) => {
    material.uniforms.uTime.value = t
    material.uniforms.uDaylight.value = tod.daylight
    material.uniforms.uFlash.value = Math.min(1, flash)
  }

  return { group, update }
}

/* ============================================================
   Weather — rain points, lightning, fog banks, clouds, sun/moon
   ============================================================ */

export interface WeatherHandle {
  group: THREE.Group
  update: (dt: number, t: number, tod: TodConfig, flashBus: FlashBus) => void
}

export function createWeather(): WeatherHandle {
  const group = new THREE.Group()

  // --- rain ---
  const RAIN_COUNT = 2400
  const rainGeo = new THREE.BufferGeometry()
  const rainPos = new Float32Array(RAIN_COUNT * 3)
  const rainSpeed = new Float32Array(RAIN_COUNT)
  for (let i = 0; i < RAIN_COUNT; i++) {
    rainPos[i * 3] = rand(-85, 85)
    rainPos[i * 3 + 1] = rand(-12, 58)
    rainPos[i * 3 + 2] = rand(-70, 70)
    rainSpeed[i] = rand(16, 30)
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3))
  rainGeo.setAttribute('aSpeed', new THREE.BufferAttribute(rainSpeed, 1))
  const rainMat = new THREE.PointsMaterial({
    color: new THREE.Color('#a8c4ff'),
    size: 0.42,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
  const rain = new THREE.Points(rainGeo, rainMat)
  group.add(rain)

  // --- lightning ---
  const boltMat = new THREE.LineBasicMaterial({ color: new THREE.Color('#eaf2ff'), transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
  const boltGeo = new THREE.BufferGeometry()
  const bolt = new THREE.Line(boltGeo, boltMat)
  bolt.frustumCulled = false
  bolt.visible = false
  group.add(bolt)

  const makeBolt = () => {
    const pts: THREE.Vector3[] = []
    const x0 = rand(-50, 50)
    const z0 = rand(-30, 40)
    let x = x0
    let y = 56
    let z = z0
    pts.push(new THREE.Vector3(x, y, z))
    for (let i = 0; i < 9; i++) {
      x += rand(-6, 6)
      y -= rand(3.5, 7)
      z += rand(-3, 3)
      pts.push(new THREE.Vector3(x, y, z))
    }
    boltGeo.setFromPoints(pts)
  }

  // --- fog banks & clouds (soft sprites) ---
  const fogTex = radialTexture('rgba(170,180,210,0.5)', 'rgba(170,180,210,0)')
  const cloudTex = cloudTexture()
  const fogBanks: { sprite: THREE.Sprite; speed: number; baseY: number }[] = []
  for (let i = 0; i < 4; i++) {
    const mat = new THREE.SpriteMaterial({ map: fogTex, transparent: true, opacity: 0.18, depthWrite: false, color: new THREE.Color('#9aa4c4') })
    const s = new THREE.Sprite(mat)
    const scale = rand(60, 120)
    s.scale.set(scale, scale * 0.35, 1)
    s.position.set(rand(-90, 90), rand(-2, 9), rand(-50, 30))
    group.add(s)
    fogBanks.push({ sprite: s, speed: rand(1.5, 3.5), baseY: s.position.y })
  }

  const clouds: { sprite: THREE.Sprite; speed: number }[] = []
  for (let i = 0; i < 6; i++) {
    const mat = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.22, depthWrite: false })
    const s = new THREE.Sprite(mat)
    const scale = rand(46, 90)
    s.scale.set(scale, scale * 0.4, 1)
    s.position.set(rand(-100, 100), rand(34, 58), rand(-80, -20))
    group.add(s)
    clouds.push({ sprite: s, speed: rand(0.4, 1.4) })
  }

  // --- sun / moon glow ---
  const glowTex = radialTexture('rgba(255,220,170,0.9)', 'rgba(255,220,170,0)')
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }))
  glow.scale.set(42, 42, 1)
  group.add(glow)

  let nextStrike = 5
  let flashLife = 0

  const update = (dt: number, t: number, tod: TodConfig, flashBus: FlashBus) => {
    // rain
    const pos = rainGeo.attributes.position as THREE.BufferAttribute
    const speeds = rainGeo.attributes.aSpeed as THREE.BufferAttribute
    for (let i = 0; i < RAIN_COUNT; i++) {
      let y = pos.getY(i) - speeds.getX(i) * dt
      if (y < -14) y = rand(40, 58)
      pos.setY(i, y)
      pos.setX(i, pos.getX(i) - dt * 2.4) // wind drift
    }
    pos.needsUpdate = true
    rainMat.opacity = tod.rainOpacity
    rain.visible = tod.rainOpacity > 0.02

    // lightning
    nextStrike -= dt
    if (nextStrike <= 0) {
      nextStrike = tod.lightningFreq * rand(0.5, 1.6)
      makeBolt()
      bolt.visible = true
      flashLife = 1
      flashBus.value = 1
    }
    if (flashLife > 0) {
      flashLife = Math.max(0, flashLife - dt * 3.2)
      boltMat.opacity = flashLife * 0.85
      bolt.visible = flashLife > 0.01
      if (flashLife === 0) bolt.visible = false
    }

    // fog drift
    for (const f of fogBanks) {
      f.sprite.position.x += f.speed * dt
      f.sprite.position.y = f.baseY + Math.sin(t * 0.4 + f.baseY) * 1.2
      if (f.sprite.position.x > 100) f.sprite.position.x = -100
      ;(f.sprite.material as THREE.SpriteMaterial).opacity = tod.fogOpacity
    }

    // clouds
    for (const c of clouds) {
      c.sprite.position.x += c.speed * dt
      if (c.sprite.position.x > 110) c.sprite.position.x = -110
      ;(c.sprite.material as THREE.SpriteMaterial).opacity = tod.cloudOpacity
    }

    // sun / moon position per time of day
    if (tod.daylight > 0.75) {
      glow.position.set(30, 26, -90)
      ;(glow.material as THREE.SpriteMaterial).opacity = 0.5 * tod.daylight
      ;(glow.material as THREE.SpriteMaterial).color.set('#ffdf9e')
    } else if (tod.daylight > 0.25) {
      glow.position.set(28, 14, -90)
      ;(glow.material as THREE.SpriteMaterial).opacity = 0.4
      ;(glow.material as THREE.SpriteMaterial).color.set('#ffab6e')
    } else {
      glow.position.set(-34, 34, -95)
      ;(glow.material as THREE.SpriteMaterial).opacity = 0.32
      ;(glow.material as THREE.SpriteMaterial).color.set('#c8d8ff')
    }
  }

  return { group, update }
}

/* ============================================================
   Floating energy particles
   ============================================================ */

export interface ParticleHandle {
  group: THREE.Group
  update: (dt: number, t: number, tod: TodConfig) => void
}

export function createParticles(count = 520): ParticleHandle {
  const group = new THREE.Group()
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const speed = new Float32Array(count)
  const phase = new Float32Array(count)

  const palette = [new THREE.Color('#ff3b3b'), new THREE.Color('#2f6bff'), new THREE.Color('#ffffff'), new THREE.Color('#7b2ff7')]

  for (let i = 0; i < count; i++) {
    pos[i * 3] = rand(-70, 70)
    pos[i * 3 + 1] = rand(-6, 50)
    pos[i * 3 + 2] = rand(-60, 40)
    const c = palette[Math.floor(Math.random() * palette.length)]
    col[i * 3] = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
    speed[i] = rand(0.35, 1.1)
    phase[i] = Math.random() * Math.PI * 2
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))

  const mat = new THREE.PointsMaterial({
    size: 0.32,
    transparent: true,
    opacity: 0.85,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
  const points = new THREE.Points(geo, mat)
  group.add(points)

  const update = (dt: number, t: number, tod: TodConfig) => {
    const p = geo.attributes.position as THREE.BufferAttribute
    const sp = geo.attributes.aSpeed as THREE.BufferAttribute
    const ph = geo.attributes.aPhase as THREE.BufferAttribute
    for (let i = 0; i < count; i++) {
      const y = p.getY(i) + sp.getX(i) * dt
      p.setY(i, y > 52 ? rand(-8, -2) : y)
      p.setX(i, p.getX(i) + Math.sin(t * 0.6 + ph.getX(i)) * 0.02)
    }
    p.needsUpdate = true
    mat.opacity = 0.35 + tod.daylight * 0.5
  }

  return { group, update }
}

/* ============================================================
   The Guardian — a stylized, original arachnid-inspired figure
   ============================================================ */

export interface GuardianHandle {
  group: THREE.Group
  update: (dt: number, t: number) => void
}

export function createGuardian(): GuardianHandle {
  const group = new THREE.Group()
  const suit = new THREE.MeshStandardMaterial({ color: new THREE.Color('#131320'), roughness: 0.55, metalness: 0.7 })
  const accent = new THREE.MeshStandardMaterial({ color: new THREE.Color('#ff2a2a'), emissive: new THREE.Color('#ff2a2a'), emissiveIntensity: 0.35, roughness: 0.4, metalness: 0.3 })
  const visorMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#eaf4ff') })
  const dark = new THREE.MeshStandardMaterial({ color: new THREE.Color('#0a0a10'), roughness: 0.8, metalness: 0.2 })

  const mk = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.rotation.set(rx, ry, rz)
    group.add(m)
    return m
  }

  // legs (slight crouch)
  mk(new THREE.CapsuleGeometry(0.16, 0.62, 4, 10), suit, -0.22, 0.72, 0.05, 0.12, 0, 0.16)
  mk(new THREE.CapsuleGeometry(0.16, 0.62, 4, 10), suit, 0.24, 0.72, 0.0, -0.08, 0, -0.14)
  // torso
  mk(new THREE.CapsuleGeometry(0.4, 0.85, 6, 14), suit, 0, 1.55, 0)
  // chest emblem
  const emblem = mk(new THREE.CircleGeometry(0.14, 24), accent, 0, 1.62, 0.41)
  emblem.rotation.x = -0.1
  // arms — right extended forward (web-shoot pose), left bent
  const rightArm = mk(new THREE.CapsuleGeometry(0.11, 0.7, 4, 10), suit, 0.44, 1.78, -0.16, 0.35, 0, -1.35)
  mk(new THREE.CapsuleGeometry(0.11, 0.7, 4, 10), suit, -0.44, 1.82, 0.1, -0.2, 0, 1.05)
  // head + visor
  mk(new THREE.SphereGeometry(0.27, 24, 18), dark, 0, 2.32, 0)
  const visor = mk(new THREE.SphereGeometry(0.2, 24, 12), visorMat, 0, 2.34, 0.14, 0, 0, 0)
  visor.scale.set(0.62, 0.5, 0.22)

  // web line from right wrist toward the skyline
  const wrist = new THREE.Vector3(0.72, 1.7, -0.5)
  const mid = new THREE.Vector3(4, 8, -8)
  const anchor = new THREE.Vector3(16, 2, -30)
  const curve = new THREE.CatmullRomCurve3([wrist, mid, anchor])
  const webGeo = new THREE.TubeGeometry(curve, 26, 0.022, 5, false)
  const webMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff'), transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  const webLine = new THREE.Mesh(webGeo, webMat)
  group.add(webLine)

  // platform under the hero
  mk(new THREE.CylinderGeometry(1.9, 2.3, 0.35, 5), dark, 0, 0.16, 0)
  const edge = mk(new THREE.TorusGeometry(2.05, 0.03, 6, 40), accent, 0, 0.3, 0)
  edge.rotation.x = Math.PI / 2

  group.position.set(0, 0, 5.6)

  const update = (_dt: number, t: number) => {
    // breathing
    const breath = 1 + Math.sin(t * 1.4) * 0.014
    group.scale.set(breath, 1 / breath, breath)
    // idle sway
    group.rotation.y = Math.sin(t * 0.3) * 0.03
    // web line subtle sway
    webMat.opacity = 0.4 + Math.sin(t * 0.8) * 0.12
    rightArm.rotation.z = -1.35 + Math.sin(t * 0.9) * 0.03
    visorMat.color.setHSL(0.6, 0.35, 0.9 + Math.sin(t * 1.8) * 0.08)
  }

  return { group, update }
}

/* ============================================================
   Moving city life — trains, drones, cars, birds
   ============================================================ */

export interface LifeHandle {
  group: THREE.Group
  update: (dt: number, t: number, tod: TodConfig) => void
}

export function createCityLife(): LifeHandle {
  const group = new THREE.Group()

  // train: glowing streak along the far skyline
  const trainMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe9b0'), transparent: true, opacity: 0.9 })
  const train = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.22), trainMat)
  const trainTrail = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd27a'), transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }))
  trainTrail.rotation.x = -Math.PI / 2
  trainTrail.rotation.z = Math.PI / 2
  group.add(train, trainTrail)

  // cars: moving light dots on street rings
  const CAR_COUNT = 46
  const carGeo = new THREE.BufferGeometry()
  const carPos = new Float32Array(CAR_COUNT * 3)
  const carSpeed = new Float32Array(CAR_COUNT)
  const carRing = new Float32Array(CAR_COUNT)
  const carHue = new Float32Array(CAR_COUNT)
  for (let i = 0; i < CAR_COUNT; i++) {
    carRing[i] = rand(12, 30)
    carSpeed[i] = rand(2.5, 6) * (Math.random() < 0.5 ? 1 : -1)
    carHue[i] = Math.random()
  }
  carGeo.setAttribute('position', new THREE.BufferAttribute(carPos, 3))
  const carMat = new THREE.PointsMaterial({ size: 0.24, transparent: true, opacity: 0.9, color: new THREE.Color('#fff'), blending: THREE.AdditiveBlending, depthWrite: false })
  const cars = new THREE.Points(carGeo, carMat)
  group.add(cars)

  // drones: small glowing dots orbiting at height
  const DRONE_COUNT = 7
  const drones: { mesh: THREE.Mesh; r: number; speed: number; phase: number; y: number }[] = []
  for (let i = 0; i < DRONE_COUNT; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.16), new THREE.MeshBasicMaterial({ color: new THREE.Color('#7bd0ff') }))
    d.scale.set(1, 1, 1)
    group.add(d)
    drones.push({ mesh: d, r: rand(14, 42), speed: rand(0.3, 0.9), phase: Math.random() * Math.PI * 2, y: rand(6, 22) })
  }

  // birds: tiny flapping V shapes
  const BIRD_COUNT = 5
  const birds: { group: THREE.Group; flapL: THREE.Mesh; flapR: THREE.Mesh; speed: number; y: number }[] = []
  const birdMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#1a2030'), transparent: true, opacity: 0.9 })
  for (let i = 0; i < BIRD_COUNT; i++) {
    const g = new THREE.Group()
    const wingGeo = new THREE.PlaneGeometry(0.5, 0.14)
    const l = new THREE.Mesh(wingGeo, birdMat)
    const r = new THREE.Mesh(wingGeo, birdMat)
    l.position.x = -0.28
    r.position.x = 0.28
    g.add(l, r)
    g.position.set(rand(-70, 70), rand(16, 26), rand(-60, -20))
    group.add(g)
    birds.push({ group: g, flapL: l, flapR: r, speed: rand(3, 5), y: g.position.y })
  }

  let carAngle = 0

  const update = (dt: number, t: number, tod: TodConfig) => {
    // train
    train.position.x = ((train.position.x + 7 * dt) % 90) - 45
    train.position.y = 4.4
    train.position.z = -38
    trainTrail.position.copy(train.position)
    trainMat.opacity = 0.4 + tod.daylight * 0.5

    // cars
    carAngle += dt * 0.02
    const posAttr = carGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < CAR_COUNT; i++) {
      const a = carAngle * 3 + (i / CAR_COUNT) * Math.PI * 2
      const r = carRing[i]
      posAttr.setXYZ(i, Math.cos(a) * r, 0.12 + (i % 3) * 0.05, Math.sin(a) * r)
    }
    posAttr.needsUpdate = true
    carMat.opacity = 0.15 + (1 - tod.daylight) * 0.75

    // drones
    for (const d of drones) {
      const a = d.phase + t * d.speed
      d.mesh.position.set(Math.cos(a) * d.r, d.y + Math.sin(t * 0.7 + d.phase) * 2.5, Math.sin(a) * d.r * 0.7)
    }

    // birds
    for (const b of birds) {
      b.group.position.x += b.speed * dt
      if (b.group.position.x > 80) b.group.position.x = -80
      b.group.position.y = b.y + Math.sin(t * 1.3 + b.group.position.x) * 1.4
      const flap = Math.sin(t * 9 + b.group.position.x) * 0.6
      b.flapL.rotation.z = flap
      b.flapR.rotation.z = -flap
    }
  }

  return { group, update }
}

/* ============================================================
   Resource disposal — release GPU memory on unmount / quality swap
   ============================================================ */

/** Traverse a scene subtree and dispose every geometry, material and texture. */
export function disposeScene(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined
    const mats = Array.isArray(material) ? material : material ? [material] : []
    for (const mat of mats) {
      const textured = mat as THREE.Material & { map?: THREE.Texture | null }
      if (textured.map) textured.map.dispose()
      const shader = mat as THREE.ShaderMaterial
      if (shader.uniforms) {
        for (const key of Object.keys(shader.uniforms)) {
          const uniform = shader.uniforms[key]
          if (uniform?.value instanceof THREE.Texture) uniform.value.dispose()
        }
      }
      mat.dispose()
    }
  })
}
