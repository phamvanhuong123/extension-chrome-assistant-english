import { sendMessage, type Response } from '@/shared/messaging'
import type {
  SaveWordPayload,
  SaveWordResult,
  ListWordsPayload,
  ListWordsResult,
  GetWordStatusPayload,
  GetWordStatusResult,
  DeleteWordPayload,
  DeleteWordResult
} from './messages'

export const saveWord = (payload: SaveWordPayload): Promise<Response<SaveWordResult>> =>
  sendMessage<SaveWordResult>({ type: 'SAVE_WORD', payload })

export const listWords = (payload?: ListWordsPayload): Promise<Response<ListWordsResult>> =>
  sendMessage<ListWordsResult>({ type: 'LIST_WORDS', payload })

export const getWordStatus = (payload: GetWordStatusPayload): Promise<Response<GetWordStatusResult>> =>
  sendMessage<GetWordStatusResult>({ type: 'GET_WORD_STATUS', payload })

export const deleteWord = (payload: DeleteWordPayload): Promise<Response<DeleteWordResult>> =>
  sendMessage<DeleteWordResult>({ type: 'DELETE_WORD', payload })
