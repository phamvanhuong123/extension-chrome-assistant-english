import { describe, it, expect } from 'vitest'

interface Dictionary {
  [key: string]: string
}

function createI18n(dicts: { vi: Dictionary; en: Dictionary }, initialLang: 'vi' | 'en' = 'vi') {
  let currentLang = initialLang

  return {
    setLanguage: (lang: 'vi' | 'en') => {
      currentLang = lang
    },
    t: (key: string, params: Record<string, string | number> = {}): string => {
      const template = dicts[currentLang]?.[key] ?? dicts.en?.[key] ?? key
      return template.replace(/\{(\w+)\}/g, (_, p) => String(params[p] ?? `{${p}}`))
    }
  }
}

describe('createI18n (shared/i18n)', () => {
  const dicts = {
    vi: {
      'stats.streak': 'Chuỗi {count} ngày',
      'common.save': 'Lưu'
    },
    en: {
      'stats.streak': '{count}-day streak',
      'common.save': 'Save',
      'common.cancel': 'Cancel'
    }
  }

  it('translates with parameter replacement in Vietnamese (default)', () => {
    const i18n = createI18n(dicts, 'vi')
    expect(i18n.t('stats.streak', { count: 5 })).toBe('Chuỗi 5 ngày')
  })

  it('falls back to English when key is missing in Vietnamese dictionary', () => {
    const i18n = createI18n(dicts, 'vi')
    expect(i18n.t('common.cancel')).toBe('Cancel')
  })

  it('falls back to raw key if key does not exist in any dictionary', () => {
    const i18n = createI18n(dicts, 'vi')
    expect(i18n.t('unknown.key')).toBe('unknown.key')
  })

  it('updates translation dynamically when language is switched', () => {
    const i18n = createI18n(dicts, 'vi')
    expect(i18n.t('common.save')).toBe('Lưu')
    i18n.setLanguage('en')
    expect(i18n.t('common.save')).toBe('Save')
  })
})
