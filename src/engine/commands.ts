import type { Ctx } from './ctx'
import { emit, mishap, react, removeThing, say } from './ctx'
import { add, manhattan, touching, turn } from './geometry'
import { step } from './movement'
import { THINGS } from './things'
import type { Command, Thing, Vec } from './types'
import { canHold, floorAt, thingAt } from './world'

export function execute(ctx: Ctx, command: Command): void {
  const { robot } = ctx.world
  switch (command) {
    case 'FRWD':
      return step(ctx, robot.facing)
    case 'BKWD':
      ctx.backwards = true
      return step(ctx, turn(robot.facing, 2))
    case 'LEFT':
    case 'RGHT': {
      const from = robot.facing
      robot.facing = turn(from, command === 'LEFT' ? -1 : 1)
      return emit(ctx, { type: 'turned', from, to: robot.facing })
    }
    case 'PICK':
      return pick(ctx)
    case 'DROP':
      return drop(ctx)
    case 'BEEP':
      return beep(ctx)
    case 'DOWN':
      return sit(ctx)
    case 'STUP':
      return stand(ctx)
  }
}

/** Something portable at his feet first, then whatever is in front, then whatever is at his feet. */
function pick(ctx: Ctx): void {
  const { world } = ctx
  const { robot } = world
  const here = thingAt(world, robot.pos)
  const front = thingAt(world, add(robot.pos, robot.facing))
  const candidates = [here, front].filter((t): t is Thing => !!t)
  const target = candidates.find((t) => THINGS[t.kind].portable) ?? candidates[0]
  if (!target) return mishap(ctx, 'pickNose')
  if (robot.holding) return juggle(ctx, robot.holding)
  const { onPick, portable } = THINGS[target.kind]
  if (onPick) return onPick(ctx, target)
  if (!portable) return mishap(ctx, 'tooHeavy')
  world.things = world.things.filter((t) => t.id !== target.id)
  robot.holding = target
  emit(ctx, { type: 'picked', thing: target })
}

/** Holding one thing and grabbing another: he fumbles, and what he was holding lands nearby if there's room. */
function juggle(ctx: Ctx, held: Thing): void {
  mishap(ctx, 'juggle')
  const { robot } = ctx.world
  const spot = [add(robot.pos, robot.facing), robot.pos].find((p) => canHold(ctx.world, p))
  if (spot) putDown(ctx, held, spot)
}

function drop(ctx: Ctx): void {
  const { world } = ctx
  const { robot } = world
  const held = robot.holding
  if (!held) return mishap(ctx, 'headOff')
  const ahead = add(robot.pos, robot.facing)
  const receiver = thingAt(world, ahead)
  if (receiver && THINGS[receiver.kind].accepts?.(held.kind)) {
    robot.holding = null
    receiver.given = held.kind
    emit(ctx, { type: 'gave', thing: held, to: receiver })
    THINGS[receiver.kind].onGiven?.(ctx, receiver, held)
    if (dogSnatches(ctx, held, ahead)) receiver.given = undefined
    return
  }
  if (floorAt(world, ahead) === 'water') {
    robot.holding = null
    removeThing(ctx, { ...held, pos: ahead }, 'floated')
    return mishap(ctx, 'floatedAway')
  }
  const spot = [ahead, robot.pos].find((p) => canHold(world, p))
  if (!spot) return mishap(ctx, 'noRoom')
  putDown(ctx, held, spot)
}

function putDown(ctx: Ctx, thing: Thing, at: Vec): void {
  const placed = { ...thing, pos: at }
  ctx.world.robot.holding = null
  ctx.world.things.push(placed)
  emit(ctx, { type: 'dropped', thing: placed, at })
  if (dogSnatches(ctx, placed, at)) ctx.world.things = ctx.world.things.filter((t) => t.id !== placed.id)
}

/** Biscuits that land next to an awake dog are gone. */
function dogSnatches(ctx: Ctx, item: Thing, at: Vec): boolean {
  if (item.kind !== 'biscuits') return false
  const dog = ctx.world.things.find((t) => t.kind === 'dog' && t.awake && touching(t.pos, at))
  if (!dog) return false
  react(ctx, dog, 'ate')
  emit(ctx, { type: 'thingGone', thing: item, at, how: 'eaten' })
  mishap(ctx, 'dogAte')
  return true
}

/** Everything within two steps hears it. */
function beep(ctx: Ctx): void {
  const { world } = ctx
  emit(ctx, { type: 'beeped' })
  say(ctx, 'BEEP BEEP!')
  for (const thing of [...world.things]) {
    if (manhattan(thing.pos, world.robot.pos) > 2) continue
    if (!world.beeped.includes(thing.kind)) world.beeped.push(thing.kind)
    THINGS[thing.kind].onBeep?.(ctx, thing)
    if (world.kaput) return
  }
}

function sit(ctx: Ctx): void {
  const { world } = ctx
  if (world.robot.posture === 'sitting') return mishap(ctx, 'legsInAir')
  world.robot.posture = 'sitting'
  emit(ctx, { type: 'sat' })
  const thing = thingAt(world, world.robot.pos)
  if (thing) THINGS[thing.kind].onSit?.(ctx, thing)
}

function stand(ctx: Ctx): void {
  const { world } = ctx
  const { robot } = world
  if (robot.posture === 'standing') return mishap(ctx, 'neckBoing')
  if (floorAt(world, robot.pos) === 'table') {
    emit(ctx, { type: 'bonked', at: robot.pos, into: 'table' })
    robot.dizzy = true
    return mishap(ctx, 'headBonk')
  }
  robot.posture = 'standing'
  emit(ctx, { type: 'stood' })
}
