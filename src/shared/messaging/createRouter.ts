import type { HandlerMap, Response } from './types'

export function createRouter(handlers: HandlerMap) {
  const listener = (
    message: { type: string; payload?: unknown },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: Response<unknown>) => void
  ): true => {
    const extId = typeof chrome !== 'undefined' && chrome.runtime?.id ? chrome.runtime.id : undefined
    if (sender?.id && extId && sender.id !== extId) {
      sendResponse({
        ok: false,
        error: { code: 'UNAUTHORIZED_SENDER', message: 'Sender not allowed' }
      })
      return true
    }

    const handler = handlers[message?.type]
    if (!handler) {
      sendResponse({
        ok: false,
        error: { code: 'UNKNOWN_MESSAGE', message: `No handler registered for message type ${message?.type}` }
      })
      return true
    }

    handler(message, sender)
      .then((res) => {
        sendResponse(res)
      })
      .catch((err: unknown) => {
        console.error(`[router] Uncaught error in handler ${message?.type}:`, err)
        sendResponse({
          ok: false,
          error: { code: 'UNKNOWN', message: 'Internal error' }
        })
      })

    return true
  }

  return { listener }
}
