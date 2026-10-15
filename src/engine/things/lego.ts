import { mishap } from '../ctx'
import type { ThingBehaviour } from './behaviour'

export const lego: ThingBehaviour = {
  walkable: true,
  portable: true,
  onEnter: (ctx) => mishap(ctx, 'ouch'),
  onSit: (ctx) => mishap(ctx, 'ouch'),
}
