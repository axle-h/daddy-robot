import { mishap, react, removeThing } from '../ctx'
import type { ThingBehaviour } from './behaviour'

export const pigeons: ThingBehaviour = {
  walkable: false,
  portable: false,
  onBump: (ctx) => mishap(ctx, 'flap'),
  onPick: (ctx) => mishap(ctx, 'flap'),
  onBeep: (ctx, thing) => {
    react(ctx, thing, 'scattered')
    removeThing(ctx, thing, 'flew')
  },
}
