import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'
import { handleGetSettings, handleUpdateSettings, handleSetApiKey, handleHasApiKey } from './settings.handler'
import { DEFAULT_SETTINGS } from '../constants'

describe('settings.handler (FR-09, FR-11)', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.sync._reset()
    chromeMock.storage.local._reset()
    vi.clearAllMocks()
  })

  describe('handleGetSettings', () => {
    it('returns default settings when storage is empty', async () => {
      const res = await handleGetSettings({ type: 'GET_SETTINGS' })
      expect(res.ok).toBe(true)
      if (res.ok) {
        expect(res.data).toEqual(DEFAULT_SETTINGS)
      }
    })

    it('returns STORAGE_ERROR when storage read fails', async () => {
      chromeMock.storage.sync.get.mockRejectedValueOnce(new Error('Sync failed'))
      const res = await handleGetSettings({ type: 'GET_SETTINGS' })
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.error.code).toBe('STORAGE_ERROR')
        expect(res.error.retryable).toBe(true)
      }
    })
  })

  describe('handleUpdateSettings', () => {
    it('updates settings successfully with valid payload', async () => {
      const res = await handleUpdateSettings({
        type: 'UPDATE_SETTINGS',
        payload: { dailyGoal: 20, theme: 'dark', uiLanguage: 'vi' }
      })
      expect(res.ok).toBe(true)
      if (res.ok) {
        expect(res.data.dailyGoal).toBe(20)
        expect(res.data.theme).toBe('dark')
        expect(res.data.uiLanguage).toBe('vi')
      }
    })

    it('rejects invalid payload with VALIDATION_ERROR', async () => {
      const res = await handleUpdateSettings({
        type: 'UPDATE_SETTINGS',
        payload: { dailyGoal: -5 }
      })
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.error.code).toBe('VALIDATION_ERROR')
      }
    })

    it('rejects non-object payload with VALIDATION_ERROR', async () => {
      const res = await handleUpdateSettings({
        type: 'UPDATE_SETTINGS',
        payload: null as never
      })
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.error.code).toBe('VALIDATION_ERROR')
      }
    })

    it('returns STORAGE_ERROR when saving fails', async () => {
      chromeMock.storage.sync.set.mockRejectedValueOnce(new Error('QuotaExceeded'))
      const res = await handleUpdateSettings({
        type: 'UPDATE_SETTINGS',
        payload: { dailyGoal: 15 }
      })
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.error.code).toBe('STORAGE_ERROR')
      }
    })
  })

  describe('handleSetApiKey and handleHasApiKey', () => {
    it('saves and checks API key status correctly', async () => {
      const setRes = await handleSetApiKey({
        type: 'SET_API_KEY',
        payload: { apiKey: 'sk-test-ai-key' }
      })
      expect(setRes.ok).toBe(true)
      if (setRes.ok) {
        expect(setRes.data.hasKey).toBe(true)
      }

      const hasRes = await handleHasApiKey({ type: 'HAS_API_KEY' })
      expect(hasRes.ok).toBe(true)
      if (hasRes.ok) {
        expect(hasRes.data.hasKey).toBe(true)
      }
    })

    it('rejects invalid setApiKey payload', async () => {
      const res = await handleSetApiKey({
        type: 'SET_API_KEY',
        payload: { apiKey: 12345 as never }
      })
      expect(res.ok).toBe(false)
      if (!res.ok) {
        expect(res.error.code).toBe('VALIDATION_ERROR')
      }
    })
  })
})
