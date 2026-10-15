import type { ReactNode } from 'react'
import type { FloorKind, Thing, ThingKind } from '../engine'

export const THING_EMOJI: Record<ThingKind, string> = {
  flag: '🚩',
  biscuits: '🍪',
  lego: '🧱',
  banana: '🍌',
  cat: '🐈',
  dog: '🐕',
  baby: '👶',
  pigeons: '🐦',
  girl: '👧',
  bottle: '🍼',
  toaster: '🍞',
  toast: '🍞',
  whoopee: '💨',
  cactus: '🌵',
  hedgehog: '🦔',
  fishtank: '🐠',
  bins: '🗑️',
}

export function Emoji({ x, y, size, children }: { x: number; y: number; size: number; children: ReactNode }) {
  return (
    <text x={x} y={y} fontSize={size} textAnchor="middle" dominantBaseline="central" className="emoji">
      {children}
    </text>
  )
}

const PLAIN: Partial<Record<FloorKind, string>> = {
  floor: '#ecd9b5',
  rug: '#f4a7b9',
  grass: '#9ccc65',
  path: '#e3d3b0',
  tiles: '#f5f5f0',
  blanket: '#fff',
  parking: '#b0b7bf',
  basket: '#ecd9b5',
  puddle: '#ecd9b5',
  table: '#ecd9b5',
  water: '#4fa3e0',
}

/** Floors are drawn first; tables get their top drawn again over the robot, in `TableTop`. */
export function FloorTile({ kind, x, y, ground }: { kind: FloorKind; x: number; y: number; ground: FloorKind }) {
  const under = kind === 'puddle' || kind === 'basket' || kind === 'table' ? ground : kind
  const fill = PLAIN[under] ?? '#ecd9b5'
  return (
    <g transform={`translate(${x * 100} ${y * 100})`}>
      <rect width={101} height={101} fill={fill} />
      {under === 'floor' && <path d="M0 33 H100 M0 66 H100 M40 0 V33 M75 33 V66 M20 66 V100" stroke="#d7bf93" strokeWidth={2} />}
      {under === 'tiles' && (
        <g fill="#cfe3f3">
          <rect width={50} height={50} />
          <rect x={50} y={50} width={50} height={50} />
        </g>
      )}
      {under === 'rug' && <rect x={6} y={6} width={88} height={88} fill="none" stroke="#e5809a" strokeWidth={4} strokeDasharray="10 6" />}
      {under === 'grass' && (
        <g stroke="#7cb342" strokeWidth={3} strokeLinecap="round">
          <path d="M20 30 l-3 -8 M23 30 l3 -8 M70 70 l-3 -8 M73 70 l3 -8 M60 25 l0 -7" />
        </g>
      )}
      {under === 'path' && (
        <g fill="#d2bf97">
          <ellipse cx={28} cy={30} rx={18} ry={12} />
          <ellipse cx={70} cy={65} rx={20} ry={13} />
        </g>
      )}
      {under === 'blanket' && (
        <g fill="#e63946" opacity={0.75}>
          <rect width={25} height={100} />
          <rect x={50} width={25} height={100} />
          <rect width={100} height={25} opacity={0.6} />
          <rect y={50} width={100} height={25} opacity={0.6} />
        </g>
      )}
      {under === 'parking' && (
        <text x={50} y={54} fontSize={64} fontWeight={900} fill="#fff" textAnchor="middle" dominantBaseline="central" fontFamily="system-ui, sans-serif">
          P
        </text>
      )}
      {kind === 'water' && (
        <g className="water" stroke="#bde0fe" strokeWidth={3} fill="none" strokeLinecap="round">
          <path d="M10 30 q10 -8 20 0 t20 0" />
          <path d="M45 70 q10 -8 20 0 t20 0" />
        </g>
      )}
      {kind === 'puddle' && <path d="M18 50 C10 25 50 15 70 25 C95 35 92 70 65 78 C40 88 22 75 18 50 Z" fill="#7cc4f2" stroke="#4fa3e0" strokeWidth={3} />}
      {kind === 'basket' && (
        <g>
          <ellipse cx={50} cy={56} rx={42} ry={32} fill="#a0703c" stroke="#6d4824" strokeWidth={3} />
          <ellipse cx={50} cy={56} rx={30} ry={20} fill="#e9c46a" />
        </g>
      )}
      {(kind === 'wall' || kind === 'shelf' || kind === 'hedge' || kind === 'counter') && <Solid kind={kind} />}
    </g>
  )
}

function Solid({ kind }: { kind: 'wall' | 'shelf' | 'hedge' | 'counter' }) {
  switch (kind) {
    case 'wall':
      return (
        <g>
          <rect width={101} height={101} fill="#6d597a" />
          <rect width={100} height={14} fill="#8d7a9b" />
          <path d="M0 45 H100 M0 75 H100 M30 14 V45 M70 45 V75 M40 75 V100" stroke="#5b4868" strokeWidth={3} />
        </g>
      )
    case 'shelf':
      return (
        <g>
          <rect width={100} height={100} fill="#8d6e63" />
          <rect x={6} y={10} width={20} height={30} fill="#ef476f" />
          <rect x={30} y={14} width={18} height={26} fill="#ffd166" />
          <rect x={52} y={8} width={22} height={32} fill="#06d6a0" />
          <rect x={78} y={16} width={16} height={24} fill="#118ab2" />
          <rect y={40} width={100} height={6} fill="#5d4037" />
          <rect x={8} y={56} width={26} height={30} fill="#ffd166" />
          <rect x={40} y={60} width={18} height={26} fill="#ef476f" />
          <rect x={64} y={52} width={28} height={34} fill="#06d6a0" />
          <rect y={86} width={100} height={14} fill="#5d4037" />
        </g>
      )
    case 'hedge':
      return (
        <g>
          <rect width={100} height={100} fill="#4c8c2b" />
          {[
            [20, 25],
            [60, 20],
            [85, 50],
            [35, 60],
            [70, 80],
            [15, 85],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={20} fill="#5aa335" />
          ))}
        </g>
      )
    case 'counter':
      return (
        <g>
          <rect width={100} height={100} fill="#a1887f" />
          <rect width={100} height={40} fill="#eceff1" />
          <rect y={40} width={100} height={5} fill="#90a4ae" />
          <circle cx={50} cy={72} r={5} fill="#5d4037" />
        </g>
      )
  }
}

/** The top of a table, drawn over the robot so he can be seen sitting under it. */
export function TableTop({ x, y, rattle }: { x: number; y: number; rattle: boolean }) {
  return (
    <g transform={`translate(${x * 100} ${y * 100})`}>
      <g className={rattle ? 'rattle' : undefined}>
        <rect x={-1} y={-1} width={102} height={102} fill="#8d5524" opacity={0.6} />
        <path d="M0 30 H100 M0 70 H100" stroke="#6b3e17" strokeWidth={3} opacity={0.6} />
      </g>
    </g>
  )
}

export function ThingSprite({ thing }: { thing: Thing }) {
  switch (thing.kind) {
    case 'baby':
      return (
        <g>
          <rect x={8} y={14} width={84} height={76} rx={10} fill="#ffe8d6" stroke="#b08968" strokeWidth={4} />
          {[22, 36, 50, 64, 78].map((x) => (
            <line key={x} x1={x} y1={14} x2={x} y2={90} stroke="#b08968" strokeWidth={3} />
          ))}
          <rect x={18} y={40} width={64} height={40} rx={8} fill="#bde0fe" />
          <Emoji x={50} y={48} size={40}>
            {thing.awake ? '😭' : '👶'}
          </Emoji>
          {thing.given === 'bottle' && (
            <Emoji x={72} y={62} size={24}>
              🍼
            </Emoji>
          )}
          {!thing.awake && <Zzz />}
        </g>
      )
    case 'dog':
      return (
        <g>
          <Emoji x={50} y={58} size={64}>
            🐕
          </Emoji>
          {!thing.awake && <Zzz />}
        </g>
      )
    case 'pigeons':
      return (
        <g className="bob">
          <Emoji x={30} y={40} size={38}>
            🐦
          </Emoji>
          <Emoji x={68} y={48} size={38}>
            🐦
          </Emoji>
          <Emoji x={44} y={74} size={38}>
            🐦
          </Emoji>
        </g>
      )
    case 'fishtank':
      return (
        <g>
          <rect x={6} y={14} width={88} height={76} rx={6} fill="#90e0ef" stroke="#0077b6" strokeWidth={4} opacity={0.9} />
          <rect x={6} y={14} width={88} height={14} fill="#caf0f8" opacity={0.8} />
          <g className="swim">
            <Emoji x={38} y={52} size={30}>
              🐠
            </Emoji>
          </g>
          <Emoji x={68} y={72} size={22}>
            🐟
          </Emoji>
        </g>
      )
    case 'toaster':
      return (
        <g>
          {!thing.empty && (
            <g className="toast-peek">
              <rect x={30} y={18} width={16} height={22} rx={4} fill="#e9a65a" />
              <rect x={54} y={18} width={16} height={22} rx={4} fill="#e9a65a" />
            </g>
          )}
          <rect x={18} y={30} width={64} height={52} rx={14} fill="#cfd8dc" stroke="#546e7a" strokeWidth={4} />
          <rect x={30} y={28} width={16} height={6} rx={2} fill="#37474f" />
          <rect x={54} y={28} width={16} height={6} rx={2} fill="#37474f" />
          <rect x={74} y={50} width={12} height={6} rx={2} fill="#37474f" />
        </g>
      )
    case 'whoopee':
      return (
        <g>
          <ellipse cx={46} cy={58} rx={34} ry={24} fill="#ff70a6" stroke="#c9184a" strokeWidth={3} />
          <path d="M76 56 l14 -6 l2 12 Z" fill="#ff70a6" stroke="#c9184a" strokeWidth={3} strokeLinejoin="round" />
          <ellipse cx={40} cy={52} rx={14} ry={7} fill="#ffb3c6" />
        </g>
      )
    case 'lego':
      return (
        <g>
          <Brick x={14} y={30} color="#e63946" rotate={-12} />
          <Brick x={46} y={56} color="#1d70d6" rotate={18} />
          <Brick x={52} y={20} color="#ffd166" rotate={6} />
        </g>
      )
    case 'girl':
      return (
        <g>
          <Emoji x={50} y={52} size={66}>
            👧
          </Emoji>
          {thing.given && (
            <g className="pop-in">
              <Emoji x={80} y={74} size={28}>
                {THING_EMOJI[thing.given]}
              </Emoji>
            </g>
          )}
        </g>
      )
    default:
      return (
        <Emoji x={50} y={54} size={thing.kind === 'flag' ? 60 : 54}>
          {THING_EMOJI[thing.kind]}
        </Emoji>
      )
  }
}

function Brick({ x, y, color, rotate }: { x: number; y: number; color: string; rotate: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate} 18 10)`}>
      <rect width={36} height={20} rx={3} fill={color} stroke="#2b2d42" strokeWidth={2} />
      {[7, 18, 29].map((cx) => (
        <circle key={cx} cx={cx} cy={10} r={4} fill={color} stroke="#2b2d42" strokeWidth={1.5} />
      ))}
    </g>
  )
}

function Zzz() {
  return (
    <g className="zzz">
      <text x={78} y={24} fontSize={22} fontWeight={900} fill="#5e60ce" fontFamily="system-ui, sans-serif">
        z
      </text>
      <text x={88} y={10} fontSize={16} fontWeight={900} fill="#5e60ce" fontFamily="system-ui, sans-serif">
        z
      </text>
    </g>
  )
}
