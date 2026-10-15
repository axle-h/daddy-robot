import { emit, mishap } from '../ctx'
import { launch } from '../movement'
import type { ThingBehaviour } from './behaviour'

/** Cactus and hedgehog: prickly to tread on or touch, and sitting on one launches him a cell forwards. */
export function prickly(extra: Partial<ThingBehaviour> = {}): ThingBehaviour {
  return {
    walkable: true,
    portable: false,
    onEnter: (ctx) => mishap(ctx, 'prickle'),
    onPick: (ctx) => mishap(ctx, 'prickle'),
    onSit: (ctx) => {
      mishap(ctx, 'yeowch')
      ctx.world.robot.posture = 'standing'
      emit(ctx, { type: 'stood' })
      launch(ctx)
    },
    ...extra,
  }
}
