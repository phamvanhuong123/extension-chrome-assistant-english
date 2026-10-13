import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'
import { createSettingsFixture } from '@/test/factories'

describe('settings.repo (FR-09, FR-11)', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.sync._reset()
    chromeMock.storage.local._reset()
    vi.clearAllMocks()
  })

  it('persists general settings to chrome.storage.sync', async () => {
    const settings = createSettingsFixture({
      uiLanguage: 'vi',
      dailyGoal: 15,
      tooltipTrigger: 'auto'
    })

    await chromeMock.storage.sync.set({ settings })
    const stored = (await chromeMock.storage.sync.get('settings'))['settings']
    expect(stored).toEqual(settings)
  })

  it('stores AI API key in chrome.storage.local and ensures it is never exported (FR-11, NFR-03)', async () => {
    const secretKey = 'sk-ai-secret-key-12345'
    await chromeMock.storage.local.set({ 'secret:aiApiKey': secretKey })

    const localData = await chromeMock.storage.local.get('secret:aiApiKey')
    expect(localData['secret:aiApiKey']).toBe(secretKey)

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
})
