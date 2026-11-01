import { useState, useEffect, useCallback } from 'react'
import { MAX_INPUT_CHARS, MAX_WORDS } from '@/features/translate/types'
import { countWords } from '@/shared/utils'

export interface SelectionInfo {
  text: string
  range: Range
  rects: DOMRectList
}

const DEBOUNCE_MS = 120
const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isInEditable(node: Node | null): boolean {
  if (!node) return false
  let current: Node | null = node
  while (current && current !== document.body) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as HTMLElement
      if (EDITABLE_TAGS.has(el.tagName)) return true
      const attr = el.getAttribute('contenteditable')
      const isEditable =
        el.isContentEditable ||
        attr === 'true' ||
        attr === '' ||
        (el.contentEditable && el.contentEditable !== 'false' && el.contentEditable !== 'inherit')
      if (isEditable) {
        return true
      }
    }
    current = current.parentElement
  }
  return false
}

export function useTextSelection() {
  const [selection, setSelection] = useState<SelectionInfo | null>(null)

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setSelection(null)
      return
    }

    const range = sel.getRangeAt(0)
    const text = sel.toString().trim()
    if (!text) {
      setSelection(null)
      return
    }

    if (isInEditable(range.startContainer) || isInEditable(range.endContainer)) {
      setSelection(null)
      return
    }

    if (text.length > MAX_INPUT_CHARS || countWords(text) > MAX_WORDS) {
      setSelection(null)
      return
    }

    const rects = typeof range.getClientRects === 'function' ? range.getClientRects() : ([] as unknown as DOMRectList)

    setSelection({ text, range, rects })
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const onMouseUp = () => {
      clearTimeout(timer)
      timer = setTimeout(handleSelectionChange, DEBOUNCE_MS)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Shift'].includes(e.key)) {
        clearTimeout(timer)
        timer = setTimeout(handleSelectionChange, DEBOUNCE_MS)
      }
    }

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keyup', onKeyUp)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('keyup', onKeyUp)
    }
  }, [handleSelectionChange])

  const clear = useCallback(() => {
    setSelection(null)
  }, [])

  return { selection, clear }
}
