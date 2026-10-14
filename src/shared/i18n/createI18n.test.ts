import { describe, it, expect } from 'vitest'
import { createI18n } from './createI18n'

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

  it('notifies subscribers when language changes', () => {
    const i18n = createI18n(dicts, 'vi')
    let observedLang = ''
    const unsubscribe = i18n.subscribe((lang) => {
      observedLang = lang
    })

    i18n.setLanguage('en')
    expect(observedLang).toBe('en')

    unsubscribe()
    i18n.setLanguage('vi')
    expect(observedLang).toBe('en') // Should not change after unsubscribe
  })
})
