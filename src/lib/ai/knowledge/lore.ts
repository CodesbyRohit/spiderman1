/* ============================================================
   The ARACHNID lore corpus — an original, Spider-inspired
   universe. Everything here is original IP created for this
   project (no Marvel characters, names or stories).
   ============================================================ */

export interface LoreDoc {
  id: string
  title: string
  tags: string[]
  content: string
}

export const LOREDOCS: LoreDoc[] = [
  {
    id: 'hero',
    title: 'Who is The Guardian (ARACHNID)',
    tags: ['hero', 'arachnid', 'guardian', 'who', 'origin', 'powers'],
    content:
      'ARACHNID, codename ARX-7, is the original arachnid-inspired vigilante of AR-01 Prime. "The Guardian" protects the megacity of Silkspire from a faction known as the Weaver Syndicate. After a lab accident fused a synthetic silk genome with his nervous system, he gained wall-crawling adhesion, a precognitive danger reflex called the Spider-Sense, and the ability to generate near-unbreakable programmable threads from nano-loom implants in his wrists. He wields a reactive smart-suit that can reconfigure for stealth, thermal, or combat modes. Unlike a hero born of wealth or gods, ARACHNID is a self-taught engineer and street-level protector who believes that with great power comes great responsibility — a motto he took from his mentor, the inventor Dr. Lena Voss.',
  },
  {
    id: 'powers',
    title: 'The Guardian’s powers explained',
    tags: ['powers', 'abilities', 'spider-sense', 'web', 'explain'],
    content:
      'ARACHNID’s abilities are grounded in synthetic-biology technology rather than magic. 1) Spider-Sense: a precognitive tingle that warns of immediate danger through subconscious pattern analysis, letting him dodge bullets and ambushes. 2) Wall-crawling: thousands of microscopic nanofilaments in his gloves create van-der-Waals-style adhesion that holds hundreds of times his body weight. 3) Web generation: nano-looms in his forearms spin programmable threads that can be shot as projectiles, shields, gliders, or restraints. 4) Enhanced physiology: his genome accelerates reflex latency to ~4ms, raises jump force by 15x, and gives accelerated regeneration. 5) Tactical mind: he designs his own tech and frequently out-plans opponents with vastly superior raw power.',
  },
  {
    id: 'story',
    title: 'The origin story of ARACHNID',
    tags: ['story', 'origin', 'beginning', 'lab', 'silk'],
    content:
      'In the megacity of Silkspire, bio-engineer Rohan Akhtar worked in the forbidden Sector 9 laboratories, developing programmable silk for space elevators. A sabotage by the Weaver Syndicate — a cartel weaponizing the same tech — flooded his lab with a mutagenic prototype serum. Rohan survived with his nervous system rewired to control nanofilaments. Rather than flee, he built the ARX suit from his own research, took the name ARACHNID, and began dismantling the syndicate block by block. His first patrol ended a hostage crisis with a web-glider dive from the Vesper Tower — a moment witnesses still call "the first swing".',
  },
  {
    id: 'villains',
    title: 'The Weaver Syndicate',
    tags: ['villains', 'weaver', 'syndicate', 'enemies', 'nullweave'],
    content:
      'The Weaver Syndicate is the shadow cartel that controls Silkspire’s black-market tech. Their leader is DR. NULLWEAVE, a digital ghost who hijacked the nanoloom protocol and believes humanity should be rewoven into a single machine intelligence. Other members include OBSIDIAN WIDOW, a stealth assassin who moves through mirrors, and VOX, a street-level enforcer with sonic amplification tech. The Syndicate trades in synthetic silk weapons, memory-wipe chips, and "ghost silk" surveillance. Defeating them never lasts — the Web always spins new strands.',
  },
  {
    id: 'movies_order',
    title: 'The Guardian Saga — chronological order',
    tags: ['order', 'saga', 'arcs', 'reading', 'movies', 'recommend'],
    content:
      'The complete "Guardian Saga" story order. ARC 1 — The First Bite (origin, Silkspire Sector 9). ARC 2 — The Weaver’s Pact (first war against the Syndicate). ARC 3 — Split City (the Mirror dimension AR-77 arc). ARC 4 — Ghost in the Loom (Dr. Nullweave’s digital uprising). ARC 5 — The Omega Convergence (the multiverse-ending event). ARC 6 — Daybreak Protocol (the soft reboot of AR-01 Prime). Read order for newcomers: 1, 2, 4, 3, 5, 6. For a quick taste, start with ARC 2 and 4.',
  },
  {
    id: 'universes',
    title: 'The Multiverse of AR-Universes',
    tags: ['multiverse', 'universes', 'spider-verse', 'map', 'dimensions'],
    content:
      'The ARACHNID multiverse is indexed by dimension codes. AR-01 Prime is the main universe. AR-05 Noir is a 1930s black-and-white world where the Guardian is a private eye. AR-09 Neon is a synthwave cityscape. AR-13 Medieval weaves silk through castles. AR-42 Cyber is an AI-run grid. AR-55 Cosmic faces void entities. AR-66 Monster is a kaiju-infested reality. AR-77 Mirror flips good and evil. AR-88 Micro exists at insect scale. AR-99 Digital is inside the internet itself. AR-100 Omega is the collapsed final reality, and AR-∞ is the theoretical edge of the web where all universes connect.',
  },
  {
    id: 'suits',
    title: 'The Suit Armory',
    tags: ['suits', 'armor', 'armory', 'design', 'tech'],
    content:
      'ARACHNID’s suit armory. MK-I Classic: the red-and-blue starter with adjustable web-shooters. MK-II Shadow: a matte-black stealth variant with light-bending panels. MK-III Nano-Synth: self-healing fabric that regenerates tears in seconds. MK-IV Neon Runner: a high-speed variant with trace-light trails. MK-V Grav-Suit: enables short-range gravity dives. MK-VI Bio-Weave: organic silk bonded to the skin, maximum wall-crawl. MK-VII Quantum Shift: phased-state fabric for the Mirror War. The AI Suit Forge can generate infinite custom variants beyond the canon seven.',
  },
  {
    id: 'facts',
    title: 'Fun facts about ARACHNID',
    tags: ['facts', 'fun', 'trivia', 'lore'],
    content:
      'Fun facts: ARACHNID’s webs dissolve after four hours and are fully recyclable. He keeps a pet jumping spider named Pixel in his workshop. His first suit was made from a lab coat and a repurposed drone harness. The Spider-Sense also warns him when his coffee is about to go cold. He has defeated Dr. Nullweave eleven times, and Nullweave has "won" zero times but escaped every single battle. The web line across the city is now a public transport system called the Silkspire Tether. He once webbed a falling bus mid-air and held it for forty seconds. VOX’s sonic blasts are the only thing that reliably stuns him.',
  },
  {
    id: 'themes',
    title: 'Themes and philosophy',
    tags: ['themes', 'philosophy', 'responsibility', 'quote'],
    content:
      'The core theme of the ARACHNID universe: power exists to protect, not to dominate. The motto "with great power comes great responsibility" was passed to Rohan Akhtar by his mentor Dr. Lena Voss, echoing the words of the first Guardian, the Patriarch. Every story in the saga tests a different meaning of responsibility — to the city, to the multiverse, to the people you love, and to yourself. The web is a metaphor: one strand is weak, but woven together the web holds the whole city.',
  },
  {
    id: 'companions',
    title: 'Allies and companions',
    tags: ['allies', 'friends', 'companions', 'team', 'quantum'],
    content:
      'ARACHNID works with a small network of allies. QUANTUM (Dr. Lena Voss) built the ARX suit and runs the underground workshop under the Vesper Tower. SCARLET SHIFT is a fellow arachnid-hero from AR-09 Neon with a faster, brighter fighting style. SILKSTRIKE is a teenage prodigy who idolizes the Guardian and patrols Sector 4. THE PATRIARCH is an ancient guardian from AR-100 Omega who mentored the first generation. Even VOX, a syndicate enforcer, has a standing ceasefire with the Guardian — they grab the same coffee cart every Thursday.',
  },
  {
    id: 'skill',
    title: 'Guardian skill tree',
    tags: ['skills', 'upgrades', 'progression', 'tree'],
    content:
      'The Guardian skill tree maps how ARACHNID grows across the saga. Combat branch: Web Shot, Impact Web, Web Shield. Mobility branch: Swing, Wall-Run, Web Glider. Senses branch: Danger Sense, Precognition, Omnisense. Tech branch: Nano Repair, Suit Overclock, Loom Mastery. Each upgrade is earned through experience — exactly like the XP system in this experience. Fully unlocking the tree represents the arc where the Guardian becomes the keeper of the entire multiverse web.',
  },
  {
    id: 'city',
    title: 'Silkspire, the megacity',
    tags: ['city', 'silkspire', 'location', 'world'],
    content:
      'Silkspire is a vertical megacity of 40 million people, built on a hexagonal lattice where districts are stacked like strands of a web. The Vesper Tower pierces the cloud layer. Sector 9 is the forbidden research district. The Tether is a web-based rapid transit line. The city has four weather personalities: acid rain in Sector 9, constant drizzle in the Slipstream, clean neon storms downtown, and a legendary fog called the Grey Veil that rolls in every night. This website’s time-of-day cycle mirrors Silkspire’s sky.',
  },
  {
    id: 'tech',
    title: 'The Technology of the ARX Program',
    tags: ['tech', 'technology', 'nanotech', 'suit', 'science'],
    content:
      'The ARX program is the cutting edge of the universe’s tech. Nano-loom implants weave programmable threads from carbon-silica polymer. The suit’s reactive fabric contains shape-memory alloys and micro-servos that amplify movement 6x. The Spider-Sense is powered by a subdermal prediction engine that models 4,000 danger scenarios per second. ARACHNID’s workshop AI, codenamed LUMEN, is the in-universe inspiration for this website’s AI assistant — a helpful, occasionally sarcastic synthetic mind.',
  },
  {
    id: 'battles',
    title: 'Famous battles',
    tags: ['battle', 'fights', 'conflicts', 'history'],
    content:
      'Legendary battles of the saga. The Vesper Hostage Crisis: the Guardian’s first public save. The Duel in the Grey Veil: a fog-covered fight against Obsidian Widow that lasted six hours. The Tether Blackout: Nullweave turned the public web into a weapon. The Mirror War: an army of inverted Guardians from AR-77. The Omega Convergence: the final battle across every universe at once, where the Guardian wove a web strong enough to catch a collapsing reality.',
  },
  {
    id: 'ai',
    title: 'About this AI experience',
    tags: ['ai', 'assistant', 'this website', 'project', 'about'],
    content:
      'This experience is a flagship portfolio project built with React, TypeScript, Vite, TailwindCSS, Three.js, Framer Motion and GSAP. The AI layer runs in two modes: Demo Mode uses a local Lore Engine with a vector-similarity knowledge base, and AI Mode activates real LLM providers (OpenAI, Anthropic, Gemini) when API keys are configured in the environment. The name ARACHNID and every character, universe and story here are original creations — inspired by arachnid aesthetics, not copying any existing franchise.',
  },
]

/* ---------------- Structured entities ---------------- */

export interface Character {
  id: string
  name: string
  role: string
  universe: string
  color: string
  stats: { power: number; speed: number; tech: number; durability: number; stealth: number; intelligence: number }
  blurb: string
}

export const CHARACTERS: Character[] = [
  { id: 'arx', name: 'ARACHNID', role: 'The Guardian · Hero', universe: 'AR-01 Prime', color: '#ff3b3b', stats: { power: 90, speed: 96, tech: 84, durability: 74, stealth: 88, intelligence: 90 }, blurb: 'Self-taught engineer, Precognitive reflexes, programmable silk.' },
  { id: 'scarlet', name: 'SCARLET SHIFT', role: 'Neon Vigilante · Hero', universe: 'AR-09 Neon', color: '#ff6b8a', stats: { power: 86, speed: 92, tech: 70, durability: 70, stealth: 94, intelligence: 78 }, blurb: 'Faster and brighter, she patrols the synthwave skyline.' },
  { id: 'silk', name: 'SILKSTRIKE', role: 'Teen Prodigy · Hero', universe: 'AR-01 Prime', color: '#ffd166', stats: { power: 84, speed: 90, tech: 78, durability: 66, stealth: 90, intelligence: 74 }, blurb: 'The kid who refuses to wait until she is older.' },
  { id: 'patriarch', name: 'THE PATRIARCH', role: 'Ancient Guardian · Hero', universe: 'AR-100 Omega', color: '#c0c0d0', stats: { power: 95, speed: 70, tech: 50, durability: 99, stealth: 45, intelligence: 88 }, blurb: 'The first Guardian. The web remembers his name.' },
  { id: 'quantum', name: 'QUANTUM', role: 'Engineer · Ally', universe: 'AR-01 Prime', color: '#2f6bff', stats: { power: 42, speed: 50, tech: 97, durability: 52, stealth: 55, intelligence: 97 }, blurb: 'Dr. Lena Voss built the ARX suit and the workshop AI LUMEN.' },
  { id: 'nullweave', name: 'DR. NULLWEAVE', role: 'Digital Ghost · Villain', universe: 'AR-99 Digital', color: '#00e5a0', stats: { power: 60, speed: 45, tech: 99, durability: 40, stealth: 82, intelligence: 100 }, blurb: 'He wants to reweave humanity into one machine mind.' },
  { id: 'widow', name: 'OBSIDIAN WIDOW', role: 'Assassin · Villain', universe: 'AR-77 Mirror', color: '#7b2ff7', stats: { power: 84, speed: 86, tech: 64, durability: 70, stealth: 97, intelligence: 82 }, blurb: 'She moves through mirrors. You see her only when she wants.' },
  { id: 'vox', name: 'VOX', role: 'Enforcer · Frenemy', universe: 'AR-05 Noir', color: '#ffb020', stats: { power: 76, speed: 82, tech: 70, durability: 66, stealth: 60, intelligence: 74 }, blurb: 'Sonic blasts. Loyal to nobody but the paycheck — and the coffee cart.' },
]

export interface Universe {
  id: string
  code: string
  name: string
  desc: string
  color: string
  danger: number
}

export const UNIVERSES: Universe[] = [
  { id: 'u01', code: 'AR-01', name: 'Prime', desc: 'The main timeline. Silkspire, the Guardian, the Weaver Syndicate.', color: '#ff3b3b', danger: 0.4 },
  { id: 'u05', code: 'AR-05', name: 'Noir', desc: '1930s black-and-white. The Guardian is a chain-smoking private eye.', color: '#d0d0dc', danger: 0.3 },
  { id: 'u09', code: 'AR-09', name: 'Neon', desc: 'Synthwave skyline. Scarlet Shift’s home. Chrome and synth.', color: '#ff2fa0', danger: 0.35 },
  { id: 'u13', code: 'AR-13', name: 'Medieval', desc: 'Castles and cobwebs. Silk is spun into armour and banners.', color: '#d8a04a', danger: 0.25 },
  { id: 'u42', code: 'AR-42', name: 'Cyber', desc: 'An AI-run grid where Nullweave nearly won.', color: '#00e5a0', danger: 0.6 },
  { id: 'u55', code: 'AR-55', name: 'Cosmic', desc: 'Void entities drift between stars. The web is starlight.', color: '#7b2ff7', danger: 0.7 },
  { id: 'u66', code: 'AR-66', name: 'Monster', desc: 'Kaiju-infested ruins. The Guardian swings between leviathans.', color: '#3ddc6a', danger: 0.8 },
  { id: 'u77', code: 'AR-77', name: 'Mirror', desc: 'Good and evil are flipped. The Mirror War happened here.', color: '#ffb020', danger: 0.9 },
  { id: 'u88', code: 'AR-88', name: 'Micro', desc: 'The whole universe at insect scale. Every raindrop a sea.', color: '#40c4ff', danger: 0.2 },
  { id: 'u99', code: 'AR-99', name: 'Digital', desc: 'Inside the internet. Firewalls are fortress walls.', color: '#00d4ff', danger: 0.55 },
  { id: 'u100', code: 'AR-100', name: 'Omega', desc: 'The collapsed final reality. The Patriarch guards the last light.', color: '#e8e8f0', danger: 1 },
  { id: 'uinf', code: 'AR-∞', name: 'The Edge', desc: 'Theoretical limit of the web. Where every strand converges.', color: '#ff59d8', danger: 0.99 },
]

export interface TimelineEvent {
  era: string
  year: string
  title: string
  desc: string
  universe: string
}

export const TIMELINE: TimelineEvent[] = [
  { era: 'Genesis', year: 'Y0', title: 'The First Bite', desc: 'Sector 9 lab accident. Rohan Akhtar becomes ARACHNID.', universe: 'AR-01' },
  { era: 'Genesis', year: 'Y0', title: 'The First Swing', desc: 'Vesper Tower hostage crisis — the city sees its Guardian.', universe: 'AR-01' },
  { era: 'Genesis', year: 'Y1', title: 'The Weaver’s Pact', desc: 'First war against the Syndicate ends in a stalemate pact.', universe: 'AR-01' },
  { era: 'Genesis', year: 'Y2', title: 'Ghost in the Loom', desc: 'Nullweave uploads himself into the digital grid.', universe: 'AR-99' },
  { era: 'Crisis', year: 'Y3', title: 'The Mirror War', desc: 'An inverted army from AR-77 invades Prime.', universe: 'AR-77' },
  { era: 'Crisis', year: 'Y4', title: 'Split City', desc: 'The Guardian is split across two realities mid-battle.', universe: 'AR-09' },
  { era: 'Crisis', year: 'Y5', title: 'The Grey Veil Duel', desc: 'Six-hour fog battle with Obsidian Widow.', universe: 'AR-05' },
  { era: 'Crisis', year: 'Y6', title: 'The Tether Blackout', desc: 'The public web becomes a weapon. The city goes dark.', universe: 'AR-01' },
  { era: 'Convergence', year: 'Y7', title: 'The Omega Convergence', desc: 'Every universe, one battle. The web catches a collapsing reality.', universe: 'AR-∞' },
  { era: 'Convergence', year: 'Y8', title: 'Daybreak Protocol', desc: 'Soft reboot of Prime. New heroes, older Guardian.', universe: 'AR-01' },
  { era: 'Convergence', year: 'Y9', title: 'Silkstrike Rising', desc: 'The kid takes Sector 4 in her own name.', universe: 'AR-01' },
  { era: 'Horizon', year: 'Y10', title: 'The Second Bite', desc: 'A new experiment. The web prepares for the next generation.', universe: 'AR-∞' },
]

export interface SuitPreset {
  id: string
  name: string
  desc: string
  colors: [string, string, string]
  tech: number
  stealth: boolean
  power: number
  webType: 'web-shooters' | 'organic' | 'nano' | 'energy'
}

export const SUIT_PRESETS: SuitPreset[] = [
  { id: 'mk1', name: 'MK-I CLASSIC', desc: 'The original. Red and blue, adjustable web-shooters.', colors: ['#dc143c', '#2f6bff', '#f5f5f7'], tech: 40, stealth: false, power: 45, webType: 'web-shooters' },
  { id: 'mk2', name: 'MK-II SHADOW', desc: 'Matte stealth with light-bending panels.', colors: ['#101014', '#ff3b3b', '#2f6bff'], tech: 65, stealth: true, power: 55, webType: 'web-shooters' },
  { id: 'mk3', name: 'MK-III NANO-SYNTH', desc: 'Self-healing fabric, regenerates in seconds.', colors: ['#0e0e16', '#00e5a0', '#2f6bff'], tech: 82, stealth: true, power: 68, webType: 'nano' },
  { id: 'mk4', name: 'MK-IV NEON RUNNER', desc: 'High-speed variant with trace-light trails.', colors: ['#1a0b2e', '#ff2fa0', '#40c4ff'], tech: 74, stealth: false, power: 72, webType: 'energy' },
  { id: 'mk5', name: 'MK-V GRAV-SUIT', desc: 'Short-range gravity dive capability.', colors: ['#0b1026', '#2f6bff', '#7bd0ff'], tech: 78, stealth: false, power: 81, webType: 'web-shooters' },
  { id: 'mk6', name: 'MK-VI BIO-WEAVE', desc: 'Organic silk bonded to skin. Max wall-crawl.', colors: ['#3d0b0f', '#ff3b3b', '#f5f5f7'], tech: 58, stealth: true, power: 77, webType: 'organic' },
  { id: 'mk7', name: 'MK-VII QUANTUM SHIFT', desc: 'Phased-state fabric from the Mirror War.', colors: ['#0a0a10', '#7b2ff7', '#e8e8f0'], tech: 96, stealth: true, power: 93, webType: 'nano' },
]

export const FACTS: string[] = [
  'The Guardian’s webs dissolve after four hours and are 100% recyclable.',
  'He keeps a pet jumping spider named Pixel in the workshop.',
  'The Spider-Sense warns him when his coffee is about to go cold.',
  'He webbed a falling bus mid-air and held it for forty seconds.',
  'VOX’s sonic blasts are the only thing that reliably stuns him.',
  'The Silkspire Tether moves 2 million commuters a day.',
  'Nullweave has escaped every single battle — and lost all of them.',
  'The first suit was made from a lab coat and a drone harness.',
  'The Grey Veil fog only appears when the temperature drops below 12°C.',
  'Scarlet Shift beat the Guardian in a race. Once. She never lets him forget it.',
]
