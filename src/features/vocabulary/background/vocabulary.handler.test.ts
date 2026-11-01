import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'
import * as statsModule from '@/features/stats/background'
import { handleSaveWord, handleListWords, handleGetWordStatus, handleDeleteWord } from './vocabulary.handler'
import * as repoModule from './vocabulary.repo'

describe('vocabulary.handler (FR-03, FR-04, FR-05)', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.local._reset()
    vi.clearAllMocks()
  })

  describe('handleSaveWord', () => {
    it('returns ok with created: true and triggers stats recordEvent("wordsSaved") on new word', async () => {
      const recordEventSpy = vi.spyOn(statsModule, 'recordEvent').mockResolvedValue(undefined)

      const result = await handleSaveWord({
        type: 'SAVE_WORD',
        payload: {
          text: 'ubiquitous',
          translation: 'có mặt ở khắp nơi',
          sourceLang: 'en',
          targetLang: 'vi'
        }
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.data.created).toBe(true)
        expect(result.data.id).toBeDefined()
      }
      expect(recordEventSpy).toHaveBeenCalledWith('wordsSaved')
    })

    it('does NOT trigger stats recordEvent when word already exists (created: false)', async () => {
      const recordEventSpy = vi.spyOn(statsModule, 'recordEvent').mockResolvedValue(undefined)

      // First save
      await handleSaveWord({
        type: 'SAVE_WORD',
        payload: {
          text: 'ubiquitous',
          translation: 'có mặt ở khắp nơi',
          sourceLang: 'en',
          targetLang: 'vi'
        }
      })
      expect(recordEventSpy).toHaveBeenCalledTimes(1)
      recordEventSpy.mockClear()

      // Duplicate save
      const secondResult = await handleSaveWord({
        type: 'SAVE_WORD',
        payload: {
          text: 'Ubiquitous',
          translation: 'có mặt ở khắp mọi nơi',
          sourceLang: 'en',
          targetLang: 'vi'
        }
      })

      expect(secondResult.ok).toBe(true)
      if (secondResult.ok) {
        expect(secondResult.data.created).toBe(false)
      }
      expect(recordEventSpy).not.toHaveBeenCalled()
    })

    it('returns VALIDATION_ERROR envelope when text is blank or invalid', async () => {
      const result = await handleSaveWord({
        type: 'SAVE_WORD',
        payload: {
          text: '   ',
          translation: 'test',
          sourceLang: 'en',
          targetLang: 'vi'
        }
      })

      expect(result).toEqual({
        ok: false,
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' })
      })
    })

    it('returns STORAGE_ERROR envelope with retryable: true when repository throws', async () => {
      vi.spyOn(repoModule, 'saveWord').mockRejectedValueOnce(new Error('QuotaExceededError'))

      const result = await handleSaveWord({
        type: 'SAVE_WORD',
        payload: {
          text: 'resilience',
          translation: 'kiên cường',
          sourceLang: 'en',
          targetLang: 'vi'
        }
      })

      expect(result).toEqual({
        ok: false,
        error: expect.objectContaining({ code: 'STORAGE_ERROR', retryable: true })
      })
    })
  })

  describe('handleListWords', () => {
    it('returns list of words and total count', async () => {
      await handleSaveWord({
        type: 'SAVE_WORD',
        payload: { text: 'one', translation: 'một', sourceLang: 'en', targetLang: 'vi' }
      })

      const res = await handleListWords({
        type: 'LIST_WORDS',
        payload: { limit: 10 }
      })

      expect(res.ok).toBe(true)
      if (res.ok) {
        expect(res.data.total).toBe(1)
        expect(res.data.items[0].text).toBe('one')
      }
    })

    it('returns VALIDATION_ERROR for invalid list options', async () => {
      const res = await handleListWords({
        type: 'LIST_WORDS',
        payload: { limit: -1 }
      })

      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.error.code).toBe('VALIDATION_ERROR')
      }
    })
  })

  describe('handleGetWordStatus', () => {
    it('returns saved: true for saved words and false for unsaved words', async () => {
      await handleSaveWord({
        type: 'SAVE_WORD',
        payload: { text: 'hello', translation: 'xin chào', sourceLang: 'en', targetLang: 'vi' }
      })

      const statusTrue = await handleGetWordStatus({
        type: 'GET_WORD_STATUS',
        payload: { text: 'hello', targetLang: 'vi' }
      })
      expect(statusTrue).toEqual({
        ok: true,
        data: expect.objectContaining({ saved: true, id: expect.any(String) })
      })

      const statusFalse = await handleGetWordStatus({
        type: 'GET_WORD_STATUS',
        payload: { text: 'bye', targetLang: 'vi' }
      })
      expect(statusFalse).toEqual({
        ok: true,
        data: { saved: false }
      })
    })

    it('returns VALIDATION_ERROR for empty input', async () => {
      const res = await handleGetWordStatus({
        type: 'GET_WORD_STATUS',
        payload: { text: '', targetLang: 'vi' }
      })
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.error.code).toBe('VALIDATION_ERROR')
      }
    })
  })

  describe('handleDeleteWord', () => {
    it('returns deleted: true for existing word', async () => {
      const saveRes = await handleSaveWord({
        type: 'SAVE_WORD',
        payload: { text: 'temp', translation: 'tạm', sourceLang: 'en', targetLang: 'vi' }
      })
      const id = (saveRes as { ok: true; data: { id: string } }).data.id

      const deleteRes = await handleDeleteWord({
        type: 'DELETE_WORD',
        payload: { id }
      })

      expect(deleteRes).toEqual({
        ok: true,
        data: { deleted: true }
      })
    })

    it('returns NOT_FOUND for non-existent word', async () => {
      const deleteRes = await handleDeleteWord({
        type: 'DELETE_WORD',
        payload: { id: 'non-existent' }
      })

      expect(deleteRes).toEqual({
        ok: false,
        error: expect.objectContaining({ code: 'NOT_FOUND' })
      })
    })

    it('returns VALIDATION_ERROR for empty id', async () => {
      const deleteRes = await handleDeleteWord({
        type: 'DELETE_WORD',
        payload: { id: '' }
      })

      expect(deleteRes.ok).toBe(false)
      if (!deleteRes.ok) {
        expect(deleteRes.error.code).toBe('VALIDATION_ERROR')
      }
    })
  })
})
