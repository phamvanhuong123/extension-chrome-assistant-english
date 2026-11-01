import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSaveWord } from './useSaveWord'
import * as vocabApi from '@/features/vocabulary/api'

vi.mock('@/features/vocabulary/api')

describe('useSaveWord', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts in idle when text or translation is missing', () => {
    const { result } = renderHook(() => useSaveWord(null, undefined, '', ''))
    expect(result.current.saveState).toBe('idle')
  })

  it('detects previously saved word on mount', async () => {
    vi.mocked(vocabApi.getWordStatus).mockResolvedValue({
      ok: true,
      data: { saved: true, id: 'vocab-123' }
    })

    const { result } = renderHook(() =>
      useSaveWord('ubiquitous', 'phổ biến', 'context sentence', 'https://example.com')
    )

    expect(result.current.saveState).toBe('checking')

    await waitFor(() => {
      expect(result.current.saveState).toBe('saved')
    })
    expect(result.current.savedWordId).toBe('vocab-123')
  })

  it('sets unsaved if word was not previously saved', async () => {
    vi.mocked(vocabApi.getWordStatus).mockResolvedValue({
      ok: true,
      data: { saved: false }
    })

    const { result } = renderHook(() => useSaveWord('newWord', 'từ mới', '', ''))

    await waitFor(() => {
      expect(result.current.saveState).toBe('unsaved')
    })
  })

  it('saves word successfully on handleSave()', async () => {
    vi.mocked(vocabApi.getWordStatus).mockResolvedValue({
      ok: true,
      data: { saved: false }
    })
    vi.mocked(vocabApi.saveWord).mockResolvedValue({
      ok: true,
      data: { id: 'created-id-456', created: true }
    })

    const { result } = renderHook(() => useSaveWord('hello', 'xin chào', 'hello world', 'https://example.com'))

    await waitFor(() => {
      expect(result.current.saveState).toBe('unsaved')
    })

    await act(async () => {
      await result.current.handleSave()
    })

    expect(result.current.saveState).toBe('saved')
    expect(result.current.savedWordId).toBe('created-id-456')
    expect(vocabApi.saveWord).toHaveBeenCalledWith({
      text: 'hello',
      translation: 'xin chào',
      context: 'hello world',
      sourceUrl: 'https://example.com',
      sourceLang: 'en',
      targetLang: 'vi'
    })
  })

  it('handles save failure and reverts to unsaved after 2 seconds', async () => {
    vi.useFakeTimers()
    try {
      vi.mocked(vocabApi.getWordStatus).mockResolvedValue({
        ok: true,
        data: { saved: false }
      })
      vi.mocked(vocabApi.saveWord).mockResolvedValue({
        ok: false,
        error: { code: 'STORAGE_ERROR', message: 'Quota exceeded' }
      })

      const { result } = renderHook(() => useSaveWord('failWord', 'nghĩa', '', ''))

      // Flush getWordStatus promise
      await act(async () => {
        await Promise.resolve()
      })

      expect(result.current.saveState).toBe('unsaved')

      await act(async () => {
        await result.current.handleSave()
      })

      expect(result.current.saveState).toBe('error')

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(result.current.saveState).toBe('unsaved')
    } finally {
      vi.useRealTimers()
    }
  })
})
