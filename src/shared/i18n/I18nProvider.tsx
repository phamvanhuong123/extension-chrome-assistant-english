import { useEffect, useState, type ReactNode } from 'react'
import { I18nContext, type I18nContextValue } from './I18nContext'
import type { I18nInstance, SupportedLanguage } from './types'

export interface I18nProviderProps {
  i18n: I18nInstance
  children: ReactNode
}

export function I18nProvider({ i18n, children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(i18n.getLanguage())

  useEffect(() => {
    return i18n.subscribe((newLang) => {
      setLanguageState(newLang)
    })
  }, [i18n])

  const value: I18nContextValue = {
    t: i18n.t,
    language,
    setLanguage: i18n.setLanguage,
    i18n
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
