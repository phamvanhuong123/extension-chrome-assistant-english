import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { createI18n } from './createI18n'
import { I18nProvider } from './I18nProvider'
import { useT } from './useT'
import type { ReactNode } from 'react'

describe('I18nContext (shared/i18n)', () => {
  const dicts = {
    vi: {
      'btn.save': 'Lưu'
    },
    en: {
      'btn.save': 'Save'
    }
  }

  it('provides t and language to child components', () => {
    const i18n = createI18n(dicts, 'vi')
    const wrapper = ({ children }: { children: ReactNode }) => <I18nProvider i18n={i18n}>{children}</I18nProvider>

    const { result } = renderHook(() => useT(), { wrapper })
    expect(result.current.language).toBe('vi')
    expect(result.current.t('btn.save')).toBe('Lưu')

    act(() => {
      result.current.setLanguage('en')
    })

    expect(result.current.language).toBe('en')
    expect(result.current.t('btn.save')).toBe('Save')
  })

  it('throws an error if useT is used outside I18nProvider', () => {
    expect(() => {
      renderHook(() => useT())
    }).toThrow('useT must be used within an I18nProvider')
  })
})
