export type { Word, VocabIndex } from './types'
export {
  VOCAB_KEY_PREFIX,
  VOCAB_INDEX_KEY,
  MAX_WORD_TEXT_LENGTH,
  MAX_TRANSLATION_LENGTH,
  MAX_CONTEXT_LENGTH
} from './types'

export type {
  SaveWordPayload,
  SaveWordResult,
  SaveWordMessage,
  ListWordsPayload,
  ListWordsResult,
  ListWordsMessage,
  GetWordStatusPayload,
  GetWordStatusResult,
  GetWordStatusMessage,
  DeleteWordPayload,
  DeleteWordResult,
  DeleteWordMessage,
  VocabularyMessage
} from './messages'

export { saveWord, listWords, getWordStatus, deleteWord } from './api'

export { vi as vocabularyVi } from './locales/vi'
export { en as vocabularyEn } from './locales/en'
