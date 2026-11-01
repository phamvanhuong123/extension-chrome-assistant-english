import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTextSelection } from './useTextSelection'

describe('useTextSelection', () => {
  const originalGetClientRects = Range.prototype.getClientRects

  beforeEach(() => {
    vi.useFakeTimers()
    Range.prototype.getClientRects = vi.fn().mockReturnValue([])
  })

  afterEach(() => {
    Range.prototype.getClientRects = originalGetClientRects
    vi.useRealTimers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('initializes with null selection', () => {
    const { result } = renderHook(() => useTextSelection())
    expect(result.current.selection).toBeNull()
  })

  it('updates selection on mouseup after debounce for valid text', () => {
    const p = document.createElement('p')
    p.textContent = 'hello world'
    document.body.appendChild(p)

    const textNode = p.firstChild as Text
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, 5)

    const mockRects = [{ top: 10, bottom: 25, left: 10, right: 50, width: 40, height: 15 }]
    Range.prototype.getClientRects = vi.fn().mockReturnValue(mockRects)

    const selectionMock = {
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: () => range,
      toString: () => 'hello'
    } as unknown as Selection

    vi.spyOn(window, 'getSelection').mockReturnValue(selectionMock)

    const { result } = renderHook(() => useTextSelection())

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
    })

    // Before debounce
    expect(result.current.selection).toBeNull()

    // Fast-forward debounce
    act(() => {
      vi.advanceTimersByTime(120)
    })

    expect(result.current.selection).not.toBeNull()
    expect(result.current.selection?.text).toBe('hello')
  })

  it('ignores selection inside input elements', () => {
    const input = document.createElement('input')
    input.value = 'confidential'
    document.body.appendChild(input)

    const range = document.createRange()
    range.selectNodeContents(input)

    const selectionMock = {
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: () => range,
      toString: () => 'confidential'
    } as unknown as Selection

    vi.spyOn(window, 'getSelection').mockReturnValue(selectionMock)

    const { result } = renderHook(() => useTextSelection())

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
      vi.advanceTimersByTime(120)
    })

    expect(result.current.selection).toBeNull()
  })

  it('ignores selection inside contenteditable elements', () => {
    const editableDiv = document.createElement('div')
    editableDiv.contentEditable = 'true'
    editableDiv.textContent = 'editable text'
    document.body.appendChild(editableDiv)

    const textNode = editableDiv.firstChild as Text
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, 8)

    const selectionMock = {
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: () => range,
      toString: () => 'editable'
    } as unknown as Selection

    vi.spyOn(window, 'getSelection').mockReturnValue(selectionMock)

    const { result } = renderHook(() => useTextSelection())

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
      vi.advanceTimersByTime(120)
    })

    expect(result.current.selection).toBeNull()
  })

  it('ignores selection exceeding max characters (100 chars)', () => {
    const p = document.createElement('p')
    const longText = 'a'.repeat(101)
    p.textContent = longText
    document.body.appendChild(p)

    const textNode = p.firstChild as Text
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, 101)

    const selectionMock = {
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: () => range,
      toString: () => longText
    } as unknown as Selection

    vi.spyOn(window, 'getSelection').mockReturnValue(selectionMock)

    const { result } = renderHook(() => useTextSelection())

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
      vi.advanceTimersByTime(120)
    })

    expect(result.current.selection).toBeNull()
  })

  it('ignores selection exceeding max words (5 words)', () => {
    const p = document.createElement('p')
    const sixWords = 'one two three four five six'
    p.textContent = sixWords
    document.body.appendChild(p)

    const textNode = p.firstChild as Text
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, sixWords.length)

    const selectionMock = {
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: () => range,
      toString: () => sixWords
    } as unknown as Selection

    vi.spyOn(window, 'getSelection').mockReturnValue(selectionMock)

    const { result } = renderHook(() => useTextSelection())

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
      vi.advanceTimersByTime(120)
    })

    expect(result.current.selection).toBeNull()
  })

  it('clears selection when clear() is invoked', () => {
    const p = document.createElement('p')
    p.textContent = 'valid'
    document.body.appendChild(p)

    const textNode = p.firstChild as Text
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, 5)

    const selectionMock = {
      isCollapsed: false,
      rangeCount: 1,
      getRangeAt: () => range,
      toString: () => 'valid'
    } as unknown as Selection

    vi.spyOn(window, 'getSelection').mockReturnValue(selectionMock)

    const { result } = renderHook(() => useTextSelection())

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'))
      vi.advanceTimersByTime(120)
    })

    expect(result.current.selection).not.toBeNull()

    act(() => {
      result.current.clear()
    })

    expect(result.current.selection).toBeNull()
  })
})
