import type { Message } from '@/shared/messaging'

export interface TranslateWordPayload {
  text: string
  sourceLang?: string
  targetLang?: string
}

export type TranslateWordMessage = Message<'TRANSLATE_WORD', TranslateWordPayload>
export type TranslateMessage = TranslateWordMessage
