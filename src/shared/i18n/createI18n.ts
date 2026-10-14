import type { Dictionaries, I18nInstance, SupportedLanguage, TranslationParams } from './types'

export function createI18n(dicts: Dictionaries, initialLang: SupportedLanguage = 'vi'): I18nInstance {
  let currentLang: SupportedLanguage = initialLang
  const listeners = new Set<(lang: SupportedLanguage) => void>()

  const t = (key: string, params: TranslationParams = {}): string => {
    const template = dicts[currentLang]?.[key] ?? dicts.en?.[key] ?? key
    return template.replace(/\{(\w+)\}/g, (_, p) => String(params[p] ?? `{${p}}`))
  }

  const getLanguage = (): SupportedLanguage => currentLang

  const setLanguage = (lang: SupportedLanguage): void => {
    if (currentLang !== lang) {
      currentLang = lang
      listeners.forEach((listener) => listener(currentLang))
    }
  }

  const subscribe = (listener: (lang: SupportedLanguage) => void): (() => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  return {
    t,
    getLanguage,
    setLanguage,
    subscribe
  }
}
