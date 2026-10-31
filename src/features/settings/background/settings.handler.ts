import type { Response } from '@/shared/messaging'
import type { Settings, ApiKeyStatus } from '../types'
import type { GetSettingsMessage, UpdateSettingsMessage, SetApiKeyMessage, HasApiKeyMessage } from '../messages'
import { getSettings, saveSettings, setApiKey, hasApiKey } from './settings.repo'
import { validateSettingsUpdate, sanitizeSettingsUpdate } from './settings.service'

export async function handleGetSettings(message?: GetSettingsMessage): Promise<Response<Settings>> {
  void message
  try {
    const settings = await getSettings()
    return { ok: true, data: settings }
  } catch (err) {
    return {
      ok: false,
      error: {
        code: 'STORAGE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to read settings',
        retryable: true
      }
    }
  }
}

export async function handleUpdateSettings(message: UpdateSettingsMessage): Promise<Response<Settings>> {
  try {
    const validationError = validateSettingsUpdate(message.payload)
    if (validationError) {
      return {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: validationError }
      }
    }
    const sanitized = sanitizeSettingsUpdate(message.payload)
    const updated = await saveSettings(sanitized)
    return { ok: true, data: updated }
  } catch (err) {
    return {
      ok: false,
      error: {
        code: 'STORAGE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to save settings',
        retryable: true
      }
    }
  }
}

export async function handleSetApiKey(message: SetApiKeyMessage): Promise<Response<ApiKeyStatus>> {
  try {
    if (!message.payload || typeof message.payload.apiKey !== 'string') {
      return {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'apiKey must be a string' }
      }
    }
    const hasKey = await setApiKey(message.payload.apiKey)
    return { ok: true, data: { hasKey } }
  } catch (err) {
    return {
      ok: false,
      error: {
        code: 'STORAGE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to save API key',
        retryable: true
      }
    }
  }
}

export async function handleHasApiKey(message?: HasApiKeyMessage): Promise<Response<ApiKeyStatus>> {
  void message
  try {
    const has = await hasApiKey()
    return { ok: true, data: { hasKey: has } }
  } catch (err) {
    return {
      ok: false,
      error: {
        code: 'STORAGE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to check API key',
        retryable: true
      }
    }
  }
}
