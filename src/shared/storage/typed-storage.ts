async function wrapGet<T>(
  area: chrome.storage.StorageArea,
  keys: string | string[] | null
): Promise<Record<string, T>> {
  const items = await area.get(keys)
  return (items ?? {}) as Record<string, T>
}

async function wrapSet(area: chrome.storage.StorageArea, items: Record<string, unknown>): Promise<void> {
  await area.set(items)
}

async function wrapRemove(area: chrome.storage.StorageArea, keys: string | string[]): Promise<void> {
  await area.remove(keys)
}

export const localStore = {
  get: <T>(keys: string | string[] | null): Promise<Record<string, T>> => wrapGet<T>(chrome.storage.local, keys),
  set: (items: Record<string, unknown>): Promise<void> => wrapSet(chrome.storage.local, items),
  remove: (keys: string | string[]): Promise<void> => wrapRemove(chrome.storage.local, keys)
}

export const syncStore = {
  get: <T>(keys: string | string[] | null): Promise<Record<string, T>> => wrapGet<T>(chrome.storage.sync, keys),
  set: (items: Record<string, unknown>): Promise<void> => wrapSet(chrome.storage.sync, items),
  remove: (keys: string | string[]): Promise<void> => wrapRemove(chrome.storage.sync, keys)
}

export const sessionStore = {
  get: <T>(keys: string | string[] | null): Promise<Record<string, T>> => wrapGet<T>(chrome.storage.session, keys),
  set: (items: Record<string, unknown>): Promise<void> => wrapSet(chrome.storage.session, items),
  remove: (keys: string | string[]): Promise<void> => wrapRemove(chrome.storage.session, keys)
}
