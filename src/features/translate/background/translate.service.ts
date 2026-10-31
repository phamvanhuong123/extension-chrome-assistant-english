import { normalizeText, countWords } from '@/shared/utils'
import { MAX_INPUT_CHARS, MAX_WORDS } from '../types'

export function validateTranslateInput(text: unknown): string | null {
  if (typeof text !== 'string') {
    return 'VALIDATION_ERROR'
  }
  const trimmed = text.trim()
  if (!trimmed) {
    return 'VALIDATION_ERROR'
  }
  if (trimmed.length > MAX_INPUT_CHARS) {
    return 'VALIDATION_ERROR'
  }
  if (countWords(trimmed) > MAX_WORDS) {
    return 'VALIDATION_ERROR'
  }
  return null
}

const HTML_ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&#x27;': "'",
  '&#x2F;': '/'
}

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(?:quot|#39|apos|amp|lt|gt|#x27|#x2F);/g, (match) => HTML_ENTITIES[match] ?? match)
}

export { normalizeText, countWords }
