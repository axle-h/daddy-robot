import { mishap, react } from '../ctx'
import type { ThingBehaviour } from './behaviour'

export const bins: ThingBehaviour = {
  walkable: false,
  portable: false,
  onBump: (ctx, thing) => {
    ctx.world.robot.dizzy = true
    react(ctx, thing, 'rattled')
    mishap(ctx, 'bins')
  },
}
