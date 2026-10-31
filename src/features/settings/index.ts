export type { Settings, UiLanguage, ThemeMode, TooltipTrigger, AiProvider, ApiKeyStatus } from './types'

export { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, API_KEY_STORAGE_KEY } from './constants'

export type {
  GetSettingsMessage,
  UpdateSettingsMessage,
  SetApiKeyMessage,
  HasApiKeyMessage,
  SettingsMessage
} from './messages'

export { getSettings, updateSettings, setApiKey, hasApiKey } from './api'

export { vi as settingsVi } from './locales/vi'
export { en as settingsEn } from './locales/en'
