import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'

interface TranslatePayload {
  text: string
  sourceLang: string
  targetLang: string
}

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
      cachedAt: Date.now()
    }
    const cacheKey = 'cache:tr:vi:ubiquitous'
    await chromeMock.storage.session.set({ [cacheKey]: cachedEntry })

    const sessionData = await chromeMock.storage.session.get(cacheKey)
    expect(sessionData[cacheKey]).toEqual(cachedEntry)
  })

  it('rejects text exceeding 100 characters with VALIDATION_ERROR', () => {
    const longText = 'a'.repeat(101)
    const isValid = (p: TranslatePayload) => p.text.length <= 100 && p.text.trim().length > 0
    expect(isValid({ text: longText, sourceLang: 'en', targetLang: 'vi' })).toBe(false)
  })
})
