import { describe, it, expect } from 'vitest'
import {
  validateSaveWordInput,
  validateListWordsInput,
  validateGetWordStatusInput,
  validateDeleteWordInput,
  filterAndSortWords
} from './vocabulary.service'
import { createWordFixture } from '@/test/factories'

describe('vocabulary.service', () => {
  describe('validateSaveWordInput', () => {
    it('returns null for valid input', () => {
      const valid = {
        text: 'hello',
        translation: 'xin chào',
        sourceLang: 'en',
        targetLang: 'vi',
        context: 'Hello world'
      }
      expect(validateSaveWordInput(valid)).toBeNull()
    })

    it('returns VALIDATION_ERROR for non-object or null', () => {
      expect(validateSaveWordInput(null)).toBe('VALIDATION_ERROR')
      expect(validateSaveWordInput('hello')).toBe('VALIDATION_ERROR')
      expect(validateSaveWordInput(undefined)).toBe('VALIDATION_ERROR')
    })

    it('returns VALIDATION_ERROR for empty or whitespace text', () => {
      expect(validateSaveWordInput({ text: '', translation: 'test', sourceLang: 'en', targetLang: 'vi' })).toBe(
        'VALIDATION_ERROR'
      )
      expect(validateSaveWordInput({ text: '   ', translation: 'test', sourceLang: 'en', targetLang: 'vi' })).toBe(
        'VALIDATION_ERROR'
      )
    })

    it('returns VALIDATION_ERROR for text exceeding 100 characters', () => {
      expect(
        validateSaveWordInput({
          text: 'a'.repeat(101),
          translation: 'test',
          sourceLang: 'en',
          targetLang: 'vi'
        })
      ).toBe('VALIDATION_ERROR')
    })

    it('returns VALIDATION_ERROR for empty or whitespace translation', () => {
      expect(validateSaveWordInput({ text: 'hello', translation: '', sourceLang: 'en', targetLang: 'vi' })).toBe(
        'VALIDATION_ERROR'
      )
      expect(validateSaveWordInput({ text: 'hello', translation: '   ', sourceLang: 'en', targetLang: 'vi' })).toBe(
        'VALIDATION_ERROR'
      )
    })

    it('returns VALIDATION_ERROR for translation exceeding 500 characters', () => {
      expect(
        validateSaveWordInput({
          text: 'hello',
          translation: 'b'.repeat(501),
          sourceLang: 'en',
          targetLang: 'vi'
        })
      ).toBe('VALIDATION_ERROR')
    })

    it('returns VALIDATION_ERROR for context exceeding 500 characters', () => {
      expect(
        validateSaveWordInput({
          text: 'hello',
          translation: 'xin chào',
          context: 'c'.repeat(501),
          sourceLang: 'en',
          targetLang: 'vi'
        })
      ).toBe('VALIDATION_ERROR')
    })

    it('returns VALIDATION_ERROR when sourceLang or targetLang is missing', () => {
      expect(validateSaveWordInput({ text: 'hello', translation: 'test', targetLang: 'vi' })).toBe('VALIDATION_ERROR')
      expect(validateSaveWordInput({ text: 'hello', translation: 'test', sourceLang: 'en' })).toBe('VALIDATION_ERROR')
    })
  })

  describe('validateListWordsInput', () => {
    it('returns null for undefined or null input', () => {
      expect(validateListWordsInput(undefined)).toBeNull()
      expect(validateListWordsInput(null)).toBeNull()
      expect(validateListWordsInput({})).toBeNull()
    })

    it('returns null for valid payload', () => {
      expect(validateListWordsInput({ limit: 10, sort: 'createdAt', order: 'desc' })).toBeNull()
      expect(validateListWordsInput({ sort: 'text', order: 'asc' })).toBeNull()
    })

    it('returns VALIDATION_ERROR for non-positive or non-integer limit', () => {
      expect(validateListWordsInput({ limit: 0 })).toBe('VALIDATION_ERROR')
      expect(validateListWordsInput({ limit: -5 })).toBe('VALIDATION_ERROR')
      expect(validateListWordsInput({ limit: 3.5 })).toBe('VALIDATION_ERROR')
    })

    it('returns VALIDATION_ERROR for invalid sort or order', () => {
      expect(validateListWordsInput({ sort: 'invalid' as never })).toBe('VALIDATION_ERROR')
      expect(validateListWordsInput({ order: 'invalid' as never })).toBe('VALIDATION_ERROR')
    })
  })

  describe('validateGetWordStatusInput', () => {
    it('returns null for valid payload', () => {
      expect(validateGetWordStatusInput({ text: 'apple', targetLang: 'vi' })).toBeNull()
    })

    it('returns VALIDATION_ERROR for empty text or targetLang', () => {
      expect(validateGetWordStatusInput({ text: '', targetLang: 'vi' })).toBe('VALIDATION_ERROR')
      expect(validateGetWordStatusInput({ text: 'apple', targetLang: '  ' })).toBe('VALIDATION_ERROR')
      expect(validateGetWordStatusInput(null)).toBe('VALIDATION_ERROR')
    })
  })

  describe('validateDeleteWordInput', () => {
    it('returns null for valid payload', () => {
      expect(validateDeleteWordInput({ id: 'w-101' })).toBeNull()
    })

    it('returns VALIDATION_ERROR for empty id or null', () => {
      expect(validateDeleteWordInput({ id: '' })).toBe('VALIDATION_ERROR')
      expect(validateDeleteWordInput({ id: '   ' })).toBe('VALIDATION_ERROR')
      expect(validateDeleteWordInput(null)).toBe('VALIDATION_ERROR')
    })
  })

  describe('filterAndSortWords', () => {
    const word1 = createWordFixture({ id: '1', text: 'Apple', translation: 'Quả táo', createdAt: 1000 })
    const word2 = createWordFixture({ id: '2', text: 'Banana', translation: 'Quả chuối', createdAt: 2000 })
    const word3 = createWordFixture({ id: '3', text: 'Cherry', translation: 'Quả anh đào', createdAt: 3000 })
    const sampleWords = [word1, word2, word3]

    it('defaults to sort by createdAt descending', () => {
      const res = filterAndSortWords(sampleWords)
      expect(res.total).toBe(3)
      expect(res.items.map((w) => w.id)).toEqual(['3', '2', '1'])
    })

    it('filters by query matching text case-insensitively', () => {
      const res = filterAndSortWords(sampleWords, { query: 'ban' })
      expect(res.total).toBe(1)
      expect(res.items[0].id).toBe('2')
    })

    it('filters by query matching translation case-insensitively', () => {
      const res = filterAndSortWords(sampleWords, { query: 'anh đào' })
      expect(res.total).toBe(1)
      expect(res.items[0].id).toBe('3')
    })

    it('sorts by text ascending and descending', () => {
      const ascRes = filterAndSortWords(sampleWords, { sort: 'text', order: 'asc' })
      expect(ascRes.items.map((w) => w.text)).toEqual(['Apple', 'Banana', 'Cherry'])

      const descRes = filterAndSortWords(sampleWords, { sort: 'text', order: 'desc' })
      expect(descRes.items.map((w) => w.text)).toEqual(['Cherry', 'Banana', 'Apple'])
    })

    it('paginates with limit and cursor', () => {
      const page1 = filterAndSortWords(sampleWords, { limit: 2, cursor: '0' })
      expect(page1.items.length).toBe(2)
      expect(page1.nextCursor).toBe('2')

      const page2 = filterAndSortWords(sampleWords, { limit: 2, cursor: '2' })
      expect(page2.items.length).toBe(1)
      expect(page2.nextCursor).toBeUndefined()
    })
  })
})
