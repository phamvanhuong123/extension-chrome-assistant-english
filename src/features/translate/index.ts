export type { TranslationResult, TranslationCacheEntry, TranslateParams } from './types'
export {
  CACHE_TTL_MS,
  MAX_INPUT_CHARS,
  MAX_WORDS,
  TRANSLATE_TIMEOUT_MS,
  MAX_RETRIES,
  RETRY_BACKOFF_BASE_MS,
  DEFAULT_SOURCE_LANG,
  DEFAULT_TARGET_LANG
} from './types'

export type { TranslateWordPayload, TranslateWordMessage, TranslateMessage } from './messages'

export { translateWord } from './api'

export { vi as translateVi } from './locales/vi'
export { en as translateEn } from './locales/en'
