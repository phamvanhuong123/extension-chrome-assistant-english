import { useState, useEffect, useRef, useCallback } from 'react'
import { saveWord, getWordStatus } from '@/features/vocabulary/api'

export type SaveState = 'idle' | 'checking' | 'unsaved' | 'saving' | 'saved' | 'error'

export function useSaveWord(text: string | null, translation: string | undefined, context: string, sourceUrl: string) {
  const [savedStatus, setSavedStatus] = useState<{
    text: string
    saved: boolean
    id?: string
  } | null>(null)
  const [actionState, setActionState] = useState<'saving' | 'error' | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!text || !translation) return
    let active = true

    getWordStatus({ text, targetLang: 'vi' })
      .then((res) => {
        if (!active) return
        if (res.ok && res.data.saved) {
          setSavedStatus({ text, saved: true, id: res.data.id })
        } else {
          setSavedStatus({ text, saved: false })
        }
      })
      .catch(() => {
        if (!active) return
        setSavedStatus({ text, saved: false })
      })

    return () => {
      active = false
    }
  }, [text, translation])

  const handleSave = useCallback(async () => {
    if (!text || !translation) return

    setActionState('saving')
    try {
      const res = await saveWord({
        text,
        translation,
        context,
        sourceUrl,
        sourceLang: 'en',
        targetLang: 'vi'
      })

      if (res.ok) {
        setSavedStatus({ text, saved: true, id: res.data.id })
        setActionState(null)
      } else {
        setActionState('error')
        timerRef.current = setTimeout(() => {
          setActionState(null)
        }, 2000)
      }
    } catch {
      setActionState('error')
      timerRef.current = setTimeout(() => {
        setActionState(null)
      }, 2000)
    }
  }, [text, translation, context, sourceUrl])

  let saveState: SaveState = 'idle'
  let savedWordId: string | undefined

  if (text && translation) {
    if (actionState === 'saving') {
      saveState = 'saving'
    } else if (actionState === 'error') {
      saveState = 'error'
    } else if (savedStatus && savedStatus.text === text) {
      saveState = savedStatus.saved ? 'saved' : 'unsaved'
      savedWordId = savedStatus.id
    } else {
      saveState = 'checking'
    }
  }

  return { saveState, savedWordId, handleSave }
}
