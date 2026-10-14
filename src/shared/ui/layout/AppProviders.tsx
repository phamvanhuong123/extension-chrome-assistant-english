import type { ReactNode } from 'react'
import { I18nProvider, type I18nInstance } from '../../i18n'
import { ThemeProvider, type Theme } from '../theme'

export interface AppProvidersProps {
  i18n: I18nInstance
  initialTheme?: Theme
  onThemeChange?: (theme: Theme) => void
  targetElement?: HTMLElement | null
  children: ReactNode
}

export function AppProviders({
  i18n,
  initialTheme = 'system',
  onThemeChange,
  targetElement,
  children
}: AppProvidersProps) {
  return (
    <ThemeProvider initialTheme={initialTheme} onThemeChange={onThemeChange} targetElement={targetElement}>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    </ThemeProvider>
  )
}
