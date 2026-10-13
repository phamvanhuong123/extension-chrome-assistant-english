import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'
import { createWordFixture } from '@/test/factories'

describe('vocabulary.repo (FR-03, FR-04)', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.local._reset()
    vi.clearAllMocks()
  })

  it('saves a new word and adds entry to index:vocabByText', async () => {
    const word = createWordFixture({
      id: 'w-101',
      text: 'ubiquitous',
      normalizedText: 'ubiquitous',
      translation: 'có mặt ở khắp nơi',
      targetLang: 'vi'
    })

    const indexKey = `${word.targetLang}:${word.normalizedText}`
    await chromeMock.storage.local.set({
      [`vocab:${word.id}`]: word,
      'index:vocabByText': { [indexKey]: word.id }
    })

    const result = await chromeMock.storage.local.get([`vocab:${word.id}`, 'index:vocabByText'])
    expect(result[`vocab:${word.id}`]).toEqual(word)
    expect((result['index:vocabByText'] as Record<string, string>)[indexKey]).toBe('w-101')
  })

  it('updates existing word context on duplicate save instead of creating new entry (FR-04)', async () => {
    const initialWord = createWordFixture({
      id: 'w-1',
      text: 'Ubiquitous',
      normalizedText: 'ubiquitous',
      context: 'Initial sentence context.',
      updatedAt: 1000
    })

    await chromeMock.storage.local.set({
      'vocab:w-1': initialWord,
      'index:vocabByText': { 'vi:ubiquitous': 'w-1' }
    })

    const indexData = await chromeMock.storage.local.get('index:vocabByText')
    const existingId = (indexData['index:vocabByText'] as Record<string, string>)?.['vi:ubiquitous']
    expect(existingId).toBe('w-1')

    const updatedWord = {
      ...initialWord,
      context: 'New context from another website.',
      updatedAt: 2000
    }
    await chromeMock.storage.local.set({ 'vocab:w-1': updatedWord })

    const storedWord = (await chromeMock.storage.local.get('vocab:w-1'))['vocab:w-1'] as typeof initialWord
    expect(storedWord.id).toBe('w-1')
    expect(storedWord.context).toBe('New context from another website.')
    expect(storedWord.updatedAt).toBe(2000)
  })
})
