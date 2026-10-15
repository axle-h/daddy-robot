import { emit, mishap, react } from '../ctx'
import { floorAt } from '../world'
import type { Thing } from '../types'
import type { ThingBehaviour } from './behaviour'

export const toaster: ThingBehaviour = {
  walkable: false,
  portable: false,
  onPick: (ctx, thing) => {
    const { robot } = ctx.world
    if (floorAt(ctx.world, robot.pos) === 'puddle') {
      robot.afro = true
      mishap(ctx, 'zap')
      return
    }
    if (thing.empty) {
      mishap(ctx, 'pickNose')
      return
    }
    thing.empty = true
    react(ctx, thing, 'gaveToast')
    const toast: Thing = { id: `${thing.id}-toast`, kind: 'toast', pos: thing.pos }
    robot.holding = toast
    emit(ctx, { type: 'picked', thing: toast })
  },
}
