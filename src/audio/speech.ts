import { audio } from './sfx'

let enabled = true
let bus: GainNode | null = null

export const setSpeech = (value: boolean) => {
  enabled = value
  if (!value) stopSpeaking()
}

/** Two formant bands per vowel, so syllables keep a hint of their vowel without being words. */
const FORMANTS: Record<string, [number, number]> = {
  a: [800, 1200],
  e: [500, 1900],
  i: [320, 2300],
  o: [500, 900],
  u: [350, 800],
  y: [320, 2200],
}

/** A pentatonic scale, so the babble sounds sung rather than random. */
const SCALE = [0, 2, 4, 7, 9, 12]
const BASE_HZ = 140
const MAX_SYLLABLES = 48

interface Syllable {
  vowel: string
  semitones: number
  seconds: number
  gap: number
  glide: number
  gain: number
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** The same line always babbles the same tune, so repeated lines feel like words. */
function syllables(text: string): Syllable[] {
  const out: Syllable[] = []
  for (const [, word = '', punct = ''] of text.toLowerCase().matchAll(/([a-z']+)([^a-z']*)/g)) {
    const parts = word.match(/[aeiouy]+[^aeiouy]*/g) ?? [`u${word}`]
    parts.forEach((part, i) => {
      const last = i === parts.length - 1
      const shout = last && punct.includes('!')
      const ask = last && punct.includes('?')
      out.push({
        vowel: part[0]!,
        semitones: SCALE[hash(part + i) % SCALE.length]! + (shout ? 5 : 0),
        seconds: 0.07 + Math.min(part.length - 1, 3) * 0.015 + (ask ? 0.12 : 0),
        gap: !last ? 0.015 : /[.!?]/.test(punct) ? 0.22 : punct.includes(',') ? 0.14 : 0.05,
        glide: ask ? 12 : shout ? -3 : 0,
        gain: shout ? 0.5 : 0.35,
      })
    })
  }
  return out.slice(0, MAX_SYLLABLES)
}

/** Daddy Robot talks in synthesised robot babble; the speech bubble carries the words. */
export function speak(text: string): void {
  stopSpeaking()
  const ac = enabled ? audio() : null
  if (!ac) return
  try {
    bus = ac.createGain()
    bus.gain.value = 1.6
    bus.connect(ac.destination)
    let t = ac.currentTime + 0.05
    for (const s of syllables(text)) {
      const freq = BASE_HZ * 2 ** (s.semitones / 12)
      const osc = ac.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, t)
      if (s.glide) osc.frequency.exponentialRampToValueAtTime(freq * 2 ** (s.glide / 12), t + s.seconds)
      const amp = ac.createGain()
      amp.gain.setValueAtTime(0.0001, t)
      amp.gain.exponentialRampToValueAtTime(s.gain, t + 0.012)
      amp.gain.setValueAtTime(s.gain, t + s.seconds - 0.02)
      amp.gain.exponentialRampToValueAtTime(0.0001, t + s.seconds)
      for (const f of FORMANTS[s.vowel] ?? FORMANTS.u!) {
        const band = ac.createBiquadFilter()
        band.type = 'bandpass'
        band.frequency.value = f
        band.Q.value = 5
        osc.connect(band).connect(amp)
      }
      amp.connect(bus)
      osc.start(t)
      osc.stop(t + s.seconds + 0.02)
      t += s.seconds + s.gap
    }
  } catch {
    // No audio here; the bubble still shows.
  }
}

export function stopSpeaking(): void {
  try {
    bus?.disconnect()
  } catch {
    // Already gone.
  }
  bus = null
}
