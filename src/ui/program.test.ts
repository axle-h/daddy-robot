import { describe, expect, it } from 'vitest'
import type { Command } from '../engine'
import { drop, gapAt } from './program'

const P: Command[] = ['FRWD', 'LEFT', 'PICK']

describe('dropping a dragged tile', () => {
  it('inserts a palette tile at the gap', () => {
    expect(drop(P, { from: 'palette', command: 'BEEP' }, { kind: 'strip', index: 1 }, 40)).toEqual(['FRWD', 'BEEP', 'LEFT', 'PICK'])
  })

  it('moves a program tile to the gap', () => {
    expect(drop(P, { from: 'strip', command: 'FRWD', index: 0 }, { kind: 'strip', index: 2 }, 40)).toEqual(['LEFT', 'PICK', 'FRWD'])
    expect(drop(P, { from: 'strip', command: 'PICK', index: 2 }, { kind: 'strip', index: 0 }, 40)).toEqual(['PICK', 'FRWD', 'LEFT'])
  })

  it('deletes a program tile dropped on the bin', () => {
    expect(drop(P, { from: 'strip', command: 'LEFT', index: 1 }, { kind: 'bin' }, 40)).toEqual(['FRWD', 'PICK'])
  })

  it('ignores a palette tile dropped on the bin or nowhere, and a full program', () => {
    expect(drop(P, { from: 'palette', command: 'BEEP' }, { kind: 'bin' }, 40)).toEqual(P)
    expect(drop(P, { from: 'strip', command: 'LEFT', index: 1 }, null, 40)).toEqual(P)
    expect(drop(P, { from: 'palette', command: 'BEEP' }, { kind: 'strip', index: 0 }, 3)).toEqual(P)
  })
})

describe('finding the gap under the pointer', () => {
  // Two rows: three tiles, then one.
  const row = (top: number, n: number) => Array.from({ length: n }, (_, i) => ({ left: i * 60, top, width: 50, bottom: top + 50 }))
  const tiles = [...row(0, 3), ...row(60, 1)]

  it('picks the gap by which half of a tile the pointer is over', () => {
    expect(gapAt(tiles, 10, 25)).toBe(0)
    expect(gapAt(tiles, 40, 25)).toBe(1)
    expect(gapAt(tiles, 170, 25)).toBe(3)
  })

  it('wraps to the next row, and falls through to the end', () => {
    expect(gapAt(tiles, 10, 80)).toBe(3)
    expect(gapAt(tiles, 200, 80)).toBe(4)
    expect(gapAt(tiles, 10, 200)).toBe(4)
  })
})
