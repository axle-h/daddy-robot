import type { Command } from '../engine'

const COLOUR: Record<Command, string> = {
  FRWD: '#4d96ff',
  BKWD: '#4d96ff',
  LEFT: '#3fb950',
  RGHT: '#3fb950',
  PICK: '#ff9f45',
  DROP: '#ff9f45',
  BEEP: '#a970ff',
  DOWN: '#ff5c8a',
  STUP: '#ff5c8a',
}

const ARROW = 'M12 3 L4 12 H9 V21 H15 V12 H20 Z'
const TURN = 'M17 21 V12 C17 8 14 6 10 6 H8 V2 L1 8.5 L8 15 V11 H10 C11.5 11 12 11.5 12 13 V21 Z'

function Icon({ command }: { command: Command }) {
  switch (command) {
    case 'FRWD':
      return <SvgIcon d={ARROW} />
    case 'BKWD':
      return <SvgIcon d={ARROW} transform="rotate(180 12 12)" />
    case 'LEFT':
      return <SvgIcon d={TURN} />
    case 'RGHT':
      return <SvgIcon d={TURN} transform="translate(24 0) scale(-1 1)" />
    case 'PICK':
      return <EmojiIcon glyph="✊" arrow="⬆" />
    case 'DROP':
      return <EmojiIcon glyph="🖐️" arrow="⬇" />
    case 'BEEP':
      return <EmojiIcon glyph="📢" />
    case 'DOWN':
      return <EmojiIcon glyph="🪑" arrow="⬇" />
    case 'STUP':
      return <EmojiIcon glyph="🧍" arrow="⬆" />
  }
}

function SvgIcon({ d, transform }: { d: string; transform?: string }) {
  return (
    <svg viewBox="0 0 24 24" className="tile-icon" aria-hidden>
      <path d={d} transform={transform} fill="#fff" stroke="#1d2b53" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  )
}

function EmojiIcon({ glyph, arrow }: { glyph: string; arrow?: string }) {
  return (
    <span className="tile-icon tile-emoji" aria-hidden>
      {glyph}
      {arrow && <span className="tile-arrow">{arrow}</span>}
    </span>
  )
}

interface TileProps {
  command: Command
  onPress?: () => void
  disabled?: boolean
  state?: 'current' | 'oops' | 'kaput' | 'done' | undefined
  isNew?: boolean
  small?: boolean
}

export function Tile({ command, onPress, disabled, state, isNew, small }: TileProps) {
  return (
    <button
      type="button"
      className={`tile ${small ? 'small' : ''} ${state ?? ''} ${isNew ? 'new' : ''}`}
      style={{ ['--tile' as string]: COLOUR[command] }}
      onClick={onPress}
      disabled={disabled}
      aria-label={command}
    >
      <Icon command={command} />
      <span className="tile-code">{command}</span>
      {(state === 'oops' || state === 'kaput') && <span className="tile-flag">!</span>}
    </button>
  )
}
