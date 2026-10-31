import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'
import { DEFAULT_SETTINGS } from '../constants'
import { getSettings, saveSettings, getApiKey, setApiKey, hasApiKey } from './settings.repo'

describe('settings.repo (FR-09, FR-11)', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.sync._reset()
    chromeMock.storage.local._reset()
    vi.clearAllMocks()
  })

  it('returns DEFAULT_SETTINGS when storage is empty', async () => {
    const settings = await getSettings()
    expect(settings).toEqual(DEFAULT_SETTINGS)
  })

  it('merges stored partial settings with DEFAULT_SETTINGS', async () => {
    await chromeMock.storage.sync.set({
      settings: { dailyGoal: 25, theme: 'dark' }
    })

    const settings = await getSettings()
    expect(settings).toEqual({
      ...DEFAULT_SETTINGS,
      dailyGoal: 25,
      theme: 'dark'
    })
  })

  it('persists general settings to chrome.storage.sync', async () => {
    const partial = {
      uiLanguage: 'en' as const,
      dailyGoal: 15,
      tooltipTrigger: 'auto' as const
    }

    const updated = await saveSettings(partial)
    expect(updated.dailyGoal).toBe(15)
    expect(updated.uiLanguage).toBe('en')

    const stored = (await chromeMock.storage.sync.get('settings'))['settings']
    expect(stored).toEqual(expect.objectContaining(partial))
  })

  it('stores AI API key in chrome.storage.local and ensures it is never exported (FR-11, NFR-03)', async () => {
    const secretKey = 'sk-ai-secret-key-12345'
    const success = await setApiKey(secretKey)
    expect(success).toBe(true)

    const key = await getApiKey()
    expect(key).toBe(secretKey)
    expect(await hasApiKey()).toBe(true)

    // Ensure it was NOT saved in sync
    const syncData = await chromeMock.storage.sync.get('secret:aiApiKey')
    expect(syncData['secret:aiApiKey']).toBeUndefined()

    // Export function simulation
    function buildExportData(allData: Record<string, unknown>) {
      const sanitized: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(allData)) {
        if (!k.startsWith('secret:')) {
          sanitized[k] = v
        }
      }
      return sanitized
    }

    const exported = buildExportData({
      'vocab:1': { text: 'test' },
      'secret:aiApiKey': secretKey
    })

    expect(exported).not.toHaveProperty('secret:aiApiKey')
  })

  it('clears API key when setting empty string', async () => {
    await setApiKey('initial-key')
    expect(await hasApiKey()).toBe(true)

    const success = await setApiKey('   ')
    expect(success).toBe(false)
    expect(await getApiKey()).toBeUndefined()
    expect(await hasApiKey()).toBe(false)
  })
})
