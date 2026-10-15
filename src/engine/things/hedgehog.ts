import { mishap, react } from '../ctx'
import { prickly } from './prickly'

export const hedgehog = prickly({
  onEnter: (ctx, thing) => {
    react(ctx, thing, 'curled')
    mishap(ctx, 'prickle')
  },
})
