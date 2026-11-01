import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { computeTooltipPosition, useTooltipPosition } from './useTooltipPosition'

function makeDOMRect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    bottom: y + height,
    left: x,
    right: x + width,
    toJSON: () => ({})
  } as DOMRect
}

describe('computeTooltipPosition (Pure calculation)', () => {
  it('returns null when rects is empty or null', () => {
    expect(computeTooltipPosition([] as DOMRect[], 1024, 768)).toBeNull()
  })

  it('places tooltip below the selection by default with 8px offset', () => {
    const rect = makeDOMRect(100, 100, 80, 20)
    const pos = computeTooltipPosition([rect], 1024, 768)

    expect(pos).toEqual({
      top: 128, // 100 + 20 + 8
      left: 100,
      placementY: 'bottom'
    })
  })

  it('flips to top when overflowing bottom viewport', () => {
    // Selection near bottom: top=700, height=20, bottom=720 in a 768px viewport
    // 720 + 8 + 220 = 948 > 768 - 8 (760) -> overflows bottom
    // Space above: 700 - 8 - 220 = 472 >= 8 -> fits above
    const rect = makeDOMRect(100, 700, 80, 20)
    const pos = computeTooltipPosition([rect], 1024, 768)

    expect(pos).toEqual({
      top: 472, // 700 - 8 - 220
      left: 100,
      placementY: 'top'
    })
  })

  it('clamps left when overflowing right edge of viewport', () => {
    // 1000 + 320 = 1320 > 1024 - 8 (1016)
    // Clamped left = 1024 - 8 - 320 = 696
    const rect = makeDOMRect(1000, 100, 80, 20)
    const pos = computeTooltipPosition([rect], 1024, 768)

    expect(pos?.left).toBe(696)
  })

  it('clamps left to VIEWPORT_MARGIN when selection is off left edge', () => {
    const rect = makeDOMRect(-10, 100, 80, 20)
    const pos = computeTooltipPosition([rect], 1024, 768)

    expect(pos?.left).toBe(8)
  })
})

describe('useTooltipPosition (Hook behavior)', () => {
  it('recomputes position on scroll and resize', () => {
    const rects = [makeDOMRect(100, 100, 80, 20)]
    const { result } = renderHook(() => useTooltipPosition(rects))

    expect(result.current).not.toBeNull()

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current?.top).toBe(128)
  })

  it('returns null when rects is null', () => {
    const { result } = renderHook(() => useTooltipPosition(null))
    expect(result.current).toBeNull()
  })
})
