import { execute } from './commands'
import type { Ctx } from './ctx'
import { achieved } from './goals'
import { parseLevel } from './parse'
import type { Command, Level, RunResult, TraceStep } from './types'

export function run(level: Level, program: readonly Command[]): RunResult {
  let world = parseLevel(level)
  const trace: TraceStep[] = []
  for (const [pc, command] of program.entries()) {
    const ctx: Ctx = { world: structuredClone(world), events: [], backwards: false }
    ctx.world.robot.dizzy = false
    execute(ctx, command)
    world = ctx.world
    trace.push({ pc, events: ctx.events, world })
    if (world.kaput) return { trace, outcome: { kind: 'kaput', mishap: world.kaput } }
  }
  if (achieved(level.goal, world)) return { trace, outcome: { kind: 'win' } }
  trace.push({
    pc: program.length,
    events: [{ type: 'shrugged' }, { type: 'said', text: 'Does not compute?' }],
    world,
  })
  return { trace, outcome: { kind: 'incomplete' } }
}

export interface Stars {
  won: boolean
  /** No oops on the way. */
  clean: boolean
  /** Within par. */
  short: boolean
  count: number
}

export function stars(level: Level, program: readonly Command[], result: RunResult): Stars {
  const won = result.outcome.kind === 'win'
  const last = result.trace.at(-1)?.world
  const clean = won && (last?.mishaps.length ?? 0) === 0
  const short = won && program.length <= (level.par ?? level.solution.length)
  return { won, clean, short, count: [won, clean, short].filter(Boolean).length }
}
