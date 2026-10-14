import { useContext } from 'react'
import { I18nContext } from './I18nContext'
import type { SupportedLanguage, TranslateFn } from './types'

export function useT(): {
  t: TranslateFn
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
} {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useT must be used within an I18nProvider')
  }
  return {
    t: context.t,
    language: context.language,
    setLanguage: context.setLanguage
  }
}
