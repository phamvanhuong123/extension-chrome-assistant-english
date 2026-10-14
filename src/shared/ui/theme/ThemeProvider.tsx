import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext } from './ThemeContext'
import type { ResolvedTheme, Theme, ThemeContextValue } from './types'

export interface ThemeProviderProps {
  initialTheme?: Theme
  onThemeChange?: (theme: Theme) => void
  targetElement?: HTMLElement | null
  children: ReactNode
}

const STORAGE_KEY = 'era_theme'

function getStoredTheme(defaultTheme: Theme): Theme {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved
    }
  }
  return defaultTheme
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export function ThemeProvider({ initialTheme = 'system', onThemeChange, targetElement, children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme(initialTheme))
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    const el = targetElement ?? (typeof document !== 'undefined' ? document.documentElement : null)
    if (!el) return

    if (resolvedTheme === 'dark') {
      el.setAttribute('data-theme', 'dark')
    } else {
      el.removeAttribute('data-theme')
    }
  }, [resolvedTheme, targetElement])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, newTheme)
    }
    onThemeChange?.(newTheme)
  }

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
