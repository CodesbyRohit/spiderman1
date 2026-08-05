export interface AchievementDef {
  id: string
  title: string
  desc: string
  xp: number
  secret?: boolean
  icon: string
}

/** The full achievement catalogue. Secret ones only reveal after unlock. */
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_visit', title: 'First Signal', desc: 'Entered the web for the first time.', xp: 50, icon: '🕸️' },
  { id: 'story_scroll', title: 'Prologue', desc: 'Reached the end of the first chapter.', xp: 100, icon: '📜' },
  { id: 'konami', title: '8-BIT ARCHIVE', desc: 'Entered the Konami code. Reality now runs at 8 frames.', xp: 250, secret: true, icon: '👾' },
  { id: 'spider_sense', title: 'Precognition', desc: 'Triggered Spider-Sense mode.', xp: 120, icon: '⚡' },
  { id: 'first_chat', title: 'First Contact', desc: 'Asked the AI assistant a question.', xp: 80, icon: '💬' },
  { id: 'story_made', title: 'Worldsmith', desc: 'Generated an AI story.', xp: 150, icon: '✍️' },
  { id: 'suit_made', title: 'Suit Forged', desc: 'Designed a custom suit.', xp: 150, icon: '🧵' },
  { id: 'cover_made', title: 'Cover Artist', desc: 'Generated a comic cover.', xp: 150, icon: '🎨' },
  { id: 'battle_ran', title: 'Battle Analyst', desc: 'Simulated a battle.', xp: 120, icon: '⚔️' },
  { id: 'skill_unlock', title: 'Ascension', desc: 'Unlocked your first skill node.', xp: 100, icon: '🌟' },
  { id: 'all_skills', title: 'Mastery', desc: 'Unlocked every skill node.', xp: 500, icon: '👑' },
  { id: 'dev_mode', title: 'Behind the Mask', desc: 'Opened developer mode.', xp: 200, secret: true, icon: '🛠️' },
  { id: 'voice_use', title: 'Vocal Cords', desc: 'Used a voice command.', xp: 100, icon: '🎙️' },
  { id: 'portal', title: 'Portal Hopper', desc: 'Found the hidden portal.', xp: 200, secret: true, icon: '🌀' },
  { id: 'universe_5', title: 'Multiverse Tourist', desc: 'Explored five universes on the map.', xp: 150, icon: '🌌' },
  { id: 'collector', title: 'Curator', desc: 'Saved three suits to your collection.', xp: 150, icon: '🏛️' },
  { id: 'daily_done', title: 'Daily Grind', desc: 'Completed a daily mission.', xp: 100, icon: '📆' },
  { id: 'console_lore', title: 'Deep Lore', desc: 'Ran arachnid.help() in the console.', xp: 150, secret: true, icon: '💻' },
  { id: 'night_owl', title: 'Night Owl', desc: 'Switched the world to night mode.', xp: 60, icon: '🌙' },
  { id: 'mission_5', title: 'Overachiever', desc: 'Completed five missions total.', xp: 300, icon: '🏅' },
  { id: 'level_5', title: 'Rising Hero', desc: 'Reached level 5.', xp: 200, icon: '🚀' },
  { id: 'level_10', title: 'Legend', desc: 'Reached level 10.', xp: 500, icon: '🌠' },
]

/** XP -> level. Level 1 = 0xp, then quadratic growth for a satisfying curve. */
export function levelFromXp(xp: number): { level: number; into: number; needed: number; progress: number } {
  const level = Math.floor(Math.sqrt(xp / 60)) + 1
  const needed = Math.pow(level, 2) * 60
  const prev = Math.pow(level - 1, 2) * 60
  const progress = xp <= prev ? 0 : Math.min(1, (xp - prev) / Math.max(1, needed - prev))
  return { level, into: xp - prev, needed: needed - prev, progress }
}

export const LEVEL_TITLES = [
  'Initiate',
  'Trainee',
  'Web-Slinger',
  'Guardian',
  'Sentinel',
  'Vanguard',
  'Overwatch',
  'Apex',
  'Mythic',
  'Legend',
]
export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
}
