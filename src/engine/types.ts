export type Dir = 'N' | 'E' | 'S' | 'W'

export interface Vec {
  x: number
  y: number
}

export const COMMANDS = ['FRWD', 'BKWD', 'LEFT', 'RGHT', 'PICK', 'DROP', 'BEEP', 'DOWN', 'STUP'] as const
export type Command = (typeof COMMANDS)[number]

/** Solid floors (`wall`, `shelf`, `hedge`, `counter`) can't be entered; `table` only by a sitting robot. */
export type FloorKind =
  | 'floor'
  | 'wall'
  | 'shelf'
  | 'hedge'
  | 'counter'
  | 'water'
  | 'puddle'
  | 'rug'
  | 'grass'
  | 'path'
  | 'tiles'
  | 'blanket'
  | 'basket'
  | 'parking'
  | 'table'

export type ThingKind =
  | 'flag'
  | 'biscuits'
  | 'lego'
  | 'banana'
  | 'cat'
  | 'dog'
  | 'baby'
  | 'pigeons'
  | 'girl'
  | 'bottle'
  | 'toaster'
  | 'toast'
  | 'whoopee'
  | 'cactus'
  | 'hedgehog'
  | 'fishtank'
  | 'bins'

export interface Thing {
  id: string
  kind: ThingKind
  pos: Vec
  /** Dogs and babies start asleep. */
  awake?: boolean
  /** What a receiver (the girl, the cot) has been given. */
  given?: ThingKind
  /** A toaster that has already handed over its toast. */
  empty?: boolean
}

export type Posture = 'standing' | 'sitting'

export interface Robot {
  pos: Vec
  facing: Dir
  posture: Posture
  holding: Thing | null
  dizzy: boolean
  rusty: boolean
  afro: boolean
}

export interface World {
  width: number
  height: number
  /** Indexed `floor[y][x]`. */
  floor: FloorKind[][]
  things: Thing[]
  robot: Robot
  mishaps: MishapId[]
  beeped: ThingKind[]
  kaput: MishapId | null
}

export type MishapId =
  | 'bonk'
  | 'splash'
  | 'ouch'
  | 'headBonk'
  | 'bins'
  | 'tickle'
  | 'woof'
  | 'flap'
  | 'fishtank'
  | 'prickle'
  | 'pickNose'
  | 'juggle'
  | 'scratch'
  | 'tooHeavy'
  | 'zap'
  | 'headOff'
  | 'dogAte'
  | 'floatedAway'
  | 'noRoom'
  | 'pffft'
  | 'mrrow'
  | 'yeowch'
  | 'legsInAir'
  | 'neckBoing'
  | 'babyWoke'

export type Reaction =
  | 'scattered'
  | 'woke'
  | 'fled'
  | 'ate'
  | 'thanked'
  | 'rattled'
  | 'cried'
  | 'giggled'
  | 'curled'
  | 'popped'
  | 'gaveToast'

export type WorldEvent =
  | { type: 'moved'; from: Vec; to: Vec; how: 'walk' | 'back' | 'scoot' }
  | { type: 'slid'; from: Vec; to: Vec }
  | { type: 'launched'; from: Vec; to: Vec }
  | { type: 'turned'; from: Dir; to: Dir }
  | { type: 'bonked'; at: Vec; into: FloorKind | ThingKind }
  | { type: 'picked'; thing: Thing }
  | { type: 'dropped'; thing: Thing; at: Vec }
  | { type: 'gave'; thing: Thing; to: Thing }
  | { type: 'beeped' }
  | { type: 'sat' }
  | { type: 'stood' }
  | { type: 'said'; text: string }
  | { type: 'mishap'; id: MishapId; kaput: boolean; backwards: boolean }
  | { type: 'thingReacted'; id: string; kind: ThingKind; reaction: Reaction }
  | { type: 'thingMoved'; id: string; kind: ThingKind; from: Vec; to: Vec }
  | { type: 'thingGone'; thing: Thing; at: Vec; how: 'flew' | 'eaten' | 'floated' }
  | { type: 'shrugged' }

export interface TraceStep {
  /** Index of the command this step carried out; `program.length` for the closing shrug. */
  pc: number
  events: WorldEvent[]
  world: World
}

export type Outcome = { kind: 'win' } | { kind: 'kaput'; mishap: MishapId } | { kind: 'incomplete' }

export type Goal =
  | { type: 'onThing'; thing: ThingKind }
  | { type: 'onFloor'; floor: FloorKind }
  | { type: 'facing'; dir: Dir }
  | { type: 'holding'; thing: ThingKind }
  | { type: 'gave'; thing: ThingKind; to: ThingKind }
  | { type: 'sitting' }
  | { type: 'didNot'; mishap: MishapId }
  | { type: 'all'; goals: Goal[] }

export interface LegendEntry {
  floor?: FloorKind
  thing?: ThingKind
  robot?: Dir
}

export interface Level {
  id: string
  title: string
  /** The goal as Daddy Robot says it out loud. */
  intro: string
  map: string[]
  /** What `.` and anything standing on the map defaults to. */
  ground?: FloorKind
  legend?: Record<string, LegendEntry>
  goal: Goal
  commands: Command[]
  solution: Command[]
  /** Program length for the third star; defaults to the solution's length. */
  par?: number
}

export interface RunResult {
  trace: TraceStep[]
  outcome: Outcome
}
