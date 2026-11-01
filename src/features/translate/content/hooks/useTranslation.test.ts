import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTranslation } from './useTranslation'
import * as translateApi from '@/features/translate/api'

vi.mock('@/features/translate/api')

describe('useTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts in idle state when text is null', () => {
    const { result } = renderHook(() => useTranslation(null))
    expect(result.current.state).toEqual({ status: 'idle' })
  })

  it('transitions to loading and then success when lookup succeeds', async () => {
    vi.mocked(translateApi.translateWord).mockResolvedValue({
      ok: true,
      data: {
        translation: 'rộng khắp',
        phonetic: '/juːˈbɪkwɪtəs/',
        partOfSpeech: 'adjective',
        cached: false
      }
    })

    const { result } = renderHook(() => useTranslation('ubiquitous'))

    expect(result.current.state.status).toBe('loading')

    await waitFor(() => {
      expect(result.current.state.status).toBe('success')
    })

    if (result.current.state.status === 'success') {
      expect(result.current.state.data.translation).toBe('rộng khắp')
      expect(result.current.state.data.phonetic).toBe('/juːˈbɪkwɪtəs/')
    }
  })

  it('transitions to error state when lookup fails', async () => {
    vi.mocked(translateApi.translateWord).mockResolvedValue({
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'No internet',
        retryable: true
      }
    })

    const { result } = renderHook(() => useTranslation('glitch'))

    await waitFor(() => {
      expect(result.current.state.status).toBe('error')
    })

    if (result.current.state.status === 'error') {
      expect(result.current.state.code).toBe('NETWORK_ERROR')
      expect(result.current.state.retryable).toBe(true)
    }
  })

  it('retries translation on retry()', async () => {
    vi.mocked(translateApi.translateWord)
      .mockResolvedValueOnce({
        ok: false,
        error: { code: 'NETWORK_ERROR', message: 'Fail', retryable: true }
      })
      .mockResolvedValueOnce({
        ok: true,
        data: { translation: 'thành công', cached: false }
      })

    const { result } = renderHook(() => useTranslation('tryAgain'))

    await waitFor(() => {
      expect(result.current.state.status).toBe('error')
    })

    act(() => {
      result.current.retry()
    })

    await waitFor(() => {
      expect(result.current.state.status).toBe('success')
    })

    expect(translateApi.translateWord).toHaveBeenCalledTimes(2)
  })
})

