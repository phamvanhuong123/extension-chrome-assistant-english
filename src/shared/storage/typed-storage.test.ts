import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'
import { localStore, syncStore, sessionStore } from './typed-storage'

describe('typed-storage (shared/storage)', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.local._reset()
    chromeMock.storage.sync._reset()
    chromeMock.storage.session._reset()
    vi.clearAllMocks()
  })

  describe('localStore', () => {
    it('sets and gets data correctly', async () => {
      await localStore.set({ key1: 'val1', key2: 123 })
      const res = await localStore.get<{ key1: string; key2: number }>(['key1', 'key2'])
      expect(res).toEqual({ key1: 'val1', key2: 123 })
    })

    it('removes keys correctly', async () => {
      await localStore.set({ toRemove: 'yes', keep: 'yes' })
      await localStore.remove(['toRemove'])
      const res = await localStore.get<string>(['toRemove', 'keep'])
      expect(res).toEqual({ keep: 'yes' })
    })
  })

  describe('syncStore', () => {
    it('sets and gets data across sync storage', async () => {
      await syncStore.set({ settings: { theme: 'dark' } })
      const res = await syncStore.get<{ settings: { theme: string } }>('settings')
      expect(res['settings']).toEqual({ theme: 'dark' })
    })

    it('removes keys correctly from sync', async () => {
      await syncStore.set({ keySync: 'value' })
      await syncStore.remove(['keySync'])
      const res = await syncStore.get('keySync')
      expect(res['keySync']).toBeUndefined()
    })
  })

  describe('sessionStore', () => {
    it('sets and gets data in session storage', async () => {
      await sessionStore.set({ 'cache:word': 'translation' })
      const res = await sessionStore.get<string>('cache:word')
      expect(res['cache:word']).toBe('translation')
    })

    it('removes keys correctly from session', async () => {
      await sessionStore.set({ sessionKey: 42 })
      await sessionStore.remove('sessionKey')
      const res = await sessionStore.get('sessionKey')
      expect(res['sessionKey']).toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('rejects when get operation fails', async () => {
      chromeMock.storage.local.get.mockRejectedValueOnce(new Error('Storage error occurred'))
      await expect(localStore.get('anyKey')).rejects.toThrow('Storage error occurred')
    })

    it('rejects when set operation fails', async () => {
      chromeMock.storage.sync.set.mockRejectedValueOnce(new Error('QuotaExceeded'))
      await expect(syncStore.set({ key: 'val' })).rejects.toThrow('QuotaExceeded')
    })

    it('rejects when remove operation fails', async () => {
      chromeMock.storage.local.remove.mockRejectedValueOnce(new Error('RemoveFailed'))
      await expect(localStore.remove('badKey')).rejects.toThrow('RemoveFailed')
    })
  })
})
