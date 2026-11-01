import { useState, useEffect, useCallback } from 'react'
import { translateWord } from '@/features/translate/api'
import type { TranslationResult } from '@/features/translate/types'

export type TranslationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: TranslationResult }
  | { status: 'error'; code: string; retryable: boolean }

export function useTranslation(text: string | null) {
  const [asyncState, setAsyncState] = useState<{
    text: string
    state: { status: 'success'; data: TranslationResult } | { status: 'error'; code: string; retryable: boolean }
  } | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!text) return
    let active = true

    translateWord({ text, sourceLang: 'en', targetLang: 'vi' })
      .then((res) => {
        if (!active) return
        if (res.ok) {
          setAsyncState({ text, state: { status: 'success', data: res.data } })
        } else {
          setAsyncState({
            text,
            state: {
              status: 'error',
              code: res.error.code,
              retryable: res.error.retryable ?? false
            }
          })
        }
      })
      .catch((err: unknown) => {
        if (!active) return
        setAsyncState({
          text,
          state: {
            status: 'error',
            code: 'UNKNOWN',
            retryable: false
          }
        })
        console.error('[useTranslation] Unexpected failure:', err)
      })

    return () => {
      active = false
    }
  }, [text, retryCount])

  const state: TranslationState = !text
    ? { status: 'idle' }
    : asyncState && asyncState.text === text
      ? asyncState.state
      : { status: 'loading' }

  const retry = useCallback(() => {
    setRetryCount((c) => (c < 2 ? c + 1 : c))
  }, [])

  return { state, retry }
}
