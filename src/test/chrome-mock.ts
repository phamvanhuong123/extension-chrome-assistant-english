import { vi } from 'vitest'

function createStorageMock() {
  const store: Record<string, unknown> = {}
  return {
    get: vi.fn((keys?: string | string[] | null) => {
      if (keys == null) return Promise.resolve({ ...store })
      const result: Record<string, unknown> = {}
      const keyList = typeof keys === 'string' ? [keys] : keys
      for (const k of keyList) {
        if (k in store) result[k] = store[k]
      }
      return Promise.resolve(result)
    }),
    set: vi.fn((items: Record<string, unknown>) => {
      Object.assign(store, items)
      return Promise.resolve()
    }),
    remove: vi.fn((keys: string | string[]) => {
      const keyList = typeof keys === 'string' ? [keys] : keys
      for (const k of keyList) delete store[k]
      return Promise.resolve()
    }),
    _store: store,
    _reset: () => {
      for (const k of Object.keys(store)) delete store[k]
    }
  }
}

export function createChromeMock() {
  return {
    storage: {
      local: createStorageMock(),
      sync: createStorageMock(),
      session: createStorageMock()
    },
    runtime: {
      id: typeof chrome !== 'undefined' && chrome?.runtime?.id ? chrome.runtime.id : 'test-ext-id',
      lastError: null,
      onInstalled: { addListener: vi.fn() },
      sendMessage: vi.fn(),
      onMessage: { addListener: vi.fn() }
    },
    alarms: {
      create: vi.fn(),
      onAlarm: { addListener: vi.fn() }
    }
  }
}
