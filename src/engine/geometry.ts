import type { Dir, Vec } from './types'

const VECTORS: Record<Dir, Vec> = { N: { x: 0, y: -1 }, E: { x: 1, y: 0 }, S: { x: 0, y: 1 }, W: { x: -1, y: 0 } }
const CLOCKWISE: Dir[] = ['N', 'E', 'S', 'W']

export const add = (a: Vec, d: Dir): Vec => ({ x: a.x + VECTORS[d].x, y: a.y + VECTORS[d].y })
export const same = (a: Vec, b: Vec): boolean => a.x === b.x && a.y === b.y
export const manhattan = (a: Vec, b: Vec): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
export const touching = (a: Vec, b: Vec): boolean => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) <= 1

export function turn(d: Dir, by: 0 | 1 | -1 | 2): Dir {
  return CLOCKWISE[(CLOCKWISE.indexOf(d) + by + 4) % 4] as Dir
}
