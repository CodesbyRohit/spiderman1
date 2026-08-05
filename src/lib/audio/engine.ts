/**
 * ARACHNID Audio Engine — 100% procedural Web Audio, zero asset downloads.
 *
 * Layers:
 *  - rain / wind / city hum  (filtered looping noise + detuned drones)
 *  - ambient pad            (generative cinematic chord pad)
 *  - SFX                     (UI ticks, web-shoot, achievements, portal)
 *  - heartbeat               (spider-sense danger loop)
 *
 * Everything is routed through a master compressor so layers stay musical.
 */

type AnyWindow = Window & {
  webkitAudioContext?: typeof AudioContext
  AudioContext?: typeof AudioContext
}

class AudioEngine {
  private ctx: AudioContext | null = null
  private ambientBus: GainNode | null = null
  private sfxBus: GainNode | null = null
  private padBus: GainNode | null = null

  private started = false
  enabled = true
  private musicOn = true
  private heartbeatTimer: number | null = null
  private noiseBuffer: AudioBuffer | null = null
  private nodes: AudioNode[] = []

  /** Must be called from a user gesture (autoplay policy). */
  start(): void {
    if (this.started) {
      void this.ctx?.resume()
      return
    }
    const Ctor = (window as AnyWindow).AudioContext ?? (window as AnyWindow).webkitAudioContext
    if (!Ctor) return
    const ctx = new Ctor()
    this.ctx = ctx

    const master = ctx.createGain()
    master.gain.value = 0.9
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 4
    master.connect(comp).connect(ctx.destination)

    const ambientBus = ctx.createGain()
    ambientBus.gain.value = 0.5
    ambientBus.connect(master)
    this.ambientBus = ambientBus

    const sfxBus = ctx.createGain()
    sfxBus.gain.value = 0.8
    sfxBus.connect(master)
    this.sfxBus = sfxBus

    const padBus = ctx.createGain()
    padBus.gain.value = 0.5
    padBus.connect(master)
    this.padBus = padBus

    this.noiseBuffer = this.makeNoise(ctx, 2)
    this.buildAmbience()
    this.buildPad()
    this.started = true

    if (this.enabled) ambientBus.gain.setTargetAtTime(0.5, ctx.currentTime, 0.8)
    if (this.enabled && this.musicOn) padBus.gain.setTargetAtTime(0.42, ctx.currentTime, 1.5)
  }

  setEnabled(on: boolean): void {
    this.enabled = on
    const ctx = this.ctx
    if (!ctx || !this.started) return
    this.ambientBus?.gain.setTargetAtTime(on ? 0.5 : 0.0001, ctx.currentTime, 0.6)
    if (this.musicOn) this.padBus?.gain.setTargetAtTime(on ? 0.42 : 0.0001, ctx.currentTime, 0.9)
    if (on) void ctx.resume()
  }

  setMusic(on: boolean): void {
    this.musicOn = on
    const ctx = this.ctx
    if (!ctx || !this.started) return
    this.padBus?.gain.setTargetAtTime(on && this.enabled ? 0.42 : 0.0001, ctx.currentTime, 1.2)
  }

  /* ------------------------- ambience ------------------------- */

  private noiseSource(): AudioBufferSourceNode | null {
    if (!this.ctx || !this.noiseBuffer) return null
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    src.loop = true
    this.nodes.push(src)
    return src
  }

  private buildAmbience(): void {
    const ctx = this.ctx
    const ambientBus = this.ambientBus
    if (!ctx || !ambientBus) return

    // Rain: band-passed noise with slow LFO flutter, panned slightly L.
    const rain = this.noiseSource()
    const rainFilter = ctx.createBiquadFilter()
    rainFilter.type = 'bandpass'
    rainFilter.frequency.value = 3800
    rainFilter.Q.value = 0.6
    const rainGain = ctx.createGain()
    rainGain.gain.value = 0.16
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.13
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.05
    lfo.connect(lfoGain).connect(rainGain.gain)
    const pan = ctx.createStereoPanner()
    pan.pan.value = -0.28
    rain?.connect(rainFilter).connect(rainGain).connect(pan).connect(ambientBus)
    lfo.start()

    // Wind: lowpassed noise with a sweeping cutoff for gusts.
    const wind = this.noiseSource()
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'lowpass'
    windFilter.frequency.value = 420
    const windGain = ctx.createGain()
    windGain.gain.value = 0.055
    const windLfo = ctx.createOscillator()
    windLfo.frequency.value = 0.06
    const windLfoGain = ctx.createGain()
    windLfoGain.gain.value = 260
    windLfo.connect(windLfoGain).connect(windFilter.frequency)
    wind?.connect(windFilter).connect(windGain).connect(ambientBus)
    windLfo.start()

    // City hum: two detuned sub drones + faint neon buzz.
    const hum1 = ctx.createOscillator()
    hum1.type = 'sine'
    hum1.frequency.value = 55
    const hum2 = ctx.createOscillator()
    hum2.type = 'sine'
    hum2.frequency.value = 55.7
    const humGain = ctx.createGain()
    humGain.gain.value = 0.028
    hum1.connect(humGain)
    hum2.connect(humGain)
    humGain.connect(ambientBus)
    hum1.start()
    hum2.start()
  }

  /** Generative cinematic pad — a soft minor-add9 wash that breathes. */
  private buildPad(): void {
    const ctx = this.ctx
    const padBus = this.padBus
    if (!ctx || !padBus) return
    const chord = [110, 164.81, 220, 261.63, 329.63] // A2 E3 A3 C4 E4
    const pan = ctx.createStereoPanner()
    pan.pan.value = 0
    for (let i = 0; i < chord.length; i++) {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = chord[i]! * (1 + (i % 2) * 0.0018)
      const g = ctx.createGain()
      g.gain.value = 0.045
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 900
      osc.connect(lp).connect(g).connect(pan)
      osc.start()
      this.nodes.push(osc)
    }
    // Slow LFO on the pad level for movement.
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.02
    lfo.connect(lfoGain).connect(padBus.gain)
    lfo.start()
    pan.connect(padBus)
  }

  /* ------------------------- one-shots ------------------------- */

  private blip(freq: number, endFreq: number, dur: number, vol = 0.18, type: OscillatorType = 'sine'): void {
    const ctx = this.ctx
    const sfxBus = this.sfxBus
    if (!ctx || !sfxBus || !this.enabled) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g).connect(sfxBus)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  private noiseSweep(dur: number, from: number, to: number, vol = 0.14): void {
    const ctx = this.ctx
    const sfxBus = this.sfxBus
    if (!ctx || !sfxBus || !this.noiseBuffer || !this.enabled) return
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    src.loop = true
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.Q.value = 1.4
    f.frequency.setValueAtTime(from, t)
    f.frequency.exponentialRampToValueAtTime(to, t + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(f).connect(g).connect(sfxBus)
    src.start(t)
    src.stop(t + dur + 0.02)
  }

  uiTick(): void { this.blip(760, 1180, 0.05, 0.08) }
  uiOpen(): void { this.noiseSweep(0.32, 500, 2600, 0.1) }
  uiClose(): void { this.noiseSweep(0.28, 2600, 400, 0.09) }
  webShoot(): void {
    this.blip(1400, 5200, 0.12, 0.1, 'sawtooth')
    this.noiseSweep(0.22, 3000, 9000, 0.08)
  }
  achievement(): void {
    this.blip(523, 523, 0.09, 0.16)
    window.setTimeout(() => this.blip(659, 659, 0.09, 0.16), 90)
    window.setTimeout(() => this.blip(784, 784, 0.16, 0.18), 180)
    window.setTimeout(() => this.blip(1046, 1046, 0.24, 0.16), 300)
  }
  alert(): void {
    this.blip(320, 180, 0.3, 0.16, 'square')
    window.setTimeout(() => this.blip(180, 320, 0.3, 0.16, 'square'), 340)
  }
  portal(): void {
    this.noiseSweep(0.7, 300, 3200, 0.1)
    this.blip(220, 880, 0.7, 0.07, 'sine')
  }
  levelUp(): void {
    this.blip(392, 392, 0.1, 0.14)
    window.setTimeout(() => this.blip(523, 523, 0.1, 0.14), 110)
    window.setTimeout(() => this.blip(659, 659, 0.1, 0.14), 220)
    window.setTimeout(() => this.blip(880, 880, 0.3, 0.16), 330)
  }

  /** Two low sub thumps — the Spider-Sense heartbeat. */
  private thump(): void {
    const ctx = this.ctx
    const sfxBus = this.sfxBus
    if (!ctx || !sfxBus || !this.enabled) return
    const t = ctx.currentTime
    const mk = (when: number, vol: number) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(72, t + when)
      osc.frequency.exponentialRampToValueAtTime(38, t + when + 0.14)
      const g = ctx.createGain()
      g.gain.setValueAtTime(vol, t + when)
      g.gain.exponentialRampToValueAtTime(0.0001, t + when + 0.22)
      osc.connect(g).connect(sfxBus)
      osc.start(t + when)
      osc.stop(t + when + 0.25)
    }
    mk(0, 0.5)
    mk(0.16, 0.34)
  }

  startHeartbeat(): void {
    this.stopHeartbeat()
    this.thump()
    this.heartbeatTimer = window.setInterval(() => this.thump(), 820)
  }
  stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      window.clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private makeNoise(ctx: AudioContext, seconds: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02 // brown-ish
      data[i] = last * 3.2
    }
    return buf
  }
}

export const engine = new AudioEngine()
