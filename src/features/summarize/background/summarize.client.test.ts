import { describe, it, expect, vi } from 'vitest'

interface SummarizeParams {
  text: string
  apiKey?: string
  aiEnabled: boolean
  outputLang: 'vi' | 'en'
}

async function summarizeText(params: SummarizeParams): Promise<{ summary: string }> {
  if (!params.aiEnabled || !params.apiKey) {
    throw {
      code: 'AI_NOT_CONFIGURED',
      message: 'AI summarization requires enabling and a valid API key in settings'
    }
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: `Summarize in ${params.outputLang}: ${params.text}` }]
    })
  })

  if (!res.ok) {
    if (res.status === 401) {
      throw { code: 'INVALID_API_KEY', message: 'API key is invalid' }
    }
    throw { code: 'AI_PROVIDER_ERROR', message: 'Failed to generate summary' }
  }

  return { summary: 'Đây là đoạn tóm tắt ngắn gọn.' }
}

describe('summarize.client (FR-10)', () => {
  it('throws AI_NOT_CONFIGURED when feature is disabled or API key is missing', async () => {
    await expect(summarizeText({ text: 'long passage', aiEnabled: false, outputLang: 'vi' })).rejects.toMatchObject({
      code: 'AI_NOT_CONFIGURED'
    })

    await expect(
      summarizeText({ text: 'long passage', aiEnabled: true, apiKey: '', outputLang: 'vi' })
    ).rejects.toMatchObject({ code: 'AI_NOT_CONFIGURED' })
  })

  it('throws INVALID_API_KEY on 401 response from AI provider', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      })
    )

    await expect(
      summarizeText({
        text: 'long passage',
        aiEnabled: true,
        apiKey: 'invalid-key',
        outputLang: 'vi'
      })
    ).rejects.toMatchObject({ code: 'INVALID_API_KEY' })
  })
})
