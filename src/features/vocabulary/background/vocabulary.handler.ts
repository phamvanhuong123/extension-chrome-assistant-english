import type { Response } from '@/shared/messaging'
import { recordEvent } from '@/features/stats/background'
import type {
  SaveWordMessage,
  SaveWordResult,
  ListWordsMessage,
  ListWordsResult,
  GetWordStatusMessage,
  GetWordStatusResult,
  DeleteWordMessage,
  DeleteWordResult
} from '../messages'
import {
  validateSaveWordInput,
  validateListWordsInput,
  validateGetWordStatusInput,
  validateDeleteWordInput
} from './vocabulary.service'
import { saveWord, listWords, getWordStatus, deleteWord } from './vocabulary.repo'

export async function handleSaveWord(message: SaveWordMessage): Promise<Response<SaveWordResult>> {
  try {
    const validationError = validateSaveWordInput(message.payload)
    if (validationError) {
      return {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid word payload' }
      }
    }

    const result = await saveWord(message.payload)

    if (result.created) {
      await recordEvent('wordsSaved')
    }

    return {
      ok: true,
      data: result
    }
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string'
        ? (err as { code: string }).code
        : 'STORAGE_ERROR'
    const messageText = err instanceof Error ? err.message : 'Failed to save word'

    return {
      ok: false,
      error: { code, message: messageText, retryable: true }
    }
  }
}

export async function handleListWords(message: ListWordsMessage): Promise<Response<ListWordsResult>> {
  try {
    const validationError = validateListWordsInput(message.payload)
    if (validationError) {
      return {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid list parameters' }
      }
    }

    const result = await listWords(message.payload)
    return {
      ok: true,
      data: result
    }
  } catch (err: unknown) {
    const messageText = err instanceof Error ? err.message : 'Failed to list words'
    return {
      ok: false,
      error: { code: 'STORAGE_ERROR', message: messageText, retryable: true }
    }
  }
}

export async function handleGetWordStatus(message: GetWordStatusMessage): Promise<Response<GetWordStatusResult>> {
  try {
    const validationError = validateGetWordStatusInput(message.payload)
    if (validationError) {
      return {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid word status query' }
      }
    }

    const result = await getWordStatus(message.payload.text, message.payload.targetLang)
    return {
      ok: true,
      data: result
    }
  } catch (err: unknown) {
    const messageText = err instanceof Error ? err.message : 'Failed to get word status'
    return {
      ok: false,
      error: { code: 'STORAGE_ERROR', message: messageText, retryable: true }
    }
  }
}

export async function handleDeleteWord(message: DeleteWordMessage): Promise<Response<DeleteWordResult>> {
  try {
    const validationError = validateDeleteWordInput(message.payload)
    if (validationError) {
      return {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid word ID' }
      }
    }

    const result = await deleteWord(message.payload.id)
    return {
      ok: true,
      data: result
    }
  } catch (err: unknown) {
    const isNotFound = err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'NOT_FOUND'
    if (isNotFound) {
      return {
        ok: false,
        error: { code: 'NOT_FOUND', message: err instanceof Error ? err.message : 'Word not found' }
      }
    }

    const messageText = err instanceof Error ? err.message : 'Failed to delete word'
    return {
      ok: false,
      error: { code: 'STORAGE_ERROR', message: messageText, retryable: true }
    }
  }
}
