import type { Ctx } from '../ctx'
import { mishap, moveThing, react } from '../ctx'
import { manhattan } from '../geometry'
import type { Thing, Vec } from '../types'
import type { ThingBehaviour } from './behaviour'

/** A woken dog wanders off to the nearest empty basket, if there is one, and stays awake. */
function wake(ctx: Ctx, dog: Thing): void {
  if (dog.awake) return
  dog.awake = true
  react(ctx, dog, 'woke')
  const baskets: Vec[] = []
  ctx.world.floor.forEach((row, y) =>
    row.forEach((floor, x) => {
      if (floor === 'basket' && !ctx.world.things.some((t) => t.pos.x === x && t.pos.y === y)) baskets.push({ x, y })
    }),
  )
  const nearest = baskets.toSorted((a, b) => manhattan(a, dog.pos) - manhattan(b, dog.pos))[0]
  if (nearest) moveThing(ctx, dog, nearest)
}

export const dog: ThingBehaviour = {
  walkable: false,
  portable: false,
  onBump: (ctx, thing) => {
    mishap(ctx, 'woof')
    wake(ctx, thing)
  },
  onBeep: (ctx, thing) => wake(ctx, thing),
}
