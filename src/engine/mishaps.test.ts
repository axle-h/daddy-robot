import { describe, expect, it } from 'vitest'
import { MISHAPS } from './mishaps'
import { run } from './run'
import { room } from './testing'
import type { Command, LegendEntry, MishapId } from './types'

interface Case {
  map: string
  program: Command[]
  legend?: Record<string, LegendEntry>
}

/** One way to trigger each mishap; the Record type makes a new mishap fail to compile until it has one. */
const CASES: Record<MishapId, Case> = {
  bonk: { map: '#>#', program: ['FRWD'] },
  splash: { map: '#>~#', program: ['FRWD'] },
  ouch: { map: '#>L#', program: ['FRWD'] },
  headBonk: { map: '#>T#', program: ['FRWD'] },
  bins: { map: '#>U#', program: ['FRWD'] },
  tickle: { map: '#>G#', program: ['FRWD'] },
  woof: { map: '#>D#', program: ['FRWD'] },
  flap: { map: '#>P#', program: ['FRWD'] },
  fishtank: { map: '#>N..Q#', program: ['FRWD'] },
  prickle: { map: '#>X#', program: ['FRWD'] },
  pickNose: { map: '#>.#', program: ['PICK'] },
  juggle: { map: '#B>O#', program: ['PICK', 'LEFT', 'LEFT', 'PICK'] },
  scratch: { map: '#>C#', program: ['PICK'] },
  tooHeavy: { map: '#>F#', program: ['PICK'] },
  zap: { map: '#rK#', program: ['PICK'], legend: { r: { floor: 'puddle', robot: 'E' } } },
  headOff: { map: '#>.#', program: ['DROP'] },
  dogAte: { map: '#>BD#', program: ['PICK', 'BEEP', 'DROP'] },
  floatedAway: { map: '#>B~#', program: ['PICK', 'FRWD', 'DROP'] },
  noRoom: { map: '#fB#', program: ['PICK', 'LEFT', 'DROP'], legend: { f: { thing: 'flag', robot: 'E' } } },
  pffft: { map: '#>W#', program: ['FRWD'] },
  mrrow: { map: '#>C.#', program: ['FRWD', 'DOWN'] },
  yeowch: { map: '#>X.#', program: ['FRWD', 'DOWN'] },
  legsInAir: { map: '#>#', program: ['DOWN', 'DOWN'] },
  neckBoing: { map: '#>#', program: ['STUP'] },
  babyWoke: { map: '#>.Z#', program: ['BEEP'] },
}

const boxed = (row: string) => ['#'.repeat(row.length), row, '#'.repeat(row.length)]

describe('every mishap', () => {
  for (const [id, c] of Object.entries(CASES) as [MishapId, Case][]) {
    it(`${id} happens, and is ${MISHAPS[id].kaput ? 'kaput' : 'an oops'}`, () => {
      const result = run(room(boxed(c.map), c.legend), c.program)
      const mishaps = result.trace.flatMap((s) => s.events).filter((e) => e.type === 'mishap')
      expect(mishaps.map((m) => m.id)).toContain(id)
      if (MISHAPS[id].kaput) expect(result.outcome).toEqual({ kind: 'kaput', mishap: id })
      else expect(result.outcome.kind).not.toBe('kaput')
    })
  }
})
