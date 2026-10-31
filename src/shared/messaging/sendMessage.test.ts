import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendMessage } from './index'

describe('sendMessage (shared/messaging)', () => {
  const originalChrome = globalThis.chrome

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    globalThis.chrome = originalChrome
    vi.restoreAllMocks()
  })

  it('resolves successfully with response data', async () => {
    const mockResponse = { ok: true, data: { id: 'word-123' } }
    globalThis.chrome = {
      runtime: {
        sendMessage: vi.fn((_msg: unknown, callback: (res: unknown) => void) => {
          callback(mockResponse)
        }),
        lastError: undefined
      }
    } as unknown as typeof chrome

    const promise = sendMessage({ type: 'GET_WORD', payload: { id: 'word-123' } })
    const res = await promise

    expect(res).toEqual(mockResponse)
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: 'GET_WORD', payload: { id: 'word-123' } },
      expect.any(Function)
    )
  })

  it('times out and returns TIMEOUT error with retryable: true', async () => {
    globalThis.chrome = {
      runtime: {
        sendMessage: vi.fn(),
        lastError: undefined
      }
    } as unknown as typeof chrome

    const promise = sendMessage({ type: 'SLOW_REQUEST' })
    vi.advanceTimersByTime(10_000)

    const res = await promise
    expect(res).toEqual({
      ok: false,
      error: { code: 'TIMEOUT', message: 'Request timed out', retryable: true }
    })
  })

  it('respects custom timeoutMs parameter', async () => {
    globalThis.chrome = {
      runtime: {
        sendMessage: vi.fn(),
        lastError: undefined
      }
    } as unknown as typeof chrome

    const promise = sendMessage({ type: 'CUSTOM_TIMEOUT' }, 3_000)
    vi.advanceTimersByTime(3_000)

    const res = await promise
    expect(res).toEqual({
      ok: false,
      error: { code: 'TIMEOUT', message: 'Request timed out', retryable: true }
    })
  })

  it('maps "Extension context invalidated" to CONTEXT_INVALIDATED', async () => {
    const mockRuntime = {
      sendMessage: vi.fn((_msg: unknown, callback: (res: unknown) => void) => {
        mockRuntime.lastError = { message: 'Extension context invalidated.' }
        callback(undefined)
      }),
      lastError: undefined as { message?: string } | undefined
    }

    globalThis.chrome = {
      runtime: mockRuntime
    } as unknown as typeof chrome

    const res = await sendMessage({ type: 'ANY_MSG' })
    expect(res).toEqual({
      ok: false,
      error: {
        code: 'CONTEXT_INVALIDATED',
        message: 'Extension context invalidated.'
      }
    })
  })

  it('maps generic chrome.runtime.lastError to UNKNOWN', async () => {
    const mockRuntime = {
      sendMessage: vi.fn((_msg: unknown, callback: (res: unknown) => void) => {
        mockRuntime.lastError = { message: 'Could not establish connection. Receiving end does not exist.' }
        callback(undefined)
      }),
      lastError: undefined as { message?: string } | undefined
    }

    globalThis.chrome = {
      runtime: mockRuntime
    } as unknown as typeof chrome

    const res = await sendMessage({ type: 'ANY_MSG' })
    expect(res).toEqual({
      ok: false,
      error: {
        code: 'UNKNOWN',
        message: 'Could not establish connection. Receiving end does not exist.'
      }
    })
  })

  it('handles empty response by returning UNKNOWN error', async () => {
    globalThis.chrome = {
      runtime: {
        sendMessage: vi.fn((_msg: unknown, callback: (res: unknown) => void) => {
          callback(undefined)
        }),
        lastError: undefined
      }
    } as unknown as typeof chrome

    const res = await sendMessage({ type: 'ANY_MSG' })
    expect(res).toEqual({
      ok: false,
      error: {
        code: 'UNKNOWN',
        message: 'No response received'
      }
    })
  })

  it('clears timeout timer when response succeeds before timeout', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    globalThis.chrome = {
      runtime: {
        sendMessage: vi.fn((_msg: unknown, callback: (res: unknown) => void) => {
          callback({ ok: true, data: 'fast' })
        }),
        lastError: undefined
      }
    } as unknown as typeof chrome

    const res = await sendMessage({ type: 'FAST_MSG' })
    expect(res).toEqual({ ok: true, data: 'fast' })
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
