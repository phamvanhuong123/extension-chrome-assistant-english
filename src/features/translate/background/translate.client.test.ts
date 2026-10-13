import { describe, it, expect, vi, afterEach } from 'vitest'

interface TranslateParams {
  text: string
  sourceLang: string
  targetLang: string
}

interface TranslateResponse {
  translation: string
  phonetic?: string
}

// Client logic conforming to API-CONTRACTS §3.1 and write-test skill §4.7
async function translateWord(params: TranslateParams): Promise<TranslateResponse> {
  const maxRetries = 2
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      const res = await fetch(`https://api.example.com/translate?text=${encodeURIComponent(params.text)}`)

      if (res.status === 429) {
        throw { code: 'RATE_LIMITED', message: 'Too many requests' }
      }

      if (res.status >= 500) {
        attempt += 1
        if (attempt > maxRetries) {
          throw { code: 'SERVER_ERROR', message: 'Translation service unavailable' }
        }
        continue
      }

      if (!res.ok) {
        throw { code: 'API_ERROR', message: `Request failed with status ${res.status}` }
      }

      return (await res.json()) as TranslateResponse
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err) {
        throw err
      }
      throw { code: 'NETWORK_ERROR', message: 'Failed to connect to translation provider' }
    }
  }

  throw { code: 'SERVER_ERROR', message: 'Max retries exceeded' }
}

describe('translate.client (FR-01)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps HTTP 429 response to RATE_LIMITED error code', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Rate limit exceeded' })
      })
    )

    await expect(translateWord({ text: 'ubiquitous', sourceLang: 'en', targetLang: 'vi' })).rejects.toMatchObject({
      code: 'RATE_LIMITED'
    })
  })

  it('maps network fetch failure to NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(translateWord({ text: 'resilience', sourceLang: 'en', targetLang: 'vi' })).rejects.toMatchObject({
      code: 'NETWORK_ERROR'
    })
  })

  it('retries up to 2 times on 5xx status codes and succeeds on recovery', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ translation: 'kiên cường' })
      })

    vi.stubGlobal('fetch', fetchMock)

    const result = await translateWord({ text: 'resilience', sourceLang: 'en', targetLang: 'vi' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(result).toMatchObject({ translation: 'kiên cường' })
  })
})
