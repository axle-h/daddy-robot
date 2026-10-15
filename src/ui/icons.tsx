import type { ReactNode } from 'react'

export type IconName = 'home' | 'sound' | 'mute' | 'talk' | 'quiet' | 'slow' | 'fast' | 'bin' | 'play' | 'again' | 'lock'

/** Line icons drawn in `currentColor`, so buttons share one look instead of mixed emoji. */
const PATHS: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3 11 L12 3 L21 11" />
      <path d="M5.5 9.5 V20 H18.5 V9.5" />
      <path d="M10 20 V14 H14 V20" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9 H8 L13 4.5 V19.5 L8 15 H4 Z" />
      <path d="M16.5 8.5 C18 10 18 14 16.5 15.5" />
      <path d="M19 6 C22 9 22 15 19 18" />
    </>
  ),
  mute: (
    <>
      <path d="M4 9 H8 L13 4.5 V19.5 L8 15 H4 Z" />
      <path d="M16.5 9.5 L21.5 14.5 M21.5 9.5 L16.5 14.5" />
    </>
  ),
  talk: (
    <>
      <path d="M4 5 H20 V16 H11 L6 20 V16 H4 Z" />
      <path d="M8 10.5 H8.01 M12 10.5 H12.01 M16 10.5 H16.01" strokeWidth={3} />
    </>
  ),
  quiet: (
    <>
      <path d="M4 5 H20 V16 H11 L6 20 V16 H4 Z" />
      <path d="M9 10.5 H15" />
    </>
  ),
  slow: <path d="M9 6 L15 12 L9 18" />,
  fast: <path d="M5 6 L11 12 L5 18 M13 6 L19 12 L13 18" />,
  bin: (
    <>
      <path d="M4 7 H20 M9 7 V4 H15 V7" />
      <path d="M6 7 L7 20 H17 L18 7" />
      <path d="M10 11 V16 M14 11 V16" />
    </>
  ),
  play: <path d="M7 4.5 L19.5 12 L7 19.5 Z" fill="currentColor" />,
  again: (
    <>
      <path d="M19 12 A7 7 0 1 1 15.5 6" />
      <path d="M14 2.5 L17.5 6 L14 9.5" />
    </>
  ),
  lock: (
    <>
      <rect x={5} y={10.5} width={14} height={10} rx={2} fill="currentColor" />
      <path d="M8 10.5 V7.5 A4 4 0 0 1 16 7.5 V10.5" />
    </>
  ),
}

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`icon ${className ?? ''}`} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {PATHS[name]}
    </svg>
  )
}

export function Star({ lit, className }: { lit: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`star-icon ${lit ? 'lit' : ''} ${className ?? ''}`} aria-hidden>
      <path d="M12 2.5 L14.9 8.6 L21.5 9.4 L16.6 14 L17.9 20.6 L12 17.3 L6.1 20.6 L7.4 14 L2.5 9.4 L9.1 8.6 Z" strokeLinejoin="round" />
    </svg>
  )
}
