import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'
import { handleTranslateWord } from './translate.handler'
import * as client from './translate.client'

vi.mock('./translate.client')

describe('translate.handler (FR-01)', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.session._reset()
    vi.clearAllMocks()
  })

  it('checks session cache and returns cached translation when available', async () => {
    const cachedEntry = {
      translation: 'có mặt ở khắp nơi',
      phonetic: '/juːˈbɪkwɪtəs/',
      partOfSpeech: 'adjective',
      cachedAt: Date.now(),
      ttlMs: 86_400_000
    }
    const cacheKey = 'cache:tr:vi:ubiquitous'
    await chromeMock.storage.session.set({ [cacheKey]: cachedEntry })

    const res = await handleTranslateWord({
      type: 'TRANSLATE_WORD',
      payload: { text: 'Ubiquitous', sourceLang: 'en', targetLang: 'vi' }
    })

    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data).toEqual({
        translation: 'có mặt ở khắp nơi',
        phonetic: '/juːˈbɪkwɪtəs/',
        partOfSpeech: 'adjective',
        cached: true
      })
    }
    expect(client.translateWord).not.toHaveBeenCalled()
  })

  it('calls client on cache miss, caches the translation, and returns cached: false', async () => {
    vi.mocked(client.translateWord).mockResolvedValueOnce({
      translation: 'kiên cường',
      phonetic: '/rɪˈzɪliəns/'
    })

    const res = await handleTranslateWord({
      type: 'TRANSLATE_WORD',
      payload: { text: 'Resilience', sourceLang: 'en', targetLang: 'vi' }
    })

    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data).toEqual({
        translation: 'kiên cường',
        phonetic: '/rɪˈzɪliəns/',
        partOfSpeech: undefined,
        cached: false
      })
    }
    expect(client.translateWord).toHaveBeenCalledWith({
      text: 'resilience',
      sourceLang: 'en',
      targetLang: 'vi'
    })

    // Verify written to session storage
    const stored = (await chromeMock.storage.session.get('cache:tr:vi:resilience'))['cache:tr:vi:resilience']
    expect(stored).toMatchObject({
      translation: 'kiên cường',
      phonetic: '/rɪˈzɪliəns/'
    })
  })

  it('rejects text exceeding 100 characters with VALIDATION_ERROR', async () => {
    const res = await handleTranslateWord({
      type: 'TRANSLATE_WORD',
      payload: { text: 'a'.repeat(101), sourceLang: 'en', targetLang: 'vi' }
    })

    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('rejects text with more than 5 words with VALIDATION_ERROR', async () => {
    const res = await handleTranslateWord({
      type: 'TRANSLATE_WORD',
      payload: { text: 'one two three four five six', sourceLang: 'en', targetLang: 'vi' }
    })

    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('rejects empty or whitespace-only text with VALIDATION_ERROR', async () => {
    const res = await handleTranslateWord({
      type: 'TRANSLATE_WORD',
      payload: { text: '   ', sourceLang: 'en', targetLang: 'vi' }
    })

    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('maps client RATE_LIMITED error correctly', async () => {
    vi.mocked(client.translateWord).mockRejectedValueOnce(
      Object.assign(new Error('Rate limit exceeded'), { code: 'RATE_LIMITED', retryable: true })
    )

    const res = await handleTranslateWord({
      type: 'TRANSLATE_WORD',
      payload: { text: 'limit', sourceLang: 'en', targetLang: 'vi' }
    })

    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe('RATE_LIMITED')
      expect(res.error.retryable).toBe(true)
    }
  })

  it('maps client NETWORK_ERROR correctly with retryable: true', async () => {
    vi.mocked(client.translateWord).mockRejectedValueOnce(
      Object.assign(new Error('Network error'), { code: 'NETWORK_ERROR', retryable: true })
    )

    const res = await handleTranslateWord({
      type: 'TRANSLATE_WORD',
      payload: { text: 'offline', sourceLang: 'en', targetLang: 'vi' }
    })

    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe('NETWORK_ERROR')
      expect(res.error.retryable).toBe(true)
    }
  })

  it('maps client TIMEOUT error correctly with retryable: true', async () => {
    vi.mocked(client.translateWord).mockRejectedValueOnce(
      Object.assign(new Error('Request timed out'), { code: 'TIMEOUT', retryable: true })
    )

    const res = await handleTranslateWord({
      type: 'TRANSLATE_WORD',
      payload: { text: 'slow', sourceLang: 'en', targetLang: 'vi' }
    })

    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.code).toBe('TIMEOUT')
      expect(res.error.retryable).toBe(true)
    }
  })
})
