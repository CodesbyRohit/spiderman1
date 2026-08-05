import type { TimeOfDay } from '../../lib/state/app'

export interface TodConfig {
  skyClass: string
  fogColor: string
  /** 0 = night, 1 = brightest day — drives window glow & rain visibility. */
  daylight: number
  rainOpacity: number
  cloudOpacity: number
  fogOpacity: number
  sunIntensity: number
  ambient: number
  rim: number
  lightningFreq: number // expected seconds between strikes
  label: string
}

export const TOD_CONFIG: Record<TimeOfDay, TodConfig> = {
  night: {
    skyClass: 'sky-night',
    fogColor: '#0b1026',
    daylight: 0.05,
    rainOpacity: 0.5,
    cloudOpacity: 0.16,
    fogOpacity: 0.2,
    sunIntensity: 0.35,
    ambient: 0.5,
    rim: 1,
    lightningFreq: 7,
    label: 'Night',
  },
  dawn: {
    skyClass: 'sky-dawn',
    fogColor: '#3a1d44',
    daylight: 0.35,
    rainOpacity: 0.22,
    cloudOpacity: 0.3,
    fogOpacity: 0.26,
    sunIntensity: 2.2,
    ambient: 0.8,
    rim: 0.7,
    lightningFreq: 14,
    label: 'Dawn',
  },
  day: {
    skyClass: 'sky-day',
    fogColor: '#1b2f55',
    daylight: 1,
    rainOpacity: 0.08,
    cloudOpacity: 0.34,
    fogOpacity: 0.14,
    sunIntensity: 3.2,
    ambient: 1.1,
    rim: 0.4,
    lightningFreq: 60,
    label: 'Day',
  },
  dusk: {
    skyClass: 'sky-dusk',
    fogColor: '#341243',
    daylight: 0.45,
    rainOpacity: 0.3,
    cloudOpacity: 0.3,
    fogOpacity: 0.22,
    sunIntensity: 2.6,
    ambient: 0.85,
    rim: 0.9,
    lightningFreq: 11,
    label: 'Dusk',
  },
}

export const TOD_ORDER: TimeOfDay[] = ['night', 'dawn', 'day', 'dusk']

export function todFromHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 9) return 'dawn'
  if (hour >= 9 && hour < 16) return 'day'
  if (hour >= 16 && hour < 19) return 'dusk'
  return 'night'
}
