import type { Message } from '@/shared/messaging'
import type { Settings } from './types'

export type GetSettingsMessage = Message<'GET_SETTINGS'>
export type UpdateSettingsMessage = Message<'UPDATE_SETTINGS', Partial<Settings>>
export type SetApiKeyMessage = Message<'SET_API_KEY', { apiKey: string }>
export type HasApiKeyMessage = Message<'HAS_API_KEY'>

export type SettingsMessage = GetSettingsMessage | UpdateSettingsMessage | SetApiKeyMessage | HasApiKeyMessage
