import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ThemeProvider } from './ThemeProvider'
import { useTheme } from './useTheme'
import type { ReactNode } from 'react'

describe('ThemeContext (shared/ui/theme)', () => {
  let target: HTMLElement

  beforeEach(() => {
    target = document.createElement('div')
    document.body.appendChild(target)
  })

  afterEach(() => {
    document.body.removeChild(target)
    vi.restoreAllMocks()
  })

  it('defaults to system/light and sets attribute accordingly', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider initialTheme='light' targetElement={target}>
        {children}
      </ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
    expect(result.current.resolvedTheme).toBe('light')
    expect(target.getAttribute('data-theme')).toBeNull()
  })

  it('applies data-theme="dark" when dark theme is selected', () => {
    const onThemeChange = vi.fn()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider initialTheme='light' onThemeChange={onThemeChange} targetElement={target}>
        {children}
      </ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(target.getAttribute('data-theme')).toBe('dark')
    expect(onThemeChange).toHaveBeenCalledWith('dark')
  })

  it('throws an error if useTheme is used outside ThemeProvider', () => {
    expect(() => {
      renderHook(() => useTheme())
    }).toThrow('useTheme must be used within a ThemeProvider')
  })
})
