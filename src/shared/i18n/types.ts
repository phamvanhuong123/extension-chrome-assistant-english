export type SupportedLanguage = 'vi' | 'en'

export type Dictionary = Record<string, string>

export interface Dictionaries {
  vi: Dictionary
  en: Dictionary
}

export type TranslationParams = Record<string, string | number>

export type TranslateFn = (key: string, params?: TranslationParams) => string

export interface I18nInstance {
  t: TranslateFn
  getLanguage: () => SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  subscribe: (listener: (lang: SupportedLanguage) => void) => () => void
}
