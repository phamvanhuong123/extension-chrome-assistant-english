import type { Word } from '../types'
import { MAX_WORD_TEXT_LENGTH, MAX_TRANSLATION_LENGTH, MAX_CONTEXT_LENGTH } from '../types'
import type {
  SaveWordPayload,
  ListWordsPayload,
  ListWordsResult,
  GetWordStatusPayload,
  DeleteWordPayload
} from '../messages'

export function validateSaveWordInput(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return 'VALIDATION_ERROR'
  }

  const p = payload as Partial<SaveWordPayload>

  if (typeof p.text !== 'string' || !p.text.trim() || p.text.trim().length > MAX_WORD_TEXT_LENGTH) {
    return 'VALIDATION_ERROR'
  }

  if (
    typeof p.translation !== 'string' ||
    !p.translation.trim() ||
    p.translation.trim().length > MAX_TRANSLATION_LENGTH
  ) {
    return 'VALIDATION_ERROR'
  }

  if (p.context !== undefined && (typeof p.context !== 'string' || p.context.length > MAX_CONTEXT_LENGTH)) {
    return 'VALIDATION_ERROR'
  }

  if (typeof p.sourceLang !== 'string' || !p.sourceLang.trim()) {
    return 'VALIDATION_ERROR'
  }

  if (typeof p.targetLang !== 'string' || !p.targetLang.trim()) {
    return 'VALIDATION_ERROR'
  }

  return null
}

export function validateListWordsInput(payload: unknown): string | null {
  if (payload === undefined || payload === null) {
    return null
  }

  if (typeof payload !== 'object') {
    return 'VALIDATION_ERROR'
  }

  const p = payload as Partial<ListWordsPayload>

  if (p.limit !== undefined && (typeof p.limit !== 'number' || p.limit <= 0 || !Number.isInteger(p.limit))) {
    return 'VALIDATION_ERROR'
  }

  if (p.sort !== undefined && p.sort !== 'createdAt' && p.sort !== 'text') {
    return 'VALIDATION_ERROR'
  }

  if (p.order !== undefined && p.order !== 'asc' && p.order !== 'desc') {
    return 'VALIDATION_ERROR'
  }

  return null
}

export function validateGetWordStatusInput(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return 'VALIDATION_ERROR'
  }

  const p = payload as Partial<GetWordStatusPayload>

  if (typeof p.text !== 'string' || !p.text.trim()) {
    return 'VALIDATION_ERROR'
  }

  if (typeof p.targetLang !== 'string' || !p.targetLang.trim()) {
    return 'VALIDATION_ERROR'
  }

  return null
}

export function validateDeleteWordInput(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return 'VALIDATION_ERROR'
  }

  const p = payload as Partial<DeleteWordPayload>

  if (typeof p.id !== 'string' || !p.id.trim()) {
    return 'VALIDATION_ERROR'
  }

  return null
}

export function filterAndSortWords(words: Word[], params?: ListWordsPayload): ListWordsResult {
  const query = params?.query?.trim().toLowerCase()

  const filtered = query
    ? words.filter((w) => w.text.toLowerCase().includes(query) || w.translation.toLowerCase().includes(query))
    : [...words]

  const sortField = params?.sort ?? 'createdAt'
  const sortOrder = params?.order ?? (sortField === 'text' ? 'asc' : 'desc')

  filtered.sort((a, b) => {
    const cmp = sortField === 'text' ? a.text.localeCompare(b.text) : (a.createdAt || 0) - (b.createdAt || 0)
    return sortOrder === 'desc' ? -cmp : cmp
  })

  const total = filtered.length
  const offset = params?.cursor ? Math.max(0, parseInt(params.cursor, 10) || 0) : 0
  const limit = params?.limit && params.limit > 0 ? params.limit : total

  const items = filtered.slice(offset, offset + limit)
  const nextCursor = offset + limit < total ? String(offset + limit) : undefined

  return {
    items,
    total,
    nextCursor
  }
}
