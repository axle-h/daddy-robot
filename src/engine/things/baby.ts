import { mishap, react } from '../ctx'
import type { ThingBehaviour } from './behaviour'

/** Asleep in her cot. Loud mishaps nearby wake her too; see `wakeBabies` in `ctx.ts`. */
export const baby: ThingBehaviour = {
  walkable: false,
  portable: false,
  accepts: (item) => item === 'bottle',
  onBeep: (ctx, thing) => {
    if (thing.awake) return
    thing.awake = true
    react(ctx, thing, 'cried')
    mishap(ctx, 'babyWoke')
  },
  onGiven: (ctx, thing) => react(ctx, thing, 'thanked'),
}
