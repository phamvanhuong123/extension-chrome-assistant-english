import { describe, it, expect, vi } from 'vitest'

interface Message<P = unknown> {
  type: string
  payload?: P
}

type Handler = (payload: unknown) => Promise<unknown>

function createRouter(handlers: Record<string, Handler>) {
  return {
    listener: (message: Message, sender: { id?: string }, sendResponse: (response: unknown) => void) => {
      if (sender.id && sender.id !== 'valid-ext-id') {
        sendResponse({ ok: false, error: { code: 'UNAUTHORIZED_SENDER', message: 'Sender not allowed' } })
        return
      }

      const handler = handlers[message.type]
      if (!handler) {
        sendResponse({
          ok: false,
          error: { code: 'UNKNOWN_MESSAGE', message: `No handler registered for message type ${message.type}` }
        })
        return
      }

      handler(message.payload)
        .then((data) => sendResponse({ ok: true, data }))
        .catch((err) => sendResponse({ ok: false, error: err }))
    }
  }
}

describe('createRouter (shared/messaging)', () => {
  it('routes message to matching handler and returns ok response', async () => {
    const handler = vi.fn().mockResolvedValue({ id: 'word-1' })
    const router = createRouter({ SAVE_WORD: handler })
    const sendResponse = vi.fn()

    router.listener({ type: 'SAVE_WORD', payload: { text: 'test' } }, { id: 'valid-ext-id' }, sendResponse)
    await vi.waitFor(() => expect(sendResponse).toHaveBeenCalled())

    expect(sendResponse).toHaveBeenCalledWith({ ok: true, data: { id: 'word-1' } })
  })

  it('returns UNKNOWN_MESSAGE error for unregistered message type', () => {
    const router = createRouter({})
    const sendResponse = vi.fn()

    router.listener({ type: 'NON_EXISTENT_TYPE' }, { id: 'valid-ext-id' }, sendResponse)

    expect(sendResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: 'UNKNOWN_MESSAGE' })
      })
    )
  })

  it('rejects message when sender id is untrusted', () => {
    const router = createRouter({ TEST: vi.fn() })
    const sendResponse = vi.fn()

    router.listener({ type: 'TEST' }, { id: 'malicious-sender' }, sendResponse)

    expect(sendResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED_SENDER' })
      })
    )
  })
})
