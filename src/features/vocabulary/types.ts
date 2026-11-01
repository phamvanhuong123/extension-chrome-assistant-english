export interface Word {
  id: string
  text: string
  normalizedText: string
  translation: string
  phonetic?: string
  partOfSpeech?: string
  context?: string
  sourceUrl?: string
  sourceLang: string
  targetLang: string
  createdAt: number
  updatedAt: number
  reviewCount: number
  lapseCount: number
  srsStep: number
  lastReviewedAt?: number
  nextReviewAt: number
}

export type VocabIndex = Record<string, string>

export const VOCAB_KEY_PREFIX = 'vocab:'
export const VOCAB_INDEX_KEY = 'index:vocabByText'

export const MAX_WORD_TEXT_LENGTH = 100
export const MAX_TRANSLATION_LENGTH = 500
export const MAX_CONTEXT_LENGTH = 500
