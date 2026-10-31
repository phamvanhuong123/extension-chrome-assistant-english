import type { Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  sourceLang: 'en',
  targetLang: 'vi',
  uiLanguage: 'vi',
  aiEnabled: false,
  tooltipTrigger: 'auto',
  dailyGoal: 10,
  theme: 'system'
}

export const SETTINGS_STORAGE_KEY = 'settings'
export const API_KEY_STORAGE_KEY = 'secret:aiApiKey'
