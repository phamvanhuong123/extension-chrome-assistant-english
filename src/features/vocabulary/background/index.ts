import { handleSaveWord, handleListWords, handleGetWordStatus, handleDeleteWord } from './vocabulary.handler'

export { handleSaveWord, handleListWords, handleGetWordStatus, handleDeleteWord } from './vocabulary.handler'

export {
  saveWord,
  getWordById,
  findWordByText,
  listWords,
  deleteWord,
  getWordStatus,
  rebuildVocabIndex,
  getVocabIndex
} from './vocabulary.repo'

export {
  validateSaveWordInput,
  validateListWordsInput,
  validateGetWordStatusInput,
  validateDeleteWordInput,
  filterAndSortWords
} from './vocabulary.service'

export const vocabularyHandlers = {
  SAVE_WORD: handleSaveWord,
  LIST_WORDS: handleListWords,
  GET_WORD_STATUS: handleGetWordStatus,
  DELETE_WORD: handleDeleteWord
}
