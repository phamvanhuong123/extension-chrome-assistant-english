export type UiLanguage = 'vi' | 'en'
export type TooltipTrigger = 'auto' | 'icon'
export type ThemeMode = 'system' | 'light' | 'dark'
export type AiProvider = 'openai' | 'anthropic' | 'custom'

export interface Settings {
  sourceLang: string
  targetLang: string
  uiLanguage: UiLanguage
  aiEnabled: boolean
  aiProvider?: AiProvider
  tooltipTrigger: TooltipTrigger
  dailyGoal: number
  theme: ThemeMode
}

export interface ApiKeyStatus {
  hasKey: boolean
}
