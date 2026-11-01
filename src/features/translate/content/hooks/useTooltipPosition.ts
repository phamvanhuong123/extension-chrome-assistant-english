import { useState, useEffect } from 'react'

export interface TooltipPosition {
  top: number
  left: number
  placementY: 'bottom' | 'top'
}

export const TOOLTIP_OFFSET_Y = 8
export const TOOLTIP_VIEWPORT_MARGIN = 8
export const ESTIMATED_TOOLTIP_WIDTH = 320
export const ESTIMATED_TOOLTIP_HEIGHT = 220

export function computeTooltipPosition(
  rects: ArrayLike<DOMRect>,
  viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024,
  viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768
): TooltipPosition | null {
  if (!rects || rects.length === 0) return null

  const firstRect = rects[0]
  const lastRect = rects[rects.length - 1]

  // Default placement below
  let top = lastRect.bottom + TOOLTIP_OFFSET_Y
  let placementY: 'bottom' | 'top' = 'bottom'

  // Flip above if overflowing below and there is enough room above
  const overflowsBottom = top + ESTIMATED_TOOLTIP_HEIGHT > viewportHeight - TOOLTIP_VIEWPORT_MARGIN
  const spaceAbove = firstRect.top - TOOLTIP_OFFSET_Y - ESTIMATED_TOOLTIP_HEIGHT

  if (overflowsBottom && spaceAbove >= TOOLTIP_VIEWPORT_MARGIN) {
    top = spaceAbove
    placementY = 'top'
  }

  // Clamp horizontal position
  let left = lastRect.left
  if (left + ESTIMATED_TOOLTIP_WIDTH > viewportWidth - TOOLTIP_VIEWPORT_MARGIN) {
    left = viewportWidth - TOOLTIP_VIEWPORT_MARGIN - ESTIMATED_TOOLTIP_WIDTH
  }
  if (left < TOOLTIP_VIEWPORT_MARGIN) {
    left = TOOLTIP_VIEWPORT_MARGIN
  }

  return { top: Math.round(top), left: Math.round(left), placementY }
}

export function useTooltipPosition(rects: DOMRectList | DOMRect[] | null): TooltipPosition | null {
  const [, setTick] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleUpdate = () => {
      setTick((t) => (t + 1) % 1000000)
    }

    window.addEventListener('scroll', handleUpdate, { passive: true })
    window.addEventListener('resize', handleUpdate)

    return () => {
      window.removeEventListener('scroll', handleUpdate)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [])

  if (!rects || rects.length === 0) return null
  return computeTooltipPosition(rects)
}
