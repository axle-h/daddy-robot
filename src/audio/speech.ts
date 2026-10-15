let enabled = true

export const setSpeech = (value: boolean) => {
  enabled = value
  if (!value) stopSpeaking()
}

function voice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices()
  return voices.find((v) => /^en[-_]GB/i.test(v.lang)) ?? voices.find((v) => /^en/i.test(v.lang))
}

/** Daddy Robot's voice: low and slow. Silently does nothing where the browser has no speech. */
export function speak(text: string): void {
  if (!enabled || typeof speechSynthesis === 'undefined') return
  try {
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = voice()
    if (v) u.voice = v
    u.pitch = 0.4
    u.rate = 0.95
    speechSynthesis.speak(u)
  } catch {
    // No speech here; the bubble still shows.
  }
}

export function stopSpeaking(): void {
  try {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
  } catch {
    // Nothing to stop.
  }
}
