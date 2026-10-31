import { normalizeText } from '@/shared/utils'
import {
  TRANSLATE_TIMEOUT_MS,
  MAX_RETRIES,
  RETRY_BACKOFF_BASE_MS,
  DEFAULT_SOURCE_LANG,
  DEFAULT_TARGET_LANG
} from '../types'
import { decodeHtmlEntities } from './translate.service'

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get'

export interface ProviderTranslateInput {
  text: string
  sourceLang: string
  targetLang: string
  signal?: AbortSignal
}

export interface ProviderTranslateResult {
  translation: string
  phonetic?: string
  partOfSpeech?: string
}

export interface TranslateClientOptions {
  backoffBaseMs?: number
  signal?: AbortSignal
}

interface ProviderResponse {
  responseData?: {
    translatedText?: string
    match?: number
  }
  responseStatus?: number
  responseDetails?: string
  translation?: string
}

const inFlightRequests = new Map<string, Promise<ProviderTranslateResult>>()

export async function translateViaProvider(input: ProviderTranslateInput): Promise<ProviderTranslateResult> {
  const url = new URL(MYMEMORY_URL)
  url.searchParams.set('q', input.text)
  url.searchParams.set('langpair', `${input.sourceLang}|${input.targetLang}`)

  let res: globalThis.Response
  try {
    res = await fetch(url.toString(), { signal: input.signal })
  } catch (err: unknown) {
    const isAbort =
      Boolean(err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError') ||
      Boolean(input.signal?.aborted)

    if (isAbort) {
      throw Object.assign(new Error('Translation request timed out'), {
        code: 'TIMEOUT',
        retryable: true
      })
    }
    throw Object.assign(new Error('Failed to connect to translation provider'), {
      code: 'NETWORK_ERROR',
      retryable: true
    })
  }

  if (res.status === 429) {
    throw Object.assign(new Error('Too many requests, wait a moment'), {
      code: 'RATE_LIMITED',
      retryable: true
    })
  }

  if (res.status >= 500) {
    throw Object.assign(new Error(`Provider error ${res.status}`), {
      code: 'PROVIDER_ERROR',
      retryable: true
    })
  }

  if (!res.ok) {
    throw Object.assign(new Error(`Request failed with status ${res.status}`), {
      code: 'PROVIDER_ERROR',
      retryable: false
    })
  }

  let data: ProviderResponse
  try {
    data = (await res.json()) as ProviderResponse
  } catch {
    throw Object.assign(new Error('Malformed provider response'), {
      code: 'PROVIDER_ERROR',
      retryable: true
    })
  }

  const rawTranslated = data.responseData?.translatedText ?? data.translation
  if (!rawTranslated || typeof rawTranslated !== 'string') {
    throw Object.assign(new Error('Empty translation response'), {
      code: 'PROVIDER_ERROR',
      retryable: true
    })
  }

  return {
    translation: decodeHtmlEntities(rawTranslated)
  }
}

export async function translateWord(
  params: {
    text: string
    sourceLang?: string
    targetLang?: string
  },
  options?: TranslateClientOptions
): Promise<ProviderTranslateResult> {
  const sourceLang = params.sourceLang ?? DEFAULT_SOURCE_LANG
  const targetLang = params.targetLang ?? DEFAULT_TARGET_LANG
  const normalized = normalizeText(params.text)

  const dedupeKey = `${sourceLang}:${targetLang}:${normalized}`
  const existing = inFlightRequests.get(dedupeKey)
  if (existing) {
    return existing
  }

  const defaultBackoff =
    typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test' ? 10 : RETRY_BACKOFF_BASE_MS
  const backoffBase = options?.backoffBaseMs ?? defaultBackoff

  const executionPromise = (async () => {
    let attempt = 0
    let lastError: unknown = null

    while (attempt <= MAX_RETRIES) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS)

      // Link external signal if present
      const externalSignal = options?.signal
      const onExternalAbort = () => controller.abort()
      if (externalSignal) {
        externalSignal.addEventListener('abort', onExternalAbort)
      }

      try {
        const result = await translateViaProvider({
          text: normalized,
          sourceLang,
          targetLang,
          signal: controller.signal
        })
        return result
      } catch (err: unknown) {
        lastError = err

        const isRetryable =
          err && typeof err === 'object' && 'retryable' in err && (err as { retryable?: boolean }).retryable === true

        if (!isRetryable || attempt >= MAX_RETRIES) {
          throw err
        }

        attempt += 1
        const delayMs = backoffBase * Math.pow(3, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      } finally {
        clearTimeout(timeoutId)
        if (externalSignal) {
          externalSignal.removeEventListener('abort', onExternalAbort)
        }
      }
    }

    throw lastError ?? Object.assign(new Error('Max retries exceeded'), { code: 'PROVIDER_ERROR' })
  })()

  inFlightRequests.set(dedupeKey, executionPromise)

  try {
    return await executionPromise
  } finally {
    inFlightRequests.delete(dedupeKey)
  }
}
