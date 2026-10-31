import { syncStore, localStore } from '@/shared/storage'
import type { Settings } from '../types'
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, API_KEY_STORAGE_KEY } from '../constants'

export async function getSettings(): Promise<Settings> {
  const data = await syncStore.get<Settings>(SETTINGS_STORAGE_KEY)
  const stored = data[SETTINGS_STORAGE_KEY]
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) }
}

export async function saveSettings(partial: Partial<Settings>): Promise<Settings> {
  const current = await getSettings()
  const updated: Settings = { ...current, ...partial }
  await syncStore.set({ [SETTINGS_STORAGE_KEY]: updated })
  return updated
}

export async function getApiKey(): Promise<string | undefined> {
  const data = await localStore.get<string>(API_KEY_STORAGE_KEY)
  return data[API_KEY_STORAGE_KEY]
}

export async function setApiKey(apiKey: string): Promise<boolean> {
  const trimmed = apiKey.trim()
  if (!trimmed) {
    await localStore.remove([API_KEY_STORAGE_KEY])
    return false
  }
  await localStore.set({ [API_KEY_STORAGE_KEY]: trimmed })
  return true
}

export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey()
  return Boolean(key && key.length > 0)
}
