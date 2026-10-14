import { createContext } from 'react'
import type { I18nInstance, SupportedLanguage, TranslateFn } from './types'

export interface I18nContextValue {
  t: TranslateFn
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  i18n: I18nInstance
}

export const I18nContext = createContext<I18nContextValue | null>(null)
