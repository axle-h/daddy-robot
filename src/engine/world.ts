import type { FloorKind, Thing, Vec, World } from './types'

const SOLID: ReadonlySet<FloorKind> = new Set(['wall', 'shelf', 'hedge', 'counter'])

export const inBounds = (w: World, p: Vec): boolean => p.x >= 0 && p.y >= 0 && p.x < w.width && p.y < w.height

/** Off the edge of the map counts as wall. */
export const floorAt = (w: World, p: Vec): FloorKind => (inBounds(w, p) ? (w.floor[p.y]?.[p.x] ?? 'wall') : 'wall')

export const isSolid = (floor: FloorKind): boolean => SOLID.has(floor)

export const thingAt = (w: World, p: Vec): Thing | undefined => w.things.find((t) => t.pos.x === p.x && t.pos.y === p.y)

/** Somewhere a dropped or fleeing thing can land. */
export function canHold(w: World, p: Vec): boolean {
  const floor = floorAt(w, p)
  return !isSolid(floor) && floor !== 'water' && !thingAt(w, p)
}
