import { mishap, moveThing, react } from '../ctx'
import { add, turn } from '../geometry'
import { canHold } from '../world'
import type { ThingBehaviour } from './behaviour'

export const cat: ThingBehaviour = {
  walkable: true,
  portable: false,
  onPick: (ctx) => mishap(ctx, 'scratch'),
  onSit: (ctx, thing) => {
    mishap(ctx, 'mrrow')
    const { robot } = ctx.world
    const escape = ([0, 1, -1, 2] as const)
      .map((by) => add(thing.pos, turn(robot.facing, by)))
      .find((p) => canHold(ctx.world, p))
    react(ctx, thing, 'fled')
    if (escape) moveThing(ctx, thing, escape)
  },
}
