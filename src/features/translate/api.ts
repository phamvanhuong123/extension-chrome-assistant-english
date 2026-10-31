import { sendMessage, type Response } from '@/shared/messaging'
import type { TranslationResult } from './types'
import type { TranslateWordPayload } from './messages'

export const translateWord = (payload: TranslateWordPayload): Promise<Response<TranslationResult>> =>
  sendMessage<TranslationResult>({ type: 'TRANSLATE_WORD', payload })
