import { describe, expect, it } from 'vitest'
import { run, stars } from './run'
import { room } from './testing'
import type { RunResult, WorldEvent } from './types'

const events = (r: RunResult): WorldEvent[] => r.trace.flatMap((s) => s.events)
const mishaps = (r: RunResult) => events(r).flatMap((e) => (e.type === 'mishap' ? [e.id] : []))
const last = (r: RunResult) => r.trace.at(-1)!.world

describe('run', () => {
  it('walks, and wins when the goal holds at the end', () => {
    const level = { ...room(['#####', '#>.F#', '#####']), goal: { type: 'onThing', thing: 'flag' } as const }
    const result = run(level, ['FRWD', 'FRWD'])
    expect(result.outcome).toEqual({ kind: 'win' })
    expect(result.trace.map((s) => s.pc)).toEqual([0, 1])
    expect(last(result).robot.pos).toEqual({ x: 3, y: 1 })
  })

  it('shrugs when the program runs out first', () => {
    const level = { ...room(['#####', '#>.F#', '#####']), goal: { type: 'onThing', thing: 'flag' } as const }
    const result = run(level, ['FRWD'])
    expect(result.outcome).toEqual({ kind: 'incomplete' })
    expect(result.trace.at(-1)).toMatchObject({ pc: 1, events: [{ type: 'shrugged' }, { type: 'said', text: 'Does not compute?' }] })
  })

  it('stops at kaput and ignores the rest of the program', () => {
    const result = run(room(['####', '#>~#', '####']), ['FRWD', 'LEFT', 'LEFT'])
    expect(result.trace).toHaveLength(1)
    expect(last(result).robot.rusty).toBe(true)
  })

  it('carries on after an oops', () => {
    const result = run(room(['###', '#>#', '###']), ['FRWD', 'LEFT'])
    expect(result.trace).toHaveLength(3)
    expect(result.trace[0]!.world.robot.dizzy).toBe(true)
    expect(result.trace[1]!.world.robot.dizzy).toBe(false)
  })

  it('marks mishaps met going backwards', () => {
    const result = run(room(['###', '#<#', '###']), ['BKWD'])
    expect(events(result)).toContainEqual(expect.objectContaining({ type: 'mishap', id: 'bonk', backwards: true }))
  })

  it('never changes an earlier step', () => {
    const result = run(room(['#####', '#>..#', '#####']), ['FRWD', 'FRWD'])
    expect(result.trace[0]!.world.robot.pos).toEqual({ x: 2, y: 1 })
  })
})

describe('tables', () => {
  const map = ['#####', '#>T.#', '#####']
  it('scoots under sitting, and bonks his head standing up there', () => {
    const result = run(room(map), ['DOWN', 'FRWD', 'STUP', 'FRWD', 'STUP'])
    expect(mishaps(result)).toEqual(['headBonk'])
    expect(last(result).robot).toMatchObject({ pos: { x: 3, y: 1 }, posture: 'standing' })
  })
})

describe('bananas', () => {
  it('slide him until a wall stops him, without a bonk', () => {
    const result = run(room(['#######', '#>N...#', '#######']), ['FRWD'])
    expect(last(result).robot.pos).toEqual({ x: 5, y: 1 })
    expect(mishaps(result)).toEqual([])
    expect(events(result)).toContainEqual({ type: 'slid', from: { x: 2, y: 1 }, to: { x: 5, y: 1 } })
  })

  it('stop on whatever is lying in the way', () => {
    const result = run(room(['#######', '#>N.L.#', '#######']), ['FRWD'])
    expect(last(result).robot.pos).toEqual({ x: 4, y: 1 })
    expect(mishaps(result)).toEqual(['ouch'])
  })

  it('slide him into the pond', () => {
    const result = run(room(['######', '#>N.~#', '######']), ['FRWD'])
    expect(result.outcome).toEqual({ kind: 'kaput', mishap: 'splash' })
  })
})

describe('beeping', () => {
  it('scatters pigeons within two cells, clearing the way', () => {
    const result = run(room(['######', '#>.P.#', '######']), ['BEEP', 'FRWD', 'FRWD', 'FRWD'])
    expect(mishaps(result)).toEqual([])
    expect(last(result).robot.pos).toEqual({ x: 4, y: 1 })
    expect(last(result).beeped).toEqual(['pigeons'])
  })

  it('leaves things further away alone', () => {
    const result = run(room(['######', '#>..P#', '######']), ['BEEP'])
    expect(last(result).things).toHaveLength(1)
  })

  it('wakes the dog, who goes to his basket', () => {
    const result = run(room(['######', '#>D.u#', '######']), ['BEEP'])
    expect(last(result).things[0]).toMatchObject({ kind: 'dog', awake: true, pos: { x: 4, y: 1 } })
  })
})

describe('the baby', () => {
  it('wakes when something loud happens nearby', () => {
    const result = run(room(['#####', '#.Z.#', '#>L.#', '#####']), ['FRWD'])
    expect(result.outcome).toEqual({ kind: 'kaput', mishap: 'babyWoke' })
  })

  it('takes the bottle', () => {
    const level = { ...room(['######', '#>O.Z#', '######']), goal: { type: 'gave', thing: 'bottle', to: 'baby' } as const }
    expect(run(level, ['PICK', 'FRWD', 'FRWD', 'DROP']).outcome).toEqual({ kind: 'win' })
  })
})

describe('handing things over', () => {
  it('gives the girl what is dropped in front of her', () => {
    const level = { ...room(['#####', '#>BG#', '#####']), goal: { type: 'gave', thing: 'biscuits', to: 'girl' } as const }
    const result = run(level, ['PICK', 'FRWD', 'DROP'])
    expect(result.outcome).toEqual({ kind: 'win' })
    expect(events(result)).toContainEqual({ type: 'said', text: 'Thank you, Daddy!' })
  })

  it('puts things down in front when nobody is there to take them', () => {
    const result = run(room(['#####', '#.>B#', '#####']), ['PICK', 'LEFT', 'LEFT', 'DROP'])
    expect(last(result).things).toEqual([expect.objectContaining({ kind: 'biscuits', pos: { x: 1, y: 1 } })])
  })

  it('gets toast from a toaster when his feet are dry', () => {
    const level = { ...room(['####', '#>K#', '####']), goal: { type: 'holding', thing: 'toast' } as const }
    expect(run(level, ['PICK']).outcome).toEqual({ kind: 'win' })
  })
})

describe('prickly things', () => {
  it('launch him a cell forwards, standing', () => {
    const result = run(room(['#####', '#>X.#', '#####']), ['FRWD', 'DOWN'])
    expect(last(result).robot).toMatchObject({ pos: { x: 3, y: 1 }, posture: 'standing' })
  })
})

describe('stars', () => {
  const level = { ...room(['######', '#>.LF#', '######']), goal: { type: 'onThing', thing: 'flag' } as const, solution: ['FRWD' as const] }
  it('gives one for winning, one for no mishaps, one for par', () => {
    const program = ['FRWD', 'FRWD', 'FRWD'] as const
    expect(stars(level, program, run(level, program))).toEqual({ won: true, clean: false, short: false, count: 1 })
  })
})
