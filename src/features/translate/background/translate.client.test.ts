import { describe, it, expect, vi, afterEach } from 'vitest'
import { translateWord, translateViaProvider } from './translate.client'

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
        json: async () => ({
          responseData: {
            translatedText: 'kiên cường'
          }
        })
      })

    vi.stubGlobal('fetch', fetchMock)

    const result = await translateWord({ text: 'resilience', sourceLang: 'en', targetLang: 'vi' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(result).toMatchObject({ translation: 'kiên cường' })
  })

  it('fails with PROVIDER_ERROR when 5xx retries exceed limit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({})
    })

    vi.stubGlobal('fetch', fetchMock)

    await expect(translateWord({ text: 'persistence', sourceLang: 'en', targetLang: 'vi' })).rejects.toMatchObject({
      code: 'PROVIDER_ERROR'
    })
    // Initial attempt + 2 retries = 3 calls
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('does not retry on 4xx status codes (e.g. 400)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad Request' })
    })

    vi.stubGlobal('fetch', fetchMock)

    await expect(translateWord({ text: 'bad', sourceLang: 'en', targetLang: 'vi' })).rejects.toMatchObject({
      code: 'PROVIDER_ERROR'
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('decodes HTML entities in MyMemory response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          responseData: {
            translatedText: '&quot;nó không phải là&quot; &#39;thử nghiệm&#39;'
          }
        })
      })
    )

    const result = await translateWord({ text: "it isn't", sourceLang: 'en', targetLang: 'vi' })
    expect(result.translation).toBe('"nó không phải là" \'thử nghiệm\'')
  })

  it('deduplicates simultaneous in-flight requests for the same word', async () => {
    let resolveFirstFetch!: (val: unknown) => void
    const fetchPromise = new Promise((resolve) => {
      resolveFirstFetch = resolve
    })

    const fetchMock = vi.fn().mockImplementation(() => fetchPromise)
    vi.stubGlobal('fetch', fetchMock)

    const p1 = translateWord({ text: 'synchronous', sourceLang: 'en', targetLang: 'vi' })
    const p2 = translateWord({ text: '  synchronous  ', sourceLang: 'en', targetLang: 'vi' })

    resolveFirstFetch({
      ok: true,
      status: 200,
      json: async () => ({
        responseData: { translatedText: 'đồng bộ' }
      })
    })

    const [r1, r2] = await Promise.all([p1, p2])
    expect(r1.translation).toBe('đồng bộ')
    expect(r2.translation).toBe('đồng bộ')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('maps AbortError to TIMEOUT', async () => {
    const abortErr = new DOMException('The user aborted a request.', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortErr))

    await expect(
      translateViaProvider({ text: 'timeout test', sourceLang: 'en', targetLang: 'vi' })
    ).rejects.toMatchObject({
      code: 'TIMEOUT',
      retryable: true
    })
  })
})
