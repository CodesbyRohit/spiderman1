import { CHARACTERS, FACTS, type Character } from './knowledge/lore'
import { retrieve } from './knowledge/rag'
import { hashString, mulberry32 } from './streaming'
import type {
  BattleResult,
  CoverOptions,
  CoverResult,
  GeneratedMission,
  MissionInput,
  StoryInput,
  StoryResult,
  SuitOptions,
  SuitResult,
  TriviaQuestion,
} from './types'

/* ---------------- name banks ---------------- */

const SUIT_PREFIX = ['NANO', 'OMNI', 'GHOST', 'BIO', 'QUANTUM', 'VOLT', 'SHADOW', 'PRIME', 'HELIX', 'ARC']
const SUIT_SUFFIX = ['WEAVE', 'SHIFT', 'RUNNER', 'SENTINEL', 'PHANTOM', 'LOOM', 'STRAND', 'FALCON', 'VECTOR', 'PULSE']

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

/* ---------------- chat ---------------- */

/**
 * Demo-mode chat: retrieval + curated answer bank + graceful fallbacks.
 * Honest about being a local engine; points users at AI Mode for deep Q&A.
 */
export function demoChatReply(message: string): string {
  const q = message.toLowerCase()

  // Intent detection
  if (/(^|\s)(hi|hello|hey|yo|sup)\b/.test(q)) {
    return `Hey, traveler of the web. I'm LUMEN — the ARACHNID experience's resident AI. Ask me about the Guardian, his powers, the multiverse, battle simulations, or story arcs. I'm running in Demo Mode on a local lore engine right now; add an API key to the environment and I'll answer with a real LLM instead.`
  }
  if (q.includes('who is spider-man') || q.includes('spiderman')) {
    return `I'll level with you: this universe is fully original — arachnid-inspired, but zero Marvel characters. Our hero is ARACHNID, codename ARX-7, the Guardian of the megacity Silkspire. Same iconic vibes: wall-crawling, precognitive Spider-Sense, programmable web. Ask me "who is the Guardian" for the full origin.`
  }
  if (q.includes('powers') || q.includes('abilities') || q.includes('what can')) {
    const doc = retrieve('powers abilities spider-sense web', 1)[0]
    return doc
      ? `${doc.excerpt}${doc.score > 0 ? `\n\n(source: ${doc.title})` : ''}`
      : 'The Guardian’s core powers: Spider-Sense precognition, wall-crawling nanofilaments, programmable web generation, and a 15x enhanced physiology. Ask me to "explain the powers" for details.'
  }
  if (q.includes('movie order') || q.includes('order') || q.includes('where to start')) {
    return `Read the Guardian Saga in arc order: 1) The First Bite, 2) The Weaver’s Pact, 3) Ghost in the Loom, 4) Split City, 5) The Omega Convergence, 6) Daybreak Protocol. Newcomer shortcut: start with The Weaver’s Pact — it has everything.`
  }
  if (q.includes('fun fact') || q.includes('facts')) {
    return pick(FACTS, Math.random)
  }
  if (q.includes('compare')) {
    const names = CHARACTERS.map((c) => c.name.toLowerCase())
    const found = names.filter((n) => q.includes(n))
    if (found.length >= 1) {
      const c = CHARACTERS.find((x) => x.name.toLowerCase() === found[0])!
      const rival = CHARACTERS.find((x) => x.name !== c.name && !['QUANTUM', 'VOX'].includes(x.name))!
      return `Comparing ${c.name} vs ${rival.name}:\n\n${c.name} (${c.role}) — Power ${c.stats.power}, Speed ${c.stats.speed}, Tech ${c.stats.tech}, Stealth ${c.stats.stealth}.\n${rival.name} — Power ${rival.stats.power}, Speed ${rival.stats.speed}, Tech ${rival.stats.tech}, Stealth ${rival.stats.stealth}.\n\nVerdict: ${c.stats.power >= rival.stats.power ? `${c.name} edges the raw-power check` : `${rival.name} wins raw power`}, but the real answer depends on the arena. Head to the Battle Simulator in the Lab for a full probability run.`
    }
    return 'Name two characters to compare — e.g. "compare ARACHNID and DR. NULLWEAVE". Or open the Lab for a full battle simulation.'
  }
  if (q.includes('who is ') || q.includes('tell me about')) {
    const retr = retrieve(q.replace(/who is|tell me about/g, ''), 2)
    if (retr.length && retr[0].score > 0.08) {
      return `${retr[0].excerpt}\n\n${retr[1] ? `Also relevant: ${retr[1].title}.` : ''}\n\n(source: ${retr[0].title})`
    }
  }
  if (q.includes('thank')) return `The web catches you. Anytime — and remember, X triggers Spider-Sense. 🕸️`
  if (q.includes('help')) {
    return `I can answer: "Who is the Guardian?", "Explain the powers", "Fun facts", "Movie order", "Compare X and Y", "Story ideas", "Suit recommendations", "What is the Weaver Syndicate?". Or ask about any character, universe, or arc in the lore.`
  }

  // Generic retrieval fallback
  const hits = retrieve(message, 3)
  if (hits.length && hits[0].score > 0.05) {
    return `${hits[0].excerpt}\n\n${hits[1] ? `Related: ${hits[1].title}. ` : ''}(source: ${hits[0].title})`
  }

  const fallbacks = [
    `Interesting angle. My lore net doesn't have a direct thread for that yet — but try asking about the Guardian, the Weaver Syndicate, a universe code like AR-77, or "fun facts".`,
    `Hmm, the web is quiet on that one. I can navigate: hero origin, powers, villains, multiverse, suit armory, story order, or battles. Where should I cast the line?`,
    `That's beyond my current lore strands. In AI Mode (add an API key) I could reason about it properly. For now, ask me about ARACHNID's powers, the saga order, or generate a story in the Forge.`,
  ]
  return pick(fallbacks, Math.random)
}

/* ---------------- story generator ---------------- */

const STORY_TEMPLATES: Record<string, { hook: string; mid: string; end: string }[]> = {
  fear: [
    { hook: 'The fear was the first thing they weaponized.', mid: 'Every shadow in the city moved like it had been waiting for this moment.', end: 'The Guardian learned that courage is not the absence of fear — it is deciding who you are while afraid.' },
  ],
  hope: [
    { hook: 'On the night the lights went out, one web line still glowed.', mid: 'The citizens of the city looked up, and for the first time in weeks, they believed.', end: 'Hope is a silk thread: invisible, unbreakable, and always holding someone.' },
  ],
  rage: [
    { hook: 'Rage burned through the Sector like a short circuit.', mid: 'The suit was overheating, but the Guardian did not care — this one was personal.', end: 'He won the fight, and immediately lost something more important: his calm. The web remembers every reckless swing.' },
  ],
  love: [
    { hook: 'The most dangerous mission had nothing to do with the Syndicate.', mid: 'It was a rooftop conversation, two cups of coffee, and the hardest words either had ever said.', end: 'He saved the city that night. She saved him. Neither mentioned it.' },
  ],
  doubt: [
    { hook: 'The Spider-Sense had gone silent. That was the worst part.', mid: 'A Guardian without his warning reflex is just a person in a very good suit.', end: 'He re-learned what the first Guardian knew: the suit is technology, but the hero is choice.' },
  ],
}

export function generateStory(input: StoryInput): StoryResult {
  const seed = hashString(`${input.villain}|${input.city}|${input.emotion}|${input.power}|${Date.now()}`)
  const rand = mulberry32(seed)
  const tpl = pick(STORY_TEMPLATES[input.emotion] ?? STORY_TEMPLATES.hope, rand)
  const city = input.city.trim() || 'Silkspire'
  const villain = input.villain.trim() || 'Dr. Nullweave'
  const power = input.power.trim() || 'the Spider-Sense'

  const title = pick(
    [
      `The ${capitalize(villain)} Protocol`,
      `Night of the ${capitalize(villain)}`,
      `${capitalize(city)} in the Balance`,
      `The Last Swing in ${capitalize(city)}`,
    ],
    rand,
  )

  return {
    title,
    chapters: [
      `CH.1 — THE CALL\n${tpl.hook} The Guardian felt it in his bones: ${power}, thrumming like a struck wire. Somewhere in ${city}, the ${villain} was moving — and everything the city knew was about to change.`,
      `CH.2 — THE HUNT\n${tpl.mid} He swung low, keeping to the shadows where even the streetlights couldn't follow. The citizens of ${city} whispered his name like a prayer, and somewhere in the dark, the ${villain} smiled at the sound.`,
      `CH.3 — THE CHOICE\nWhen they finally met — the Guardian and the ${villain} — the air itself seemed to hold its breath. "You think this is about power?" the ${villain} hissed. "No," the Guardian answered, pulling the web taut. "It was always about responsibility."`,
      `CH.4 — THE RESOLUTION\n${tpl.end} By dawn, ${city} was quiet again. Somewhere a window opened, a child pointed at the sky, and a tiny red-and-blue figure vanished into the first light of day.`,
    ],
    twist: `The ${villain} wasn't the true threat of the night — ${pick(['the city itself', 'a Guardian from a mirror universe', 'a rogue suit AI', 'a frightened kid with a stolen prototype'], rand)} was. The web has a way of hiding its sharpest strands.`,
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/* ---------------- suit generator ---------------- */

export function generateSuit(o: SuitOptions): SuitResult {
  const seed = hashString(`${o.base}|${o.accent}|${o.tech}|${o.stealth}|${o.power}`)
  const rand = mulberry32(seed)
  const prefix = pick(SUIT_PREFIX, rand)
  const suffix = pick(SUIT_SUFFIX, rand)
  const mark = Math.round(o.tech * 0.35 + o.power * 0.35 + (o.stealth ? 1 : 0) * 0.3)

  const webSpecs: Record<SuitOptions['webType'], string> = {
    'web-shooters': 'Twin wrist launchers · 4g web fluid · 12m/s',
    organic: 'Bio-weave organic silk · zero reload · skin-bonded',
    nano: 'Programmable nanoloom threads · self-healing',
    energy: 'Phase-energy strands · 30% lighter · plasma edge',
  }

  return {
    name: `${prefix}-${suffix} MK-${Math.max(1, Math.round(mark / 12))}`,
    mark,
    description: `A custom ${o.stealth ? 'light-bending stealth' : 'high-visibility'} suit with ${o.base} primary panels, ${o.accent} accents and a ${o.visor} visor. Tech matrix rated at ${o.tech}%, output power ${o.power}%. ${o.stealth ? 'Signature and thermal footprint suppressed by 92%.' : 'Maximum intimidation factor for the night patrols.'}`,
    specs: [
      { label: 'Tech matrix', value: `${o.tech}%` },
      { label: 'Power output', value: `${o.power}%` },
      { label: 'Stealth', value: o.stealth ? 'ACTIVE' : 'OFF' },
      { label: 'Web system', value: webSpecs[o.webType] },
      { label: 'Composite score', value: `${mark}/100` },
    ],
  }
}

/* ---------------- cover generator ---------------- */

const MOOD_TITLES: Record<string, string[]> = {
  epic: ['THE OMEGA PROTOCOL', 'LAST SWING', 'REIGN OF THREADS'],
  noir: ['THE GREY VEIL CASE', 'MIDNIGHT IN SILKSPIRE', 'THE VANISHING ACT'],
  neon: ['CHROME & COBWEBS', 'SYNTHCITY SLINGER', 'NEON GRAVEYARD'],
  cosmic: ['VOIDWEAVER', 'THE STAR-STRAND WAR', 'EDGE OF THE WEB'],
  dark: ['SHADOW OF THE LOOM', 'THE SILENT WEAVE', 'DREADPATTERN'],
}

export function generateCover(o: CoverOptions): CoverResult {
  const seed = hashString(`${o.hero}|${o.palette.join('')}|${o.mood}|${Date.now()}`)
  const rand = mulberry32(seed)
  const bank = MOOD_TITLES[o.mood] ?? MOOD_TITLES.epic
  return {
    title: pick(bank, rand),
    seed,
    palette: o.palette,
    mood: o.mood,
    style: o.style,
  }
}

/* ---------------- battle simulator ---------------- */

export function characterById(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id)
}

export function runBattle(a: Character, b: Character): BattleResult {
  const seed = hashString(`${a.id}|${b.id}|${Date.now()}`)
  const rand = mulberry32(seed)
  const rounds = 12
  const series: { a: number; b: number }[] = []

  const aPow = a.stats.power + a.stats.speed * 0.5 + a.stats.intelligence * 0.35
  const bPow = b.stats.power + b.stats.speed * 0.5 + b.stats.intelligence * 0.35

  let aHealth = 100
  let bHealth = 100
  for (let r = 0; r < rounds; r++) {
    const aHit = Math.max(2, aPow * (0.6 + rand() * 0.8) - b.stats.durability * 0.25)
    const bHit = Math.max(2, bPow * (0.6 + rand() * 0.8) - a.stats.durability * 0.25)
    aHealth -= bHit * (rand() < 0.3 ? 0.5 : 1) // dodge chance via speed
    bHealth -= aHit * (rand() < 0.3 ? 0.5 : 1)
    series.push({ a: Math.max(0, Math.round(100 - aHealth)), b: Math.max(0, Math.round(100 - bHealth)) })
  }

  const winProbA = Math.round((aPow / (aPow + bPow)) * 100)
  const winner: BattleResult['winner'] = aHealth >= bHealth ? 'a' : 'b'
  const winnerChar = winner === 'a' ? a : b
  const loserChar = winner === 'a' ? b : a

  const narration = [
    `${a.name} opens with a ${a.stats.speed >= 88 ? 'blindingly fast' : 'measured'} first strike — the crowd barely registers the motion.`,
    `${b.name} absorbs the hit and counters with a ${b.stats.power >= 85 ? 'devastating' : 'careful'} response.`,
    `Mid-fight, ${a.name}${a.stats.stealth >= 85 ? ' vanishes into shadow and reappears behind the target' : ' presses forward relentlessly'}.`,
    `${winnerChar.name} closes the fight with a textbook ${winnerChar.stats.intelligence >= 90 ? 'stratagem' : 'power play'}.`,
    `Verdict: ${winnerChar.name} takes it in ${rounds} rounds. ${loserChar.name} fought well — but the web favors the prepared.`,
  ]

  return { a: { name: a.name, score: 100 - aHealth }, b: { name: b.name, score: 100 - bHealth }, rounds: series, winner, winProbA, narration }
}

/* ---------------- missions & trivia ---------------- */

export function generateMissions(input: MissionInput): GeneratedMission[] {
  const pool = [
    { title: 'Skyline Sweep', desc: `Patrol ${input.persona || 'Silkspire'} and clear the rooftops of Syndicate signal drones.`, reward: 120 },
    { title: 'The Tether Reroute', desc: 'Re-route the public web before Nullweave can weaponize it.', reward: 150 },
    { title: 'Echo in the Grey Veil', desc: `Track an Obsidian Widow strike team through the fog.`, reward: 180 },
    { title: 'Prototype Heist', desc: 'Recover a stolen ARX prototype from Sector 9 black market.', reward: 160 },
    { title: 'Citizen First', desc: 'Evacuate the district before the Shockwave hits. No civilian left behind.', reward: 200 },
    { title: 'Silkstrike Backup', desc: 'Watch the kid’s back on her first solo patrol.', reward: 140 },
  ]
  const mult = input.difficulty
  return pool.slice(0, 3 + input.difficulty).map((m, i) => ({
    id: `g${Date.now()}-${i}`,
    title: m.title,
    desc: m.desc,
    reward: m.reward * mult,
  }))
}

export const TRIVIA_BANK: TriviaQuestion[] = [
  { q: 'What city does ARACHNID protect?', options: ['Silkspire', 'Neo-Tokyo', 'Vesper Falls', 'The Grid'], answer: 0, fact: 'Silkspire is a vertical megacity of 40 million, built like a web.' },
  { q: 'What is the Guardian’s workshop AI called?', options: ['SIRI', 'LUMEN', 'VECTOR', 'Pixel'], answer: 1, fact: 'LUMEN runs the ARX workshop and inspired this website’s assistant.' },
  { q: 'Which villain wants to reweave humanity into one machine mind?', options: ['VOX', 'Obsidian Widow', 'Dr. Nullweave', 'The Patriarch'], answer: 2, fact: 'Nullweave has lost eleven battles — and escaped every single one.' },
  { q: 'How long does a Guardian web strand last?', options: ['4 hours', '4 days', '4 minutes', 'Until it rains'], answer: 0, fact: 'Webs dissolve after four hours and are 100% recyclable.' },
  { q: 'What is the Mirror War dimension code?', options: ['AR-42', 'AR-77', 'AR-99', 'AR-13'], answer: 1, fact: 'In AR-77, good and evil are flipped — an inverted Guardian army invaded Prime.' },
  { q: 'Who is the first Guardian?', options: ['The Patriarch', 'Scarlet Shift', 'Quantum', 'Silkstrike'], answer: 0, fact: 'The Patriarch mentored the first generation from AR-100 Omega.' },
  { q: 'Which hero patrols AR-09 Neon?', options: ['VOX', 'Scarlet Shift', 'Silkstrike', 'Obsidian Widow'], answer: 1, fact: 'Scarlet Shift once beat the Guardian in a race. Once.' },
  { q: 'What did the first suit start as?', options: ['A lab coat and a drone harness', 'A racing suit', 'A firefighter uniform', 'A spacesuit'], answer: 0, fact: 'Rohan Akhtar built MK-0 from whatever survived the Sector 9 lab accident.' },
  { q: 'What stuns the Guardian reliably?', options: ['Loud music', 'Sonic blasts', 'Cold weather', 'Spiders'], answer: 1, fact: 'VOX’s sonic amplification is the only thing that reliably stuns him.' },
  { q: 'What is the motto passed to ARACHNID?', options: ['With great power comes great responsibility', 'The web never sleeps', 'Spin fast, fall slow', 'Every strand tells a story'], answer: 0, fact: 'The motto came from Dr. Lena Voss — and originally, the Patriarch.' },
]

export function generateTrivia(n = 5): TriviaQuestion[] {
  const shuffled = [...TRIVIA_BANK].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, shuffled.length))
}
