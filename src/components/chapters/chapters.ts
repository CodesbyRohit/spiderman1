export type ParticleKind = 'motes' | 'sparks' | 'embers' | 'circuit' | 'portal'

export interface ChapterDef {
  id: string
  number: string
  kicker: string
  title: string
  accent: string
  accentSoft: string
  glow: string
  particleKind: ParticleKind
  paragraphs: string[]
}

export const CHAPTERS: ChapterDef[] = [
  {
    id: 'ch1',
    number: '01',
    kicker: 'Chapter One',
    title: 'THE CALL',
    accent: '#40c4ff',
    accentSoft: 'rgba(64,196,255,0.14)',
    glow: 'rgba(64,196,255,0.35)',
    particleKind: 'motes',
    paragraphs: [
      'Deep in Sector 9 of Silkspire, a lab alarm cuts through the rain. A failed experiment, a stolen prototype, a city about to discover it has a Guardian.',
      'On the rooftop of the Vesper Tower, the Spider-Sense hums for the very first time — a tingle that will never fully go quiet again.',
    ],
  },
  {
    id: 'ch2',
    number: '02',
    kicker: 'Chapter Two',
    title: 'POWER',
    accent: '#ff3b3b',
    accentSoft: 'rgba(255,59,59,0.12)',
    glow: 'rgba(255,59,59,0.4)',
    particleKind: 'sparks',
    paragraphs: [
      'Precognitive reflexes. Wall-crawling filaments. A nano-loom that spins programmable silk from his own forearms.',
      'Power is loud. Power is tempting. Power is a suit that amplifies every decision he makes — including the wrong ones.',
    ],
  },
  {
    id: 'ch3',
    number: '03',
    kicker: 'Chapter Three',
    title: 'RESPONSIBILITY',
    accent: '#ffb020',
    accentSoft: 'rgba(255,176,32,0.12)',
    glow: 'rgba(255,176,32,0.35)',
    particleKind: 'embers',
    paragraphs: [
      'The motto came from Dr. Lena Voss: with great power comes great responsibility. It sounds simple until a falling bus makes you choose.',
      'Every save creates a new debt. Every enemy defeated becomes an enemy armed. The city remembers all of it.',
    ],
  },
  {
    id: 'ch4',
    number: '04',
    kicker: 'Chapter Four',
    title: 'TECHNOLOGY',
    accent: '#2f6bff',
    accentSoft: 'rgba(47,107,255,0.14)',
    glow: 'rgba(47,107,255,0.4)',
    particleKind: 'circuit',
    paragraphs: [
      'The ARX program evolves: self-healing fabric, phased-state metal, a prediction engine running four thousand danger scenarios a second.',
      'Technology is the difference between a vigilante and a guardian. Between winning a fight — and saving everyone in it.',
    ],
  },
  {
    id: 'ch5',
    number: '05',
    kicker: 'Chapter Five',
    title: 'FUTURE',
    accent: '#7b2ff7',
    accentSoft: 'rgba(123,47,247,0.16)',
    glow: 'rgba(123,47,247,0.45)',
    particleKind: 'portal',
    paragraphs: [
      'Twelve universes. One web. From the noir alleys of AR-05 to the digital frontier of AR-99, every strand leads back to a single promise.',
      'The future is not written. It is woven — strand by strand, choice by choice, by whoever decides to care.',
    ],
  },
]
