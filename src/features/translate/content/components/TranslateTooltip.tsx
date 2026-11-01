import { useEffect, useRef } from 'react'
import styles from './tooltip.module.css'
import { useTextSelection } from '../hooks/useTextSelection'
import { useTranslation } from '../hooks/useTranslation'
import { useSaveWord } from '../hooks/useSaveWord'
import { useTooltipPosition } from '../hooks/useTooltipPosition'
import { TooltipContent } from './TooltipContent'
import { TooltipActions } from './TooltipActions'
import { TooltipError } from './TooltipError'
import { Skeleton } from '@/shared/ui'

export function TranslateTooltip() {
  const { selection, clear } = useTextSelection()
  const tooltipRef = useRef<HTMLDivElement>(null)

  const selectedText = selection?.text ?? null
  const { state, retry } = useTranslation(selectedText)
  const position = useTooltipPosition(selection?.rects ?? null)

  const translation = state.status === 'success' ? state.data.translation : undefined
  const context = selection
    ? (selection.range.startContainer.parentElement?.innerText ?? selection.text).slice(0, 500)
    : ''
  const sourceUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0].split('#')[0] : ''

  const { saveState, handleSave } = useSaveWord(selectedText, translation, context, sourceUrl)

  useEffect(() => {
    if (!selection) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clear()
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [e.target as Node]
      if (tooltipRef.current && !path.includes(tooltipRef.current)) {
        clear()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onMouseDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [selection, clear])

  if (!selection || !position) return null

  return (
    <div
      ref={tooltipRef}
      className={styles.tooltip}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      role='dialog'
      aria-label='Dịch từ'
      data-placement={position.placementY}
      data-testid='translate-tooltip'
    >
      {state.status === 'loading' && (
        <div className={styles.skeletonWrap} data-testid='tooltip-loading'>
          <Skeleton width='65%' height={18} />
          <Skeleton width='40%' height={14} />
          <Skeleton width='90%' height={16} />
        </div>
      )}

      {state.status === 'success' && (
        <>
          <TooltipContent
            word={selection.text}
            translation={state.data.translation}
            phonetic={state.data.phonetic}
            partOfSpeech={state.data.partOfSpeech}
          />
          <TooltipActions saveState={saveState} onSave={handleSave} />
        </>
      )}

      {state.status === 'error' && <TooltipError code={state.code} retryable={state.retryable} onRetry={retry} />}
    </div>
  )
}
