import type { Settings } from '../types'

export function validateSettingsUpdate(partial: Partial<Settings>): string | null {
  if (partial == null || typeof partial !== 'object' || Array.isArray(partial)) {
    return 'Payload must be an object'
  }
  if (partial.dailyGoal !== undefined) {
    if (typeof partial.dailyGoal !== 'number' || !Number.isInteger(partial.dailyGoal) || partial.dailyGoal <= 0) {
      return 'dailyGoal must be a positive integer'
    }
  }
  if (partial.uiLanguage !== undefined && !['vi', 'en'].includes(partial.uiLanguage)) {
    return 'uiLanguage must be "vi" or "en"'
  }
  if (partial.theme !== undefined && !['system', 'light', 'dark'].includes(partial.theme)) {
    return 'theme must be "system", "light", or "dark"'
  }
  if (partial.tooltipTrigger !== undefined && !['auto', 'icon'].includes(partial.tooltipTrigger)) {
    return 'tooltipTrigger must be "auto" or "icon"'
  }
  if (partial.sourceLang !== undefined && (typeof partial.sourceLang !== 'string' || !partial.sourceLang.trim())) {
    return 'sourceLang must be a non-empty string'
  }
  if (partial.targetLang !== undefined && (typeof partial.targetLang !== 'string' || !partial.targetLang.trim())) {
    return 'targetLang must be a non-empty string'
  }
  return null
}

export function sanitizeSettingsUpdate(partial: Partial<Settings>): Partial<Settings> {
  const sanitized: Partial<Settings> = {}
  if (partial.dailyGoal !== undefined) sanitized.dailyGoal = Math.min(Math.max(1, partial.dailyGoal), 1000)
  if (partial.uiLanguage !== undefined) sanitized.uiLanguage = partial.uiLanguage
  if (partial.theme !== undefined) sanitized.theme = partial.theme
  if (partial.tooltipTrigger !== undefined) sanitized.tooltipTrigger = partial.tooltipTrigger
  if (partial.sourceLang !== undefined) sanitized.sourceLang = partial.sourceLang.trim()
  if (partial.targetLang !== undefined) sanitized.targetLang = partial.targetLang.trim()
  if (partial.aiEnabled !== undefined) sanitized.aiEnabled = Boolean(partial.aiEnabled)
  if (partial.aiProvider !== undefined) sanitized.aiProvider = partial.aiProvider
  return sanitized
}
