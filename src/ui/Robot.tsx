import type { Robot as RobotState } from '../engine'
import { Emoji, THING_EMOJI } from './sprites'

export type Mood = 'happy' | 'shocked' | 'dizzy' | 'puzzled' | 'proud' | 'sad'

interface Props {
  robot: RobotState
  /** Facing in degrees, unwrapped so a turn from W to N animates 90° and not 270°. */
  angle: number
  mood: Mood
  /** Restarts the mishap animation for each step. */
  animation?: string | undefined
  stepKey: number
}

const METAL = { body: '#9fb3c8', dark: '#6b7f95', head: '#b8c9da' }
const RUST = { body: '#b8733a', dark: '#7d4a22', head: '#c98a4f' }

/** Daddy Robot, drawn front-on in a 100×100 cell with his feet near the bottom. Facing N shows his back. */
export function Robot({ robot, angle, mood, animation, stepKey }: Props) {
  const c = robot.rusty ? RUST : METAL
  const sitting = robot.posture === 'sitting'
  const facing = robot.facing
  const look = facing === 'E' ? 4 : facing === 'W' ? -4 : 0
  const lookY = facing === 'S' ? 2 : 0
  const back = facing === 'N'
  const held = robot.holding

  return (
    <g>
      <ellipse cx={50} cy={90} rx={30} ry={7} fill="rgba(0,0,0,0.18)" />
      {/* The facing pointer: a circle squashed into the floor's perspective. */}
      <g transform="translate(50 88) scale(1 0.42)">
        <g className="facing-pointer" style={{ transform: `rotate(${angle}deg)` }}>
          <circle r={40} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={6} strokeDasharray="6 10" />
          <path d="M0 -62 L-16 -38 L16 -38 Z" fill="#ffd166" stroke="#2b2d42" strokeWidth={4} strokeLinejoin="round" />
        </g>
      </g>
      <g key={stepKey} className={animation ? `robot-anim m-${animation}` : 'robot-anim'}>
        {sitting ? (
          <g>
            <rect x={30} y={82} width={14} height={8} rx={4} fill={c.dark} />
            <rect x={56} y={82} width={14} height={8} rx={4} fill={c.dark} />
          </g>
        ) : (
          <g>
            <rect x={38} y={70} width={8} height={16} fill={c.dark} />
            <rect x={54} y={70} width={8} height={16} fill={c.dark} />
            <rect x={33} y={84} width={15} height={7} rx={3} fill="#2b2d42" />
            <rect x={52} y={84} width={15} height={7} rx={3} fill="#2b2d42" />
          </g>
        )}
        <g transform={sitting ? 'translate(0 12)' : undefined}>
          <g className="robot-body">
            <rect x={28} y={40} width={44} height={34} rx={8} fill={c.body} stroke="#2b2d42" strokeWidth={2.5} />
            {back ? (
              <g>
                <rect x={40} y={48} width={20} height={16} rx={3} fill={c.dark} />
                <rect x={47} y={36} width={6} height={10} fill="#e0b84a" />
                <path d="M38 34 h24 v6 h-24 z" fill="#e0b84a" stroke="#2b2d42" strokeWidth={2} />
              </g>
            ) : (
              <g transform={`translate(${look / 2} 0)`}>
                <path d="M41 40 L50 47 L59 40 Z" fill="#fff" stroke="#2b2d42" strokeWidth={1.5} />
                <path d="M50 46 L45.5 50 L50 68 L54.5 50 Z" fill="#e63946" stroke="#2b2d42" strokeWidth={1.5} />
              </g>
            )}
            <rect x={17} y={43} width={11} height={26} rx={5.5} fill={c.body} stroke="#2b2d42" strokeWidth={2} />
            <g className="arm-right">
              <rect x={72} y={43} width={11} height={26} rx={5.5} fill={c.body} stroke="#2b2d42" strokeWidth={2} />
            </g>
            {robot.rusty && (
              <g fill="#7d4a22" opacity={0.7}>
                <circle cx={36} cy={60} r={3} />
                <circle cx={64} cy={50} r={2.5} />
                <circle cx={58} cy={68} r={2} />
              </g>
            )}
          </g>
          <g className="robot-skeleton">
            <rect x={28} y={40} width={44} height={34} rx={8} fill="#1b1b2f" />
            <rect x={48} y={42} width={4} height={30} fill="#fff" />
            {[46, 53, 60].map((y) => (
              <path key={y} d={`M34 ${y} Q50 ${y + 5} 66 ${y}`} stroke="#fff" strokeWidth={3} fill="none" />
            ))}
          </g>
          <g className="robot-head">
            <g className="robot-neck">
              <rect x={45} y={28} width={10} height={14} fill={c.dark} stroke="#2b2d42" strokeWidth={1.5} />
              <line x1={45} y1={33} x2={55} y2={33} stroke="#2b2d42" strokeWidth={1} />
              <line x1={45} y1={37} x2={55} y2={37} stroke="#2b2d42" strokeWidth={1} />
            </g>
            <g className="robot-face">
              <line x1={50} y1={0} x2={50} y2={-9} stroke="#2b2d42" strokeWidth={2.5} />
              <circle cx={50} cy={-11} r={4.5} fill="#e63946" className="antenna" />
              {robot.afro && (
                <g fill="#3d2314">
                  {[18, 30, 42, 58, 70, 82, 24, 50, 76, 36, 64].map((x, i) => (
                    <circle key={i} cx={x} cy={i < 6 ? 2 : i < 9 ? -8 : -14} r={11} />
                  ))}
                </g>
              )}
              <rect x={25} y={0} width={50} height={33} rx={11} fill={c.head} stroke="#2b2d42" strokeWidth={2.5} />
              <circle cx={24} cy={16} r={3.5} fill={c.dark} />
              <circle cx={76} cy={16} r={3.5} fill={c.dark} />
              {back ? (
                <g>
                  <circle cx={50} cy={16} r={4} fill={c.dark} />
                  <line x1={47} y1={16} x2={53} y2={16} stroke="#2b2d42" strokeWidth={1.5} />
                </g>
              ) : (
                <Face look={look} lookY={lookY} mood={mood} />
              )}
            </g>
          </g>
          {held && (
            <g className="held">
              <Emoji x={50} y={back ? 44 : 60} size={30}>
                {THING_EMOJI[held.kind]}
              </Emoji>
            </g>
          )}
        </g>
      </g>
    </g>
  )
}

function Face({ look, lookY, mood }: { look: number; lookY: number; mood: Mood }) {
  const eyes =
    mood === 'dizzy' ? (
      <g stroke="#2b2d42" strokeWidth={2.5} strokeLinecap="round">
        <path d={`M${36 + look} 10 l8 8 M${44 + look} 10 l-8 8`} />
        <path d={`M${56 + look} 10 l8 8 M${64 + look} 10 l-8 8`} />
      </g>
    ) : (
      <g>
        <circle cx={40 + look} cy={14} r={mood === 'shocked' ? 8 : 7} fill="#fff" stroke="#2b2d42" strokeWidth={1.5} />
        <circle cx={60 + look} cy={14} r={mood === 'shocked' ? 8 : 7} fill="#fff" stroke="#2b2d42" strokeWidth={1.5} />
        <circle cx={40 + look * 1.6} cy={14 + lookY} r={mood === 'shocked' ? 2.5 : 3.5} fill="#2b2d42" />
        <circle cx={60 + look * 1.6} cy={14 + lookY} r={mood === 'shocked' ? 2.5 : 3.5} fill="#2b2d42" />
        {mood === 'puzzled' && <path d={`M${53 + look} 4 l12 -3`} stroke="#2b2d42" strokeWidth={2.5} strokeLinecap="round" />}
        {mood === 'sad' && <path d={`M${33 + look} 6 l10 2 M${67 + look} 6 l-10 2`} stroke="#2b2d42" strokeWidth={2.5} strokeLinecap="round" />}
      </g>
    )
  const mouth = {
    happy: 'M44 28 Q50 32 56 28',
    proud: 'M42 27 Q50 34 58 27 Z',
    shocked: 'M47 29 a3 3.5 0 1 0 6 0 a3 3.5 0 1 0 -6 0',
    dizzy: 'M43 29 q3.5 -3 7 0 q3.5 3 7 0',
    puzzled: 'M44 29 q6 -3 12 1',
    sad: 'M44 31 Q50 26 56 31',
  }[mood]
  return (
    <g transform={`translate(${look} 0)`}>
      {eyes}
      <path
        d="M50 22 C46 19 40 19 37 23 C35 26 31 26 30 23 C33 28 41 28 45 25 C47 24 49 24 50 24 C51 24 53 24 55 25 C59 28 67 28 70 23 C69 26 65 26 63 23 C60 19 54 19 50 22 Z"
        fill="#5a3a22"
        transform="translate(0 -1)"
      />
      <path d={mouth} fill={mood === 'proud' || mood === 'shocked' ? '#7a2531' : 'none'} stroke="#2b2d42" strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}
