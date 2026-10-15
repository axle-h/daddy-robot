import { mishap } from '../ctx'
import type { ThingBehaviour } from './behaviour'

export const fishtank: ThingBehaviour = {
  walkable: false,
  portable: false,
  onSlideInto: (ctx) => {
    ctx.world.robot.rusty = true
    mishap(ctx, 'fishtank')
  },
}
