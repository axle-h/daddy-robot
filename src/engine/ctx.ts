import { manhattan } from './geometry'
import { MISHAPS } from './mishaps'
import type { MishapId, Reaction, Thing, Vec, World, WorldEvent } from './types'

/** One command's work in progress: a private copy of the world, mutated in place, and its events. */
export interface Ctx {
  world: World
  events: WorldEvent[]
  /** BKWD: the same mishaps, but he didn't see them coming. */
  backwards: boolean
}

export const emit = (ctx: Ctx, event: WorldEvent): void => {
  ctx.events.push(event)
}

export const say = (ctx: Ctx, text: string): void => emit(ctx, { type: 'said', text })

export const react = (ctx: Ctx, thing: Thing, reaction: Reaction): void =>
  emit(ctx, { type: 'thingReacted', id: thing.id, kind: thing.kind, reaction })

export function mishap(ctx: Ctx, id: MishapId): void {
  if (ctx.world.kaput) return
  const spec = MISHAPS[id]
  emit(ctx, { type: 'mishap', id, kaput: spec.kaput, backwards: ctx.backwards })
  say(ctx, spec.say)
  ctx.world.mishaps.push(id)
  if (spec.kaput) ctx.world.kaput = id
  if (spec.loud) wakeBabies(ctx)
}

export function wakeBabies(ctx: Ctx): void {
  for (const baby of ctx.world.things) {
    if (baby.kind !== 'baby' || baby.awake || manhattan(baby.pos, ctx.world.robot.pos) > 2) continue
    baby.awake = true
    react(ctx, baby, 'cried')
    mishap(ctx, 'babyWoke')
  }
}

export function removeThing(ctx: Ctx, thing: Thing, how: 'flew' | 'eaten' | 'floated'): void {
  ctx.world.things = ctx.world.things.filter((t) => t.id !== thing.id)
  emit(ctx, { type: 'thingGone', thing, at: thing.pos, how })
}

export function moveThing(ctx: Ctx, thing: Thing, to: Vec): void {
  const from = thing.pos
  thing.pos = to
  emit(ctx, { type: 'thingMoved', id: thing.id, kind: thing.kind, from, to })
}
