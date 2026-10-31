import { handleTranslateWord } from './translate.handler'

export { handleTranslateWord } from './translate.handler'
export { translateWord, translateViaProvider } from './translate.client'
export { getCached, setCache, clearCache, getCacheKey } from './translate.cache'

export const translateHandlers = {
  TRANSLATE_WORD: handleTranslateWord
}
