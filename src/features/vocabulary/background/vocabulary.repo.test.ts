import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'
import {
  saveWord,
  getWordById,
  findWordByText,
  listWords,
  deleteWord,
  getWordStatus,
  rebuildVocabIndex,
  getVocabIndex
} from './vocabulary.repo'

describe('vocabulary.repo (FR-03, FR-04, FR-05)', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.local._reset()
    vi.clearAllMocks()
  })

  it('saves a new word, assigns initial SRS fields, and updates index:vocabByText', async () => {
    const result = await saveWord({
      text: 'ubiquitous',
      translation: 'có mặt ở khắp nơi',
      phonetic: '/juːˈbɪkwɪtəs/',
      partOfSpeech: 'adjective',
      context: 'Smartphones are ubiquitous.',
      sourceUrl: 'https://example.com',
      sourceLang: 'en',
      targetLang: 'vi'
    })

    expect(result.created).toBe(true)
    expect(result.id).toBeDefined()

    const storedWord = await getWordById(result.id)
    expect(storedWord).not.toBeNull()
    expect(storedWord?.text).toBe('ubiquitous')
    expect(storedWord?.normalizedText).toBe('ubiquitous')
    expect(storedWord?.translation).toBe('có mặt ở khắp nơi')
    expect(storedWord?.srsStep).toBe(0)
    expect(storedWord?.reviewCount).toBe(0)
    expect(storedWord?.lapseCount).toBe(0)
    expect(storedWord?.nextReviewAt).toBeDefined()

    const index = await getVocabIndex()
    expect(index['vi:ubiquitous']).toBe(result.id)
  })

  it('updates existing word context on duplicate save without resetting SRS metrics (FR-04)', async () => {
    const firstSave = await saveWord({
      text: 'Resilience',
      translation: 'Sự kiên cường',
      sourceLang: 'en',
      targetLang: 'vi',
      context: 'Old context'
    })

    expect(firstSave.created).toBe(true)

    // Simulate an advanced SRS state
    const original = (await getWordById(firstSave.id))!
    await chromeMock.storage.local.set({
      [`vocab:${firstSave.id}`]: {
        ...original,
        srsStep: 2,
        reviewCount: 5,
        lapseCount: 1,
        createdAt: 1000,
        updatedAt: 1000
      }
    })

    const secondSave = await saveWord({
      text: 'resilience',
      translation: 'Khả năng phục hồi',
      sourceLang: 'en',
      targetLang: 'vi',
      context: 'New updated context sentence'
    })

    expect(secondSave.created).toBe(false)
    expect(secondSave.id).toBe(firstSave.id)

    const updated = await getWordById(firstSave.id)
    expect(updated?.context).toBe('New updated context sentence')
    expect(updated?.translation).toBe('Khả năng phục hồi')
    expect(updated?.srsStep).toBe(2)
    expect(updated?.reviewCount).toBe(5)
    expect(updated?.lapseCount).toBe(1)
    expect(updated?.createdAt).toBe(1000)
    expect(updated?.updatedAt).toBeGreaterThan(1000)
  })

  it('findWordByText looks up words by normalized text and target language', async () => {
    const saved = await saveWord({
      text: 'Serendipity',
      translation: 'Sự tình cờ may mắn',
      sourceLang: 'en',
      targetLang: 'vi'
    })

    const found = await findWordByText('serendipity', 'vi')
    expect(found?.id).toBe(saved.id)

    const notFound = await findWordByText('unknown', 'vi')
    expect(notFound).toBeNull()
  })

  it('listWords returns all saved words with sorting and filtering', async () => {
    await saveWord({
      text: 'Apple',
      translation: 'Táo',
      sourceLang: 'en',
      targetLang: 'vi'
    })
    await saveWord({
      text: 'Banana',
      translation: 'Chuối',
      sourceLang: 'en',
      targetLang: 'vi'
    })

    const list = await listWords()
    expect(list.total).toBe(2)
    expect(list.items.length).toBe(2)

    const filtered = await listWords({ query: 'chuối' })
    expect(filtered.total).toBe(1)
    expect(filtered.items[0].text).toBe('Banana')
  })

  it('deleteWord removes word and its index entry', async () => {
    const saved = await saveWord({
      text: 'ephemeral',
      translation: 'phù du',
      sourceLang: 'en',
      targetLang: 'vi'
    })

    const deleteRes = await deleteWord(saved.id)
    expect(deleteRes.deleted).toBe(true)

    const wordAfter = await getWordById(saved.id)
    expect(wordAfter).toBeNull()

    const indexAfter = await getVocabIndex()
    expect(indexAfter['vi:ephemeral']).toBeUndefined()
  })

  it('deleteWord throws NOT_FOUND for non-existent id', async () => {
    await expect(deleteWord('non-existent-id')).rejects.toMatchObject({
      code: 'NOT_FOUND'
    })
  })

  it('getWordStatus returns saved: true for saved words and saved: false otherwise', async () => {
    const saved = await saveWord({
      text: 'Cognitive',
      translation: 'Thuộc về nhận thức',
      sourceLang: 'en',
      targetLang: 'vi'
    })

    const statusTrue = await getWordStatus('cognitive', 'vi')
    expect(statusTrue).toEqual({ saved: true, id: saved.id })

    const statusFalse = await getWordStatus('unknown', 'vi')
    expect(statusFalse).toEqual({ saved: false })
  })

  it('rebuildVocabIndex reconstructs missing or corrupted indexes', async () => {
    const saved = await saveWord({
      text: 'Lucid',
      translation: 'Rõ ràng',
      sourceLang: 'en',
      targetLang: 'vi'
    })

    // Corrupt index
    await chromeMock.storage.local.set({ 'index:vocabByText': {} })
    expect(await getVocabIndex()).toEqual({})

    const rebuilt = await rebuildVocabIndex()
    expect(rebuilt['vi:lucid']).toBe(saved.id)
  })
})
