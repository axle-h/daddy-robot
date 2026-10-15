import { describe, expect, it } from 'vitest'
import { parseLevel, run, type MishapId, type RunResult } from '../engine'
import { LEVELS } from './levels'

const mishaps = (r: RunResult): MishapId[] => r.trace.flatMap((s) => s.events.flatMap((e) => (e.type === 'mishap' ? [e.id] : [])))
const level = (id: string) => LEVELS.find((l) => l.id === id)!

describe.each(LEVELS.map((l, i) => [`${i + 1}. ${l.title}`, l] as const))('%s', (_, l) => {
  it('parses', () => {
    expect(() => parseLevel(l)).not.toThrow()
  })

  it('is won by its reference solution, with no mishaps', () => {
    const result = run(l, l.solution)
    expect(result.outcome).toEqual({ kind: 'win' })
    expect(mishaps(result)).toEqual([])
  })

  it('only needs commands it offers', () => {
    expect(l.solution.filter((c) => !l.commands.includes(c))).toEqual([])
  })

  it('is not already won before anything happens', () => {
    expect(run(l, []).outcome).toEqual({ kind: 'incomplete' })
  })
})

it('has unique ids', () => {
  expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length)
})

it('brings in at most one new pair of commands per level', () => {
  const seen = new Set<string>()
  for (const l of LEVELS) {
    expect(l.commands.filter((c) => !seen.has(c)).length).toBeLessThanOrEqual(2)
    for (const c of l.commands) seen.add(c)
  }
})

describe('the easy mistakes', () => {
  it('walkies: one step too many is a bonk', () => {
    expect(mishaps(run(level('walkies'), ['FRWD', 'FRWD', 'FRWD', 'FRWD']))).toEqual(['bonk'])
  })

  it('reverse parking: driving in forwards hits the bins', () => {
    expect(mishaps(run(level('reverse-parking'), ['FRWD', 'FRWD', 'LEFT', 'FRWD', 'FRWD', 'FRWD']))).toEqual(['bins'])
  })

  it('mind the pond: straight ahead is the pond', () => {
    expect(run(level('mind-the-pond'), ['FRWD']).outcome).toEqual({ kind: 'kaput', mishap: 'splash' })
  })

  it('lego minefield: the straight route wins, noisily', () => {
    const result = run(level('lego-minefield'), ['FRWD', 'FRWD', 'FRWD', 'FRWD'])
    expect(result.outcome).toEqual({ kind: 'win' })
    expect(mishaps(result)).toEqual(['ouch', 'ouch', 'ouch'])
  })

  it('banana boulevard: stepping on the banana where it lies ends in the fish tank', () => {
    expect(run(level('banana-boulevard'), ['FRWD']).outcome).toEqual({ kind: 'kaput', mishap: 'fishtank' })
  })

  it('shhh: the Lego next to the cot wakes the baby', () => {
    const program = ['FRWD', 'PICK', 'RGHT', 'FRWD', 'FRWD', 'LEFT', 'FRWD', 'FRWD'] as const
    expect(run(level('shhh'), [...program]).outcome).toEqual({ kind: 'kaput', mishap: 'babyWoke' })
  })

  it('sleeping dogs: beeping the dog out of the doorway costs the biscuits', () => {
    const program = ['PICK', 'RGHT', 'FRWD', 'LEFT', 'BEEP', 'FRWD', 'FRWD', 'FRWD', 'FRWD', 'DROP'] as const
    expect(run(level('sleeping-dogs'), [...program]).outcome).toEqual({ kind: 'kaput', mishap: 'dogAte' })
  })

  it("sparky's toaster: reaching from the puddle is a zap", () => {
    const program = ['FRWD', 'FRWD', 'LEFT', 'FRWD', 'PICK'] as const
    expect(run(level('sparkys-toaster'), [...program]).outcome).toEqual({ kind: 'kaput', mishap: 'zap' })
  })

  it('picnic: the whoopee cushion is on the way', () => {
    expect(mishaps(run(level('picnic'), ['FRWD', 'FRWD', 'FRWD']))).toEqual(['pffft'])
  })
})
