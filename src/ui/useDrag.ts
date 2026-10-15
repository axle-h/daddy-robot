import { useEffect, useEffectEvent, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { gapAt, type DragSource, type DropTarget } from './program'

/** How far a finger moves before a press becomes a drag rather than a tap. */
const SLOP = 8

export interface Dragging {
  source: DragSource
  x: number
  y: number
  /** Where the pointer grabbed the tile, so the tile doesn't jump under the finger. */
  grabX: number
  grabY: number
  target: DropTarget
}

interface Options {
  strip: RefObject<HTMLElement | null>
  bin: RefObject<HTMLElement | null>
  onTap: (source: DragSource) => void
  onDrop: (source: DragSource, target: DropTarget) => void
}

interface Press {
  id: number
  source: DragSource
  startX: number
  startY: number
  grabX: number
  grabY: number
  dragging: boolean
}

const inside = (r: DOMRect, x: number, y: number, pad = 0) => x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad

/** Pointer-event drag and drop for command tiles, so it works the same with a finger or a mouse. */
export function useDrag({ strip, bin, onTap, onDrop }: Options) {
  const [dragging, setDragging] = useState<Dragging | null>(null)
  const press = useRef<Press | null>(null)

  const targetAt = (x: number, y: number): DropTarget => {
    const b = bin.current?.getBoundingClientRect()
    if (b && inside(b, x, y, 12)) return { kind: 'bin' }
    const s = strip.current?.getBoundingClientRect()
    if (!s || !inside(s, x, y, 16)) return null
    const tiles = [...(strip.current?.querySelectorAll<HTMLElement>('[data-slot]') ?? [])].map((t) => t.getBoundingClientRect())
    return { kind: 'strip', index: gapAt(tiles, x, y) }
  }

  const move = useEffectEvent((e: PointerEvent) => {
    const p = press.current
    if (!p || e.pointerId !== p.id) return
    if (!p.dragging && Math.hypot(e.clientX - p.startX, e.clientY - p.startY) < SLOP) return
    p.dragging = true
    setDragging({ source: p.source, x: e.clientX, y: e.clientY, grabX: p.grabX, grabY: p.grabY, target: targetAt(e.clientX, e.clientY) })
  })

  const end = useEffectEvent((e: PointerEvent) => {
    const p = press.current
    if (!p || e.pointerId !== p.id) return
    press.current = null
    setDragging(null)
    if (e.type === 'pointercancel') return
    if (p.dragging) onDrop(p.source, targetAt(e.clientX, e.clientY))
    else onTap(p.source)
  })

  useEffect(() => {
    const up = (e: PointerEvent) => end(e)
    const mv = (e: PointerEvent) => move(e)
    window.addEventListener('pointermove', mv)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', mv)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [])

  const start = (e: ReactPointerEvent<HTMLElement>, source: DragSource) => {
    if (press.current || (e.pointerType === 'mouse' && e.button !== 0)) return
    const r = e.currentTarget.getBoundingClientRect()
    press.current = { id: e.pointerId, source, startX: e.clientX, startY: e.clientY, grabX: e.clientX - r.left, grabY: e.clientY - r.top, dragging: false }
    // A touch is captured by the element it started on; release it so the strip and bin see the finger.
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return { dragging, start }
}
