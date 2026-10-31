import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRouter } from './createRouter'

describe('createRouter (shared/messaging)', () => {
  const originalChrome = globalThis.chrome

  beforeEach(() => {
    // Mock chrome.runtime.id
    globalThis.chrome = {
      runtime: {
        id: 'valid-ext-id'
      }
    } as unknown as typeof chrome
  })

  afterEach(() => {
    globalThis.chrome = originalChrome
    vi.restoreAllMocks()
  })

  it('routes message to matching handler and returns ok response', async () => {
    const handler = vi.fn().mockResolvedValue({ ok: true, data: { id: 'word-1' } })
    const router = createRouter({ SAVE_WORD: handler })
    const sendResponse = vi.fn()

    const result = router.listener(
      { type: 'SAVE_WORD', payload: { text: 'test' } },
      { id: 'valid-ext-id' } as chrome.runtime.MessageSender,
      sendResponse
    )

    expect(result).toBe(true)
    await vi.waitFor(() => expect(sendResponse).toHaveBeenCalled())
    expect(sendResponse).toHaveBeenCalledWith({ ok: true, data: { id: 'word-1' } })
    expect(handler).toHaveBeenCalledWith({ type: 'SAVE_WORD', payload: { text: 'test' } }, { id: 'valid-ext-id' })
  })

  it('returns UNKNOWN_MESSAGE error for unregistered message type', () => {
    const router = createRouter({})
    const sendResponse = vi.fn()

    const result = router.listener(
      { type: 'NON_EXISTENT_TYPE' },
      { id: 'valid-ext-id' } as chrome.runtime.MessageSender,
      sendResponse
    )

    expect(result).toBe(true)
    expect(sendResponse).toHaveBeenCalledWith({
      ok: false,
      error: {
        code: 'UNKNOWN_MESSAGE',
        message: 'No handler registered for message type NON_EXISTENT_TYPE'
      }
    })
  })

  it('rejects message when sender id is untrusted', () => {
    const handler = vi.fn()
    const router = createRouter({ TEST: handler })
    const sendResponse = vi.fn()

    const result = router.listener(
      { type: 'TEST' },
      { id: 'malicious-sender' } as chrome.runtime.MessageSender,
      sendResponse
    )

    expect(result).toBe(true)
    expect(sendResponse).toHaveBeenCalledWith({
      ok: false,
      error: {
        code: 'UNAUTHORIZED_SENDER',
        message: 'Sender not allowed'
      }
    })
    expect(handler).not.toHaveBeenCalled()
  })

  it('catches unhandled rejection in handler and returns UNKNOWN error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const handler = vi.fn().mockRejectedValue(new Error('Unexpected DB crash'))
    const router = createRouter({ CRASH: handler })
    const sendResponse = vi.fn()

    const result = router.listener(
      { type: 'CRASH' },
      { id: 'valid-ext-id' } as chrome.runtime.MessageSender,
      sendResponse
    )

    expect(result).toBe(true)
    await vi.waitFor(() => expect(sendResponse).toHaveBeenCalled())
    expect(sendResponse).toHaveBeenCalledWith({
      ok: false,
      error: {
        code: 'UNKNOWN',
        message: 'Internal error'
      }
    })
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
