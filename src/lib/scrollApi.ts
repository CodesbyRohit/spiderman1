import type { LenisHandle } from './hooks/useLenis'

/**
 * Set once by the app shell after Lenis mounts. Components (HUD, chapters,
 * feature modules) call `scrollApi.scrollTo('#id')` to glide anywhere.
 */
export const scrollApi: LenisHandle = {
  lenis: null,
  scrollTo: () => {},
  lock: () => {},
}

export function setScrollApi(handle: LenisHandle) {
  scrollApi.scrollTo = handle.scrollTo
  scrollApi.lock = handle.lock
  scrollApi.lenis = handle.lenis
}
