import { describe, it, expect, vi, beforeEach } from 'vitest'
import { translateWord } from './api'
import * as messaging from '@/shared/messaging'

vi.mock('@/shared/messaging')

describe('translate.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends TRANSLATE_WORD message with provided payload', async () => {
    const mockResponse = {
      ok: true as const,
      data: {
        translation: 'bền bỉ',
        cached: false
      }
    }
    vi.mocked(messaging.sendMessage).mockResolvedValueOnce(mockResponse)

    const payload = {
      text: 'tenacity',
      sourceLang: 'en',
      targetLang: 'vi'
    }

    const res = await translateWord(payload)
    expect(messaging.sendMessage).toHaveBeenCalledWith({
      type: 'TRANSLATE_WORD',
      payload
    })
    expect(res).toEqual(mockResponse)
  })
})

