import type { Ctx } from './ctx'
import { emit, mishap } from './ctx'
import { add } from './geometry'
import { THINGS } from './things'
import type { Dir, Thing, Vec } from './types'
import { floorAt, isSolid, thingAt } from './world'

type Blocker = { kind: 'floor'; at: Vec } | { kind: 'table'; at: Vec } | { kind: 'thing'; at: Vec; thing: Thing }

/** Why he can't go into `to`, or nothing if he can. Only a sitting robot fits under a table. */
function blockerAt(ctx: Ctx, to: Vec): Blocker | undefined {
  const { world } = ctx
  const floor = floorAt(world, to)
  if (isSolid(floor)) return { kind: 'floor', at: to }
  if (floor === 'table' && world.robot.posture === 'standing') return { kind: 'table', at: to }
  const thing = thingAt(world, to)
  if (thing && !THINGS[thing.kind].walkable) return { kind: 'thing', at: to, thing }
  return undefined
}

function bump(ctx: Ctx, blocker: Blocker): void {
  const { world } = ctx
  if (blocker.kind === 'thing') {
    emit(ctx, { type: 'bonked', at: blocker.at, into: blocker.thing.kind })
    const onBump = THINGS[blocker.thing.kind].onBump
    if (onBump) return onBump(ctx, blocker.thing)
    world.robot.dizzy = true
    return mishap(ctx, 'bonk')
  }
  const into = floorAt(world, blocker.at)
  emit(ctx, { type: 'bonked', at: blocker.at, into })
  world.robot.dizzy = true
  mishap(ctx, blocker.kind === 'table' ? 'headBonk' : 'bonk')
}

/** What happens on arriving in a cell: water, then whatever is lying there. */
function arrive(ctx: Ctx, dir: Dir, sliding: boolean): void {
  const { world } = ctx
  const { robot } = world
  if (floorAt(world, robot.pos) === 'water') {
    robot.rusty = true
    mishap(ctx, 'splash')
    return
  }
  const thing = thingAt(world, robot.pos)
  if (!thing) return
  const behaviour = THINGS[thing.kind]
  if (behaviour.slippery) {
    if (!sliding) slide(ctx, dir)
    return
  }
  const hook = robot.posture === 'sitting' ? behaviour.onSit : behaviour.onEnter
  hook?.(ctx, thing)
}

/** FRWD and BKWD: one cell in `dir`, unless something is in the way. */
export function step(ctx: Ctx, dir: Dir): void {
  const { robot } = ctx.world
  const to = add(robot.pos, dir)
  const blocker = blockerAt(ctx, to)
  if (blocker) return bump(ctx, blocker)
  const from = robot.pos
  robot.pos = to
  const how = robot.posture === 'sitting' ? 'scoot' : ctx.backwards ? 'back' : 'walk'
  emit(ctx, { type: 'moved', from, to, how })
  arrive(ctx, dir, false)
}

/** Off a banana: he carries on in `dir` until something stops him, water swallows him, or he lands on a thing. */
function slide(ctx: Ctx, dir: Dir): void {
  const { robot } = ctx.world
  const from = robot.pos
  for (;;) {
    const to = add(robot.pos, dir)
    const blocker = blockerAt(ctx, to)
    if (blocker) {
      emit(ctx, { type: 'slid', from, to: robot.pos })
      if (blocker.kind === 'thing') THINGS[blocker.thing.kind].onSlideInto?.(ctx, blocker.thing)
      return
    }
    robot.pos = to
    const thing = thingAt(ctx.world, to)
    const stops = floorAt(ctx.world, to) === 'water' || (thing && !THINGS[thing.kind].slippery)
    if (stops) {
      emit(ctx, { type: 'slid', from, to })
      arrive(ctx, dir, true)
      return
    }
  }
}

/** Sat on something prickly: he lands one cell ahead, standing, or back where he was if it's blocked. */
export function launch(ctx: Ctx): void {
  const { robot } = ctx.world
  const to = add(robot.pos, robot.facing)
  if (blockerAt(ctx, to)) return
  const from = robot.pos
  robot.pos = to
  emit(ctx, { type: 'launched', from, to })
  arrive(ctx, robot.facing, false)
}
