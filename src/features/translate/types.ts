export interface TranslationResult {
  translation: string
  phonetic?: string
  partOfSpeech?: string
  cached: boolean
}

export interface TranslationCacheEntry {
  translation: string
  phonetic?: string
  partOfSpeech?: string
  cachedAt: number
  ttlMs: number
}

export interface TranslateParams {
  text: string
  sourceLang?: string
  targetLang?: string
}

export const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
export const MAX_INPUT_CHARS = 100
export const MAX_WORDS = 5
export const TRANSLATE_TIMEOUT_MS = 8_000
export const MAX_RETRIES = 2
export const RETRY_BACKOFF_BASE_MS = 300
export const DEFAULT_SOURCE_LANG = 'en'
export const DEFAULT_TARGET_LANG = 'vi'
