import type { CSSProperties, ReactNode } from 'react'
import type { FloorKind, Goal, MishapId, Vec, World, WorldEvent } from '../engine'
import { Robot, type Mood } from './Robot'
import { FloorLayer, TableTops, THING_EMOJI, ThingSprite } from './sprites'

interface Props {
  world: World
  ground: FloorKind
  goal: Goal
  events: WorldEvent[]
  stepKey: number
  angle: number
  mood: Mood
  /** How long this step's movement takes to play. */
  moveMs: number
}

const BURST: Partial<Record<MishapId, string>> = {
  bonk: 'BONK!',
  splash: 'SPLOSH!',
  ouch: 'OUCH!',
  headBonk: 'BONK!',
  bins: 'CRASH!',
  woof: 'WOOF!',
  flap: 'FLAP!',
  fishtank: 'CRASH!',
  prickle: 'PRICKLE!',
  juggle: 'WHOA!',
  scratch: 'HISS!',
  tooHeavy: 'NNNGH!',
  zap: 'ZAP!',
  headOff: 'POP!',
  dogAte: 'CHOMP!',
  pffft: 'PFFFT!',
  mrrow: 'MRROWW!',
  yeowch: 'YEOWCH!',
  legsInAir: 'WHOOPS!',
  neckBoing: 'BOING!',
  babyWoke: 'WAAAH!',
  tickle: 'HEE HEE!',
}

const PARTICLE: Partial<Record<MishapId, string>> = {
  bonk: '💫',
  headBonk: '💫',
  bins: '💫',
  splash: '💦',
  fishtank: '💦',
  zap: '⚡',
  pffft: '💨',
  tickle: '💕',
  scratch: '😾',
  tooHeavy: '💦',
  flap: '🐦',
  ouch: '💥',
  yeowch: '💥',
  prickle: '💢',
  pickNose: '👃',
  noRoom: '🤷',
  floatedAway: '👋',
}

export function Board({ world, ground, goal, events, stepKey, angle, mood, moveMs }: Props) {
  const { width, height, robot } = world
  const mishap = events.find((e) => e.type === 'mishap')
  const launched = events.some((e) => e.type === 'launched')
  const slid = events.some((e) => e.type === 'slid')
  const animation = mishap?.type === 'mishap' ? mishap.id : launched ? 'launch' : undefined
  const tableRattle = events.some((e) => e.type === 'bonked' && e.into === 'table')
  const goalCells = targetCells(goal, world)
  const facingGoal = findFacing(goal)
  const motion: CSSProperties = { transition: `transform ${moveMs}ms ${slid ? 'linear' : 'ease-in-out'}` }

  return (
    <div className="board" style={{ aspectRatio: `${width} / ${height}`, ['--ratio' as string]: width / height }}>
      <svg viewBox={`0 0 ${width * 100} ${height * 100}`} className="board-svg" role="img" aria-label="The room">
        <FloorLayer floor={world.floor} ground={ground} />
        {goalCells.map((p) => (
          <g key={`goal-${p.x},${p.y}`} transform={`translate(${p.x * 100} ${p.y * 100})`} className="goal-cell">
            <rect x={6} y={6} width={88} height={88} rx={14} fill="none" stroke="#ffd166" strokeWidth={6} strokeDasharray="14 10" />
            {facingGoal && (
              <path d="M50 22 L30 50 H42 V78 H58 V50 H70 Z" fill="#ffd166" opacity={0.7} transform={`rotate(${DIR_ANGLE[facingGoal]} 50 50)`} />
            )}
          </g>
        ))}
        {world.things.map((t) => (
          <g key={t.id} className="thing" style={{ transform: `translate(${t.pos.x * 100}px, ${t.pos.y * 100}px)`, ...motion }}>
            <ThingSprite thing={t} />
          </g>
        ))}
        <g className="robot" style={{ transform: `translate(${robot.pos.x * 100}px, ${robot.pos.y * 100}px)`, ...motion }}>
          <Robot robot={robot} angle={angle} mood={mood} animation={animation} stepKey={stepKey} />
        </g>
        <TableTops floor={world.floor} rattle={tableRattle} />
      </svg>
      <div className="effects" key={stepKey}>
        {effects(events, world)}
      </div>
    </div>
  )
}

export const DIR_ANGLE = { N: 0, E: 90, S: 180, W: 270 } as const

function findFacing(goal: Goal): keyof typeof DIR_ANGLE | undefined {
  if (goal.type === 'facing') return goal.dir
  if (goal.type === 'all') return goal.goals.map(findFacing).find(Boolean)
  return undefined
}

/** The cells the goal is about, outlined on the board so it reads without words. */
function targetCells(goal: Goal, world: World): Vec[] {
  switch (goal.type) {
    case 'onThing':
      return world.things.filter((t) => t.kind === goal.thing).map((t) => t.pos)
    case 'gave':
      return world.things.filter((t) => t.kind === goal.to).map((t) => t.pos)
    case 'holding':
      return world.things.filter((t) => t.kind === goal.thing || (goal.thing === 'toast' && t.kind === 'toaster')).map((t) => t.pos)
    case 'onFloor': {
      const cells: Vec[] = []
      world.floor.forEach((row, y) => row.forEach((f, x) => f === goal.floor && cells.push({ x, y })))
      return cells
    }
    case 'all':
      return goal.goals.flatMap((g) => targetCells(g, world))
    default:
      return []
  }
}

function At({ at, world, className, children }: { at: Vec; world: World; className: string; children: ReactNode }) {
  const bubble = className.startsWith('bubble')
  // A burst rises from his head, so in the top rows it starts lower to stay on the board.
  const dy = className === 'bubble' ? -0.2 : className === 'bubble below' ? 1 : className.startsWith('burst') && at.y <= 1 ? 0.9 : 0
  const style: CSSProperties = {
    left: `${((at.x + 0.5) / world.width) * 100}%`,
    top: `${((at.y + dy) / world.height) * 100}%`,
  }
  // Bubbles near a side lean inwards so they stay on the board.
  const lean = !bubble ? '' : (at.x + 0.5) / world.width < 0.34 ? 'start' : (at.x + 0.5) / world.width > 0.66 ? 'end' : ''
  return (
    <div className={`fx ${className} ${lean}`} style={style}>
      {children}
    </div>
  )
}

function effects(events: WorldEvent[], world: World): ReactNode[] {
  const robot = world.robot.pos
  const out: ReactNode[] = []
  const said = events.findLast((e) => e.type === 'said')
  events.forEach((e, i) => {
    const key = `${e.type}-${i}`
    switch (e.type) {
      case 'mishap': {
        const burst = BURST[e.id]
        const particle = PARTICLE[e.id]
        if (burst)
          out.push(
            <At key={key} at={robot} world={world} className={`burst ${e.kaput ? 'kaput' : ''}`}>
              {burst}
            </At>,
          )
        if (particle)
          out.push(
            <At key={`${key}-p`} at={robot} world={world} className="particles">
              <span>{particle}</span>
              <span>{particle}</span>
              <span>{particle}</span>
            </At>,
          )
        if (e.id === 'splash' || e.id === 'fishtank')
          out.push(
            <At key={`${key}-b`} at={robot} world={world} className="bubbles">
              <span />
              <span />
              <span />
              <span />
            </At>,
          )
        break
      }
      case 'beeped':
        out.push(
          <At key={key} at={robot} world={world} className="beep-rings">
            <span />
            <span />
            <span />
          </At>,
        )
        break
      case 'shrugged':
        out.push(
          <At key={key} at={robot} world={world} className="float">
            ❓
          </At>,
        )
        break
      case 'thingGone':
        out.push(
          <At key={key} at={e.at} world={world} className={`gone-${e.how}`}>
            {e.how === 'flew' ? (
              <>
                <span>🐦</span>
                <span>🐦</span>
                <span>🐦</span>
              </>
            ) : (
              <span>{THING_EMOJI[e.thing.kind]}</span>
            )}
          </At>,
        )
        break
      case 'thingReacted': {
        const thing = world.things.find((t) => t.id === e.id)
        const at = thing?.pos ?? robot
        const icon = { woke: '❗', thanked: '❤️', giggled: '😆', fled: '💨', ate: '😋', cried: '😭', gaveToast: '🍞', scattered: '', rattled: '💫', curled: '', popped: '' }[e.reaction]
        if (icon)
          out.push(
            <At key={key} at={at} world={world} className="float">
              {icon}
            </At>,
          )
        break
      }
      default:
        break
    }
  })
  if (said?.type === 'said' && said.text !== 'BEEP BEEP!')
    out.push(
      <At key="said" at={robot} world={world} className={robot.y <= 1 || events.some((e) => e.type === 'mishap' && BURST[e.id]) ? 'bubble below' : 'bubble'}>
        {said.text}
      </At>,
    )
  return out
}
