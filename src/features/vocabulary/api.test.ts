import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveWord, listWords, getWordStatus, deleteWord } from './api'
import * as messaging from '@/shared/messaging'

vi.mock('@/shared/messaging')

describe('vocabulary.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saveWord sends SAVE_WORD message with payload', async () => {
    const mockRes = { ok: true as const, data: { id: 'w-1', created: true } }
    vi.mocked(messaging.sendMessage).mockResolvedValueOnce(mockRes)

    const payload = {
      text: 'hello',
      translation: 'xin chào',
      sourceLang: 'en',
      targetLang: 'vi'
    }

    const res = await saveWord(payload)
    expect(messaging.sendMessage).toHaveBeenCalledWith({
      type: 'SAVE_WORD',
      payload
    })
    expect(res).toEqual(mockRes)
  })

  it('listWords sends LIST_WORDS message with payload', async () => {
    const mockRes = { ok: true as const, data: { items: [], total: 0 } }
    vi.mocked(messaging.sendMessage).mockResolvedValueOnce(mockRes)

    const payload = { limit: 10, query: 'apple' }
    const res = await listWords(payload)
    expect(messaging.sendMessage).toHaveBeenCalledWith({
      type: 'LIST_WORDS',
      payload
    })
    expect(res).toEqual(mockRes)
  })

  it('getWordStatus sends GET_WORD_STATUS message with payload', async () => {
    const mockRes = { ok: true as const, data: { saved: true, id: 'w-1' } }
    vi.mocked(messaging.sendMessage).mockResolvedValueOnce(mockRes)

    const payload = { text: 'apple', targetLang: 'vi' }
    const res = await getWordStatus(payload)
    expect(messaging.sendMessage).toHaveBeenCalledWith({
      type: 'GET_WORD_STATUS',
      payload
    })
    expect(res).toEqual(mockRes)
  })

  it('deleteWord sends DELETE_WORD message with payload', async () => {
    const mockRes = { ok: true as const, data: { deleted: true } }
    vi.mocked(messaging.sendMessage).mockResolvedValueOnce(mockRes)

    const payload = { id: 'w-1' }
    const res = await deleteWord(payload)
    expect(messaging.sendMessage).toHaveBeenCalledWith({
      type: 'DELETE_WORD',
      payload
    })
    expect(res).toEqual(mockRes)
  })
})
