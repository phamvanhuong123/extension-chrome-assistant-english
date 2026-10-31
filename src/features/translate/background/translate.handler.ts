import type { Response } from '@/shared/messaging'
import { normalizeText } from '@/shared/utils'
import type { TranslationResult } from '../types'
import { DEFAULT_SOURCE_LANG, DEFAULT_TARGET_LANG } from '../types'
import type { TranslateWordMessage } from '../messages'
import { validateTranslateInput } from './translate.service'
import { getCached, setCache } from './translate.cache'
import { translateWord } from './translate.client'

export async function handleTranslateWord(message: TranslateWordMessage): Promise<Response<TranslationResult>> {
  try {
    const text = message?.payload?.text
    const validationError = validateTranslateInput(text)
    if (validationError) {
      return {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid text for translation (must be 1-100 characters and at most 5 words)'
        }
      }
    }

    const sourceLang = message.payload.sourceLang || DEFAULT_SOURCE_LANG
    const targetLang = message.payload.targetLang || DEFAULT_TARGET_LANG
    const normalized = normalizeText(text)

    // Check session cache
    const cached = await getCached(targetLang, normalized)
    if (cached) {
      return {
        ok: true,
        data: {
          translation: cached.translation,
          phonetic: cached.phonetic,
          partOfSpeech: cached.partOfSpeech,
          cached: true
        }
      }
    }

    // Call provider client
    const result = await translateWord({
      text: normalized,
      sourceLang,
      targetLang
    })

    // Store in session cache
    await setCache(targetLang, normalized, result)

    return {
      ok: true,
      data: {
        translation: result.translation,
        phonetic: result.phonetic,
        partOfSpeech: result.partOfSpeech,
        cached: false
      }
    }
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string'
        ? (err as { code: string }).code
        : 'UNKNOWN'

    const messageText = err instanceof Error ? err.message : 'Translation failed'

    const retryable =
      err && typeof err === 'object' && 'retryable' in err ? Boolean((err as { retryable?: boolean }).retryable) : false

    return {
      ok: false,
      error: {
        code,
        message: messageText,
        retryable
      }
    }
  }
}
