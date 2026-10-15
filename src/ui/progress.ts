import { COMMANDS, type Command } from '../engine'
import { LEVELS } from '../levels/levels'

const KEY = 'daddy-robot:v1'

export interface Progress {
  /** Best star count per level id. */
  stars: Record<string, number>
  /** The program left in each level's strip. */
  programs: Record<string, Command[]>
  muted: boolean
  speech: boolean
  fast: boolean
}

const EMPTY: Progress = { stars: {}, programs: {}, muted: false, speech: true, fast: false }

/** Storage can throw (private mode, blocked site data); the game then simply forgets on reload. */
export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const saved = JSON.parse(raw) as Partial<Progress>
    const programs = Object.fromEntries(
      Object.entries(saved.programs ?? {}).map(([id, p]) => [id, p.filter((c) => (COMMANDS as readonly string[]).includes(c))]),
    )
    return { ...EMPTY, ...saved, programs }
  } catch {
    return EMPTY
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // Not saved; nothing else depends on it.
  }
}

/** A level opens once the one before it has been finished; `?all` opens every level, for grown-ups testing. */
export const unlocked = (progress: Progress, index: number): boolean =>
  index === 0 || (progress.stars[LEVELS[index - 1]?.id ?? ''] ?? 0) > 0 || new URLSearchParams(location.search).has('all')
