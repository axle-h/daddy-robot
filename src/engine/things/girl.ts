import { mishap, react, say } from '../ctx'
import type { ThingBehaviour } from './behaviour'

export const girl: ThingBehaviour = {
  walkable: false,
  portable: false,
  accepts: () => true,
  onBump: (ctx, thing) => {
    react(ctx, thing, 'giggled')
    mishap(ctx, 'tickle')
  },
  onPick: (ctx, thing) => {
    react(ctx, thing, 'giggled')
    mishap(ctx, 'tickle')
  },
  onGiven: (ctx, thing) => {
    react(ctx, thing, 'thanked')
    say(ctx, 'Thank you, Daddy!')
  },
}
