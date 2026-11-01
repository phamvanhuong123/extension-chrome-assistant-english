import type { Message } from '@/shared/messaging'
import type { Word } from './types'

export interface SaveWordPayload {
  text: string
  translation: string
  phonetic?: string
  partOfSpeech?: string
  context?: string
  sourceUrl?: string
  sourceLang: string
  targetLang: string
}

export interface SaveWordResult {
  id: string
  created: boolean
}

export type SaveWordMessage = Message<'SAVE_WORD', SaveWordPayload>

export interface ListWordsPayload {
  query?: string
  sort?: 'createdAt' | 'text'
  order?: 'asc' | 'desc'
  limit?: number
  cursor?: string
}

export interface ListWordsResult {
  items: Word[]
  nextCursor?: string
  total: number
}

export type ListWordsMessage = {
  type: 'LIST_WORDS'
  payload?: ListWordsPayload
}

export interface GetWordStatusPayload {
  text: string
  targetLang: string
}

export interface GetWordStatusResult {
  saved: boolean
  id?: string
}

export type GetWordStatusMessage = Message<'GET_WORD_STATUS', GetWordStatusPayload>

export interface DeleteWordPayload {
  id: string
}

export interface DeleteWordResult {
  deleted: boolean
}

export type DeleteWordMessage = Message<'DELETE_WORD', DeleteWordPayload>

export type VocabularyMessage = SaveWordMessage | ListWordsMessage | GetWordStatusMessage | DeleteWordMessage
