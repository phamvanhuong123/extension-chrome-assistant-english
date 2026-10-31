import { sendMessage, type Response } from '@/shared/messaging'
import type { Settings, ApiKeyStatus } from './types'

export const getSettings = (): Promise<Response<Settings>> => sendMessage<Settings>({ type: 'GET_SETTINGS' })

export const updateSettings = (partial: Partial<Settings>): Promise<Response<Settings>> =>
  sendMessage<Settings>({ type: 'UPDATE_SETTINGS', payload: partial })

export const setApiKey = (apiKey: string): Promise<Response<ApiKeyStatus>> =>
  sendMessage<ApiKeyStatus>({ type: 'SET_API_KEY', payload: { apiKey } })

export const hasApiKey = (): Promise<Response<ApiKeyStatus>> => sendMessage<ApiKeyStatus>({ type: 'HAS_API_KEY' })
