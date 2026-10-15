import type { Command } from '../engine'

/** Where a dragged tile lands: a gap in the program strip, the bin, or nowhere. */
export type DropTarget = { kind: 'strip'; index: number } | { kind: 'bin' } | null

/** A tile being dragged, from the palette or from its place in the program. */
export type DragSource = { from: 'palette'; command: Command } | { from: 'strip'; command: Command; index: number }

/** The program with the dragged tile lifted out, which is what the strip shows while dragging. */
export function without(program: Command[], source: DragSource): Command[] {
  return source.from === 'strip' ? program.filter((_, i) => i !== source.index) : program
}

/** Apply a drop. `target.index` counts gaps in the program with the dragged tile lifted out. */
export function drop(program: Command[], source: DragSource, target: DropTarget, max: number): Command[] {
  if (!target) return program
  const rest = without(program, source)
  if (target.kind === 'bin') return rest
  if (source.from === 'palette' && program.length >= max) return program
  const at = Math.max(0, Math.min(target.index, rest.length))
  return [...rest.slice(0, at), source.command, ...rest.slice(at)]
}

interface Box {
  left: number
  top: number
  width: number
  bottom: number
}

/** The gap a pointer is over, for tiles laid out left to right in wrapping rows. */
export function gapAt(tiles: Box[], x: number, y: number): number {
  const i = tiles.findIndex((r) => y < r.bottom && (y < r.top || x < r.left + r.width / 2))
  return i === -1 ? tiles.length : i
}
