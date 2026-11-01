import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'
import { getCached, setCache, clearCache, getCacheKey } from './translate.cache'

describe('translate.cache', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.session._reset()
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('generates correct cache key with normalized text', () => {
    expect(getCacheKey('vi', '  Ubiquitous  World ')).toBe('cache:tr:vi:ubiquitous world')
  })

  it('returns null when entry does not exist in cache', async () => {
    const cached = await getCached('vi', 'ubiquitous')
    expect(cached).toBeNull()
  })

  it('sets and retrieves cached translation with normalized lookup', async () => {
    await setCache('vi', '  Ubiquitous ', {
      translation: 'có mặt ở khắp nơi',
      phonetic: '/juːˈbɪkwɪtəs/',
      partOfSpeech: 'adjective'
    })

    const cached = await getCached('vi', 'ubiquitous')
    expect(cached).toEqual({
      translation: 'có mặt ở khắp nơi',
      phonetic: '/juːˈbɪkwɪtəs/',
      partOfSpeech: 'adjective'
    })
  })

  it('evicts expired entry and returns null', async () => {
    vi.useFakeTimers()
    const now = 1_000_000
    vi.setSystemTime(now)

    await setCache('vi', 'resilience', { translation: 'kiên cường' })

    // Forward time past 24 hours (86_400_000 ms)
    vi.setSystemTime(now + 86_400_000 + 1)

    const cached = await getCached('vi', 'resilience')
    expect(cached).toBeNull()

    // Ensure expired key is removed from storage
    const raw = await chromeMock.storage.session.get('cache:tr:vi:resilience')
    expect(raw['cache:tr:vi:resilience']).toBeUndefined()
  })

  it('clears all translation cache entries without touching other keys', async () => {
    await chromeMock.storage.session.set({
      'cache:tr:vi:word1': { translation: 'từ 1' },
      'cache:tr:vi:word2': { translation: 'từ 2' },
      'other:key': { value: 123 }
    })

    await clearCache()

    const remaining = await chromeMock.storage.session.get(null)
    expect(remaining['cache:tr:vi:word1']).toBeUndefined()
    expect(remaining['cache:tr:vi:word2']).toBeUndefined()
    expect(remaining['other:key']).toEqual({ value: 123 })
  })
})
