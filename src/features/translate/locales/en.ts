import type { vi } from './vi'

export const en: typeof vi = {
  'translate.tooltip.loading': 'Translating...',
  'translate.tooltip.retry': 'Try again',
  'translate.tooltip.save': 'Save',
  'translate.tooltip.saving': 'Saving...',
  'translate.tooltip.saved': 'Saved ✓',
  'translate.tooltip.saveError': 'Failed to save word',

  'translate.errors.RATE_LIMITED': 'Too many requests, please wait a moment.',
  'translate.errors.NETWORK_ERROR': 'Network connection error, please check your network.',
  'translate.errors.TIMEOUT': 'Request timed out, please try again.',
  'translate.errors.PROVIDER_ERROR': 'Translation provider is currently unavailable.',
  'translate.errors.VALIDATION_ERROR': 'Invalid text for lookup (max 100 characters or 5 words).',
  'translate.errors.UNKNOWN': 'An unknown error occurred.'
}
