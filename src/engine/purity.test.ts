import { expect, it } from 'vitest'

const FORBIDDEN = [
  /from ['"]react/,
  /\bdocument\./,
  /\bwindow\./,
  /\b(setTimeout|setInterval|requestAnimationFrame)\b/,
  /Math\.random/,
  /\bDate\b/,
  /AudioContext/,
  /localStorage/,
  /from ['"]\.\.\/(ui|audio)/,
]

const SOURCES = import.meta.glob<string>(['./**/*.ts', '!./**/*.test.ts'], { query: '?raw', import: 'default', eager: true })

it('keeps the engine pure: no React, DOM, timers, randomness, clocks or audio', () => {
  expect(Object.keys(SOURCES).length).toBeGreaterThan(10)
  const offences = Object.entries(SOURCES).flatMap(([file, text]) =>
    FORBIDDEN.filter((re) => re.test(text)).map((re) => `${file}: ${re}`),
  )
  expect(offences).toEqual([])
})
