import type { Ctx } from '../ctx'
import type { Thing, ThingKind } from '../types'

/** How one kind of thing responds to the robot. A missing hook falls back to the default in `commands.ts`. */
export interface ThingBehaviour {
  /** A standing robot can share its cell. */
  walkable: boolean
  portable: boolean
  /** Steps onto it carry him on in the same direction. */
  slippery?: boolean
  /** Dropped in front of it, this item is given to it rather than put down. */
  accepts?: (item: ThingKind) => boolean
  onEnter?: (ctx: Ctx, thing: Thing) => void
  onSit?: (ctx: Ctx, thing: Thing) => void
  /** Walked into it. Default: bonk. */
  onBump?: (ctx: Ctx, thing: Thing) => void
  /** Slid into it off a banana. Default: he just stops. */
  onSlideInto?: (ctx: Ctx, thing: Thing) => void
  /** Default: picked up if portable, too heavy if not. */
  onPick?: (ctx: Ctx, thing: Thing) => void
  onBeep?: (ctx: Ctx, thing: Thing) => void
  onGiven?: (ctx: Ctx, thing: Thing, item: Thing) => void
}
