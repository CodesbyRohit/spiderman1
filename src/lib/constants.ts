export const APP = {
  name: 'ARACHNID',
  tagline: 'The Web Guardian',
  full: 'ARACHNID — The Web Guardian AI Experience',
  version: '1.0.0',
  githubRepo: 'CodesbyRohit/spiderman1',
  /** Original hero codename. Arachnid-inspired but not a copyrighted character. */
  hero: 'The Guardian',
  codename: 'ARX-7',
  built: '2026',
} as const

/** Keyboard shortcuts surfaced in the settings panel. */
export const SHORTCUTS = [
  { keys: 'X', action: 'Trigger Spider-Sense mode' },
  { keys: 'M', action: 'Toggle ambient sound' },
  { keys: 'T', action: 'Cycle time of day' },
  { keys: 'L', action: 'Open the AI Lab' },
  { keys: 'S', action: 'Open settings' },
  { keys: 'D', action: 'Toggle developer mode' },
  { keys: '1–5', action: 'Jump to story chapter' },
  { keys: 'Esc', action: 'Close any overlay' },
] as const
