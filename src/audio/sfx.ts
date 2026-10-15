import type { WorldEvent } from '../engine'

let context: AudioContext | null = null
let muted = false

export const setMuted = (value: boolean) => {
  muted = value
}

/** Browsers only allow audio after a tap, so the first RUN creates the context. */
export function unlockAudio(): void {
  try {
    context ??= new AudioContext()
    if (context.state === 'suspended') void context.resume()
  } catch {
    context = null
  }
}

export function audio(): AudioContext | null {
  return muted ? null : context
}

interface ToneOptions {
  type?: OscillatorType
  to?: number
  gain?: number
  delay?: number
}

function tone(freq: number, seconds: number, { type = 'square', to, gain = 0.12, delay = 0 }: ToneOptions = {}) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + delay
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + seconds)
  amp.gain.setValueAtTime(gain, t)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + seconds)
  osc.connect(amp).connect(ac.destination)
  osc.start(t)
  osc.stop(t + seconds + 0.02)
}

interface NoiseOptions {
  filter?: number
  to?: number
  q?: number
  gain?: number
  delay?: number
}

function noise(seconds: number, { filter = 1200, to, q = 1, gain = 0.25, delay = 0 }: NoiseOptions = {}) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + delay
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * seconds), ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buffer
  const f = ac.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = q
  f.frequency.setValueAtTime(filter, t)
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + seconds)
  const amp = ac.createGain()
  amp.gain.setValueAtTime(gain, t)
  amp.gain.exponentialRampToValueAtTime(0.0001, t + seconds)
  src.connect(f).connect(amp).connect(ac.destination)
  src.start(t)
}

export const SFX = {
  step: () => {
    tone(220, 0.06, { type: 'triangle', gain: 0.2 })
    tone(260, 0.06, { type: 'triangle', gain: 0.2, delay: 0.18 })
  },
  scoot: () => noise(0.3, { filter: 300, to: 600, gain: 0.3 }),
  turn: () => tone(500, 0.18, { type: 'sawtooth', to: 700, gain: 0.05 }),
  slide: () => tone(300, 0.6, { type: 'sine', to: 1200, gain: 0.15 }),
  bonk: () => {
    tone(160, 0.25, { type: 'sine', to: 60, gain: 0.5 })
    tone(900, 0.4, { type: 'sine', to: 1400, gain: 0.08, delay: 0.1 })
  },
  crash: () => {
    noise(0.6, { filter: 2500, to: 400, q: 0.6, gain: 0.4 })
    tone(120, 0.3, { type: 'square', to: 50, gain: 0.15 })
  },
  splash: () => {
    noise(0.8, { filter: 3000, to: 300, q: 0.8, gain: 0.45 })
    for (let i = 0; i < 4; i++) tone(400 + i * 120, 0.08, { type: 'sine', to: 900 + i * 100, gain: 0.15, delay: 0.5 + i * 0.15 })
  },
  ouch: () => tone(500, 0.45, { type: 'square', to: 1100, gain: 0.1 }),
  zap: () => {
    for (let i = 0; i < 6; i++) tone(90 + (i % 2) * 40, 0.08, { type: 'sawtooth', gain: 0.25, delay: i * 0.07 })
    noise(0.5, { filter: 5000, q: 0.5, gain: 0.25 })
  },
  pffft: () => {
    noise(0.7, { filter: 180, to: 90, q: 6, gain: 0.9 })
    tone(85, 0.7, { type: 'sawtooth', to: 60, gain: 0.12 })
  },
  beep: () => {
    tone(880, 0.12, { gain: 0.12 })
    tone(880, 0.12, { gain: 0.12, delay: 0.2 })
  },
  pick: () => tone(400, 0.12, { type: 'triangle', to: 800, gain: 0.25 }),
  drop: () => tone(700, 0.15, { type: 'triangle', to: 300, gain: 0.25 }),
  boing: () => tone(150, 0.5, { type: 'sine', to: 600, gain: 0.3 }),
  pop: () => tone(300, 0.08, { type: 'sine', to: 1200, gain: 0.3 }),
  woof: () => {
    tone(260, 0.12, { type: 'sawtooth', to: 140, gain: 0.25 })
    tone(260, 0.12, { type: 'sawtooth', to: 140, gain: 0.25, delay: 0.2 })
  },
  meow: () => tone(600, 0.5, { type: 'triangle', to: 900, gain: 0.2 }),
  waah: () => {
    tone(500, 0.5, { type: 'sawtooth', to: 700, gain: 0.08 })
    tone(700, 0.6, { type: 'sawtooth', to: 450, gain: 0.08, delay: 0.5 })
  },
  flap: () => {
    for (let i = 0; i < 5; i++) noise(0.06, { filter: 1500, gain: 0.3, delay: i * 0.08 })
  },
  chomp: () => {
    noise(0.08, { filter: 800, gain: 0.5 })
    noise(0.08, { filter: 800, gain: 0.5, delay: 0.15 })
  },
  giggle: () => {
    for (let i = 0; i < 4; i++) tone(900 + i * 60, 0.07, { type: 'sine', gain: 0.15, delay: i * 0.1 })
  },
  shrug: () => {
    tone(400, 0.2, { type: 'triangle', gain: 0.2 })
    tone(300, 0.3, { type: 'triangle', gain: 0.2, delay: 0.22 })
  },
  kaput: () => {
    ;[392, 370, 349, 330].forEach((f, i) => tone(f, i === 3 ? 0.8 : 0.3, { type: 'triangle', gain: 0.18, delay: 0.6 + i * 0.32 }))
  },
  win: () => {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i === 3 ? 0.6 : 0.16, { type: 'square', gain: 0.1, delay: i * 0.14 }))
  },
  tap: () => tone(660, 0.05, { type: 'triangle', gain: 0.15 }),
  untap: () => tone(330, 0.06, { type: 'triangle', gain: 0.15 }),
}

const MISHAP_SFX: Record<string, () => void> = {
  bonk: SFX.bonk,
  headBonk: SFX.bonk,
  bins: SFX.crash,
  fishtank: SFX.crash,
  juggle: SFX.crash,
  splash: SFX.splash,
  ouch: SFX.ouch,
  prickle: SFX.ouch,
  yeowch: SFX.ouch,
  zap: SFX.zap,
  pffft: SFX.pffft,
  woof: SFX.woof,
  mrrow: SFX.meow,
  scratch: SFX.meow,
  flap: SFX.flap,
  babyWoke: SFX.waah,
  dogAte: SFX.chomp,
  tickle: SFX.giggle,
  neckBoing: SFX.boing,
  legsInAir: SFX.boing,
  headOff: SFX.pop,
  pickNose: SFX.shrug,
  noRoom: SFX.shrug,
  tooHeavy: SFX.shrug,
  floatedAway: SFX.splash,
}

export function playEvents(events: WorldEvent[]): void {
  for (const e of events) {
    switch (e.type) {
      case 'moved':
        if (e.how === 'scoot') SFX.scoot()
        else SFX.step()
        break
      case 'slid':
        SFX.slide()
        break
      case 'launched':
        SFX.boing()
        break
      case 'turned':
        SFX.turn()
        break
      case 'picked':
        SFX.pick()
        break
      case 'dropped':
      case 'gave':
        SFX.drop()
        break
      case 'beeped':
        SFX.beep()
        break
      case 'sat':
      case 'stood':
        SFX.turn()
        break
      case 'mishap':
        MISHAP_SFX[e.id]?.()
        if (e.kaput) SFX.kaput()
        break
      case 'thingGone':
        if (e.how === 'flew') SFX.flap()
        break
      case 'shrugged':
        SFX.shrug()
        break
      default:
        break
    }
  }
}
