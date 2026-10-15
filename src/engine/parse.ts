import type { Dir, LegendEntry, Level, Thing, World } from './types'

const ROBOT: Record<string, Dir> = { '^': 'N', '>': 'E', v: 'S', '<': 'W' }

export const DEFAULT_LEGEND: Record<string, LegendEntry> = {
  '#': { floor: 'wall' },
  '%': { floor: 'shelf' },
  '&': { floor: 'hedge' },
  '[': { floor: 'counter' },
  '~': { floor: 'water' },
  ',': { floor: 'puddle' },
  _: { floor: 'rug' },
  '"': { floor: 'grass' },
  ':': { floor: 'path' },
  t: { floor: 'tiles' },
  '=': { floor: 'blanket' },
  u: { floor: 'basket' },
  p: { floor: 'parking' },
  T: { floor: 'table' },
  F: { thing: 'flag' },
  B: { thing: 'biscuits' },
  L: { thing: 'lego' },
  N: { thing: 'banana' },
  C: { thing: 'cat' },
  D: { thing: 'dog' },
  Z: { thing: 'baby' },
  P: { thing: 'pigeons' },
  G: { thing: 'girl' },
  O: { thing: 'bottle' },
  K: { thing: 'toaster' },
  W: { thing: 'whoopee' },
  X: { thing: 'cactus' },
  H: { thing: 'hedgehog' },
  Q: { thing: 'fishtank' },
  U: { thing: 'bins' },
}

export function parseLevel(level: Level): World {
  const ground = level.ground ?? 'floor'
  const legend = { ...DEFAULT_LEGEND, ...level.legend }
  const height = level.map.length
  const width = level.map[0]?.length ?? 0
  const things: Thing[] = []
  const counts: Partial<Record<string, number>> = {}
  let robot: World['robot'] | undefined

  const floor = level.map.map((row, y) => {
    if (row.length !== width) throw new Error(`${level.id}: row ${y} is ${row.length} wide, not ${width}`)
    return [...row].map((ch, x) => {
      const facing = ROBOT[ch]
      const entry: LegendEntry | undefined = facing ? { robot: facing } : ch === '.' ? {} : legend[ch]
      if (!entry) throw new Error(`${level.id}: no legend for '${ch}' at ${x},${y}`)
      const dir = entry.robot
      if (dir) {
        if (robot) throw new Error(`${level.id}: more than one robot`)
        robot = { pos: { x, y }, facing: dir, posture: 'standing', holding: null, dizzy: false, rusty: false, afro: false }
      }
      if (entry.thing) {
        const n = (counts[entry.thing] ?? 0) + 1
        counts[entry.thing] = n
        const thing: Thing = { id: `${entry.thing}-${n}`, kind: entry.thing, pos: { x, y } }
        if (entry.thing === 'dog' || entry.thing === 'baby') thing.awake = false
        things.push(thing)
      }
      return entry.floor ?? ground
    })
  })
  if (!robot) throw new Error(`${level.id}: no robot`)
  return { width, height, floor, things, robot, mishaps: [], beeped: [], kaput: null }
}
