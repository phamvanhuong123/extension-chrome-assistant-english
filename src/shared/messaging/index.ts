import type { AnyMessage, Response } from './types'

export type { ErrorCode, Message, Response, AnyMessage, Handler, HandlerMap } from './types'
export { createRouter } from './createRouter'

const DEFAULT_TIMEOUT_MS = 10_000

export function sendMessage<TData = unknown, TMsg extends AnyMessage = AnyMessage>(
  message: TMsg,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response<TData>> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({
        ok: false,
        error: { code: 'TIMEOUT', message: 'Request timed out', retryable: true }
      })
    }, timeoutMs)

    chrome.runtime.sendMessage(message, (response) => {
      clearTimeout(timer)
      if (chrome.runtime.lastError) {
        const msg = chrome.runtime.lastError.message ?? ''
        const code = msg.includes('Extension context invalidated') ? 'CONTEXT_INVALIDATED' : 'UNKNOWN'
        resolve({ ok: false, error: { code, message: msg } })
        return
      }
      if (!response) {
        resolve({
          ok: false,
          error: { code: 'UNKNOWN', message: 'No response received' }
        })
        return
      }
      resolve(response as Response<TData>)
    })
  })
}
