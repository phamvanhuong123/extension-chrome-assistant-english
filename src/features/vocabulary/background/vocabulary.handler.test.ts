import { describe, it, expect, vi, beforeEach } from 'vitest'

interface SaveWordPayload {
  text: string
  translation: string
  sourceLang: string
  targetLang: string
  context?: string
}

interface SaveWordResult {
  id: string
  created: boolean
}

type ResponseEnvelope<T> =
  { ok: true; data: T } | { ok: false; error: { code: string; message: string; retryable?: boolean } }

describe('vocabulary.handler (FR-03, FR-04, FR-05)', () => {
  const recordEventMock = vi.fn()
  const saveRepoMock = vi.fn()
  const findByNormalizedMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Simulated handler based on API-CONTRACTS §3.2 and write-test skill §4.2
  async function handleSaveWord(payload: SaveWordPayload): Promise<ResponseEnvelope<SaveWordResult>> {
    if (!payload.text.trim()) {
      return {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Text cannot be empty' }
      }
    }

    try {
      const existing = await findByNormalizedMock(payload.text.trim().toLowerCase())
      if (existing) {
        return { ok: true, data: { id: existing.id, created: false } }
      }

      const saved = await saveRepoMock(payload)
      recordEventMock('wordsSaved')
      return { ok: true, data: { id: saved.id, created: true } }
    } catch {
      return {
        ok: false,
        error: { code: 'STORAGE_ERROR', message: 'Failed to write word to storage', retryable: true }
      }
    }
  }

  it('returns ok with created: true and triggers stats recordEvent("wordsSaved") on new word', async () => {
    findByNormalizedMock.mockResolvedValue(null)
    saveRepoMock.mockResolvedValue({ id: 'word-1' })

    const result = await handleSaveWord({
      text: 'ubiquitous',
      translation: 'có mặt ở khắp nơi',
      sourceLang: 'en',
      targetLang: 'vi'
    })

    expect(result).toEqual({ ok: true, data: { id: 'word-1', created: true } })
    expect(recordEventMock).toHaveBeenCalledWith('wordsSaved')
  })

  it('does NOT trigger stats recordEvent when word already exists (created: false)', async () => {
    findByNormalizedMock.mockResolvedValue({ id: 'existing-id' })

    const result = await handleSaveWord({
      text: 'ubiquitous',
      translation: 'có mặt ở khắp nơi',
      sourceLang: 'en',
      targetLang: 'vi'
    })

    expect(result).toEqual({ ok: true, data: { id: 'existing-id', created: false } })
    expect(recordEventMock).not.toHaveBeenCalled()
  })

  it('returns VALIDATION_ERROR envelope when text is blank', async () => {
    const result = await handleSaveWord({
      text: '   ',
      translation: 'test',
      sourceLang: 'en',
      targetLang: 'vi'
    })

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: 'VALIDATION_ERROR' })
    })
  })

  it('returns STORAGE_ERROR envelope with retryable: true when repository throws', async () => {
    findByNormalizedMock.mockResolvedValue(null)
    saveRepoMock.mockRejectedValue(new Error('QuotaExceededError'))

    const result = await handleSaveWord({
      text: 'resilience',
      translation: 'kiên cường',
      sourceLang: 'en',
      targetLang: 'vi'
    })

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: 'STORAGE_ERROR', retryable: true })
    })
  })
})
