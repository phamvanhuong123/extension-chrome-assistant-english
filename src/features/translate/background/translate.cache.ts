import { sessionStore } from '@/shared/storage'
import { normalizeText } from '@/shared/utils'
import type { TranslationCacheEntry } from '../types'
import { CACHE_TTL_MS } from '../types'

export function getCacheKey(targetLang: string, text: string): string {
  return `cache:tr:${targetLang}:${normalizeText(text)}`
}

export async function getCached(
  targetLang: string,
  text: string
): Promise<Omit<TranslationCacheEntry, 'cachedAt' | 'ttlMs'> | null> {
  const key = getCacheKey(targetLang, text)
  const data = await sessionStore.get<TranslationCacheEntry>(key)
  const entry = data[key]
  if (!entry) return null

  if (Date.now() - entry.cachedAt > entry.ttlMs) {
    await sessionStore.remove(key)
    return null
  }

  return {
    translation: entry.translation,
    phonetic: entry.phonetic,
    partOfSpeech: entry.partOfSpeech
  }
}

export async function setCache(
  targetLang: string,
  text: string,
  data: { translation: string; phonetic?: string; partOfSpeech?: string }
): Promise<void> {
  const key = getCacheKey(targetLang, text)
  const entry: TranslationCacheEntry = {
    ...data,
    cachedAt: Date.now(),
    ttlMs: CACHE_TTL_MS
  }
  await sessionStore.set({ [key]: entry })
}

export async function clearCache(): Promise<void> {
  const allItems = await sessionStore.get<TranslationCacheEntry>(null)
  const cacheKeys = Object.keys(allItems).filter((k) => k.startsWith('cache:tr:'))
  if (cacheKeys.length > 0) {
    await sessionStore.remove(cacheKeys)
  }
}
