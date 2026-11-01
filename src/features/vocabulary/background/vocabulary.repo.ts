import { localStore } from '@/shared/storage'
import { normalizeText } from '@/shared/utils'
import type { Word, VocabIndex } from '../types'
import { VOCAB_KEY_PREFIX, VOCAB_INDEX_KEY } from '../types'
import type {
  SaveWordPayload,
  SaveWordResult,
  ListWordsPayload,
  ListWordsResult,
  GetWordStatusResult,
  DeleteWordResult
} from '../messages'
import { filterAndSortWords } from './vocabulary.service'

export async function getVocabIndex(): Promise<VocabIndex> {
  const data = await localStore.get<VocabIndex>(VOCAB_INDEX_KEY)
  return (data[VOCAB_INDEX_KEY] ?? {}) as VocabIndex
}

export async function getWordById(id: string): Promise<Word | null> {
  const key = `${VOCAB_KEY_PREFIX}${id}`
  const data = await localStore.get<Word>(key)
  return data[key] ?? null
}

export async function findWordByText(normalizedText: string, targetLang: string): Promise<Word | null> {
  const index = await getVocabIndex()
  const indexKey = `${targetLang}:${normalizedText}`
  const id = index[indexKey]
  if (!id) return null
  return getWordById(id)
}

export async function saveWord(payload: SaveWordPayload): Promise<SaveWordResult> {
  const normalized = normalizeText(payload.text)
  const index = await getVocabIndex()
  const indexKey = `${payload.targetLang}:${normalized}`
  const existingId = index[indexKey]

  if (existingId) {
    const existingWord = await getWordById(existingId)
    if (existingWord) {
      const now = Date.now()
      const updatedWord: Word = {
        ...existingWord,
        context: payload.context?.trim() ? payload.context.trim() : existingWord.context,
        translation: payload.translation?.trim() || existingWord.translation,
        phonetic: payload.phonetic ?? existingWord.phonetic,
        partOfSpeech: payload.partOfSpeech ?? existingWord.partOfSpeech,
        sourceUrl: payload.sourceUrl ?? existingWord.sourceUrl,
        updatedAt: now
      }

      await localStore.set({
        [`${VOCAB_KEY_PREFIX}${existingId}`]: updatedWord
      })

      return { id: existingId, created: false }
    }
  }

  const now = Date.now()
  const id = crypto.randomUUID()

  const newWord: Word = {
    id,
    text: payload.text.trim(),
    normalizedText: normalized,
    translation: payload.translation.trim(),
    phonetic: payload.phonetic,
    partOfSpeech: payload.partOfSpeech,
    context: payload.context?.trim(),
    sourceUrl: payload.sourceUrl,
    sourceLang: payload.sourceLang,
    targetLang: payload.targetLang,
    createdAt: now,
    updatedAt: now,
    reviewCount: 0,
    lapseCount: 0,
    srsStep: 0,
    nextReviewAt: now
  }

  const updatedIndex: VocabIndex = {
    ...index,
    [indexKey]: id
  }

  await localStore.set({
    [`${VOCAB_KEY_PREFIX}${id}`]: newWord,
    [VOCAB_INDEX_KEY]: updatedIndex
  })

  return { id, created: true }
}

export async function listWords(params?: ListWordsPayload): Promise<ListWordsResult> {
  const allData = await localStore.get<Word>(null)

  const words: Word[] = Object.entries(allData)
    .filter(([key, val]) => key.startsWith(VOCAB_KEY_PREFIX) && val && typeof val === 'object' && 'id' in val)
    .map(([, val]) => val as Word)

  return filterAndSortWords(words, params)
}

export async function deleteWord(id: string): Promise<DeleteWordResult> {
  const word = await getWordById(id)
  if (!word) {
    const err = new Error(`Word with id ${id} not found`)
    Object.assign(err, { code: 'NOT_FOUND' })
    throw err
  }

  const index = await getVocabIndex()
  const indexKey = `${word.targetLang}:${word.normalizedText}`
  delete index[indexKey]

  await localStore.remove([`${VOCAB_KEY_PREFIX}${id}`])
  await localStore.set({ [VOCAB_INDEX_KEY]: index })

  return { deleted: true }
}

export async function getWordStatus(text: string, targetLang: string): Promise<GetWordStatusResult> {
  const normalized = normalizeText(text)
  const index = await getVocabIndex()
  const indexKey = `${targetLang}:${normalized}`
  const id = index[indexKey]

  if (!id) {
    return { saved: false }
  }

  const word = await getWordById(id)
  if (!word) {
    return { saved: false }
  }

  return { saved: true, id }
}

export async function rebuildVocabIndex(): Promise<VocabIndex> {
  const allData = await localStore.get<Word>(null)
  const newIndex: VocabIndex = {}

  for (const [key, val] of Object.entries(allData)) {
    if (key.startsWith(VOCAB_KEY_PREFIX) && val && typeof val === 'object' && 'id' in val) {
      const w = val as Word
      newIndex[`${w.targetLang}:${w.normalizedText}`] = w.id
    }
  }

  await localStore.set({ [VOCAB_INDEX_KEY]: newIndex })
  return newIndex
}
