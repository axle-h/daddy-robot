import { mishap } from '../ctx'
import type { ThingBehaviour } from './behaviour'

export const whoopee: ThingBehaviour = {
  walkable: true,
  portable: true,
  onEnter: (ctx) => mishap(ctx, 'pffft'),
  onSit: (ctx) => mishap(ctx, 'pffft'),
}
