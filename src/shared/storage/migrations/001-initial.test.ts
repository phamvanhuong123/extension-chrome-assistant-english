import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'

interface Migration {
  version: number
  description: string
  up: () => Promise<void>
}

describe('Migration 001-initial (shared/storage/migrations)', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.local._reset()
    vi.clearAllMocks()
  })

  const initialMigration: Migration = {
    version: 1,
    description: 'Initial schema setup',
    up: async () => {
      const current = await chromeMock.storage.local.get('meta:schemaVersion')
      if (current['meta:schemaVersion'] == null) {
        await chromeMock.storage.local.set({ 'meta:schemaVersion': 1 })
      }
    }
  }

  it('sets meta:schemaVersion to 1 on initial setup', async () => {
    await initialMigration.up()
    const result = await chromeMock.storage.local.get('meta:schemaVersion')
    expect(result['meta:schemaVersion']).toBe(1)
  })

  it('is idempotent — running up() multiple times does not change schemaVersion', async () => {
    await initialMigration.up()
    await initialMigration.up()
    const result = await chromeMock.storage.local.get('meta:schemaVersion')
    expect(result['meta:schemaVersion']).toBe(1)
  })

  it('does not bump schemaVersion when storage set throws an error', async () => {
    chromeMock.storage.local.set.mockRejectedValueOnce(new Error('QuotaExceeded'))
    await expect(initialMigration.up()).rejects.toThrow('QuotaExceeded')

    const result = await chromeMock.storage.local.get('meta:schemaVersion')
    expect(result['meta:schemaVersion']).toBeUndefined()
  })
})
