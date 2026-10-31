export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_MESSAGE'
  | 'NOT_FOUND'
  | 'STORAGE_ERROR'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'AUTH_ERROR'
  | 'PROVIDER_ERROR'
  | 'AI_NOT_CONFIGURED'
  | 'SCHEMA_TOO_NEW'
  | 'CONTEXT_INVALIDATED'
  | 'UNAUTHORIZED_SENDER'
  | 'UNKNOWN'

export type Message<T extends string, P = undefined> = P extends undefined ? { type: T } : { type: T; payload: P }

export type Response<T> =
  { ok: true; data: T } | { ok: false; error: { code: ErrorCode | string; message: string; retryable?: boolean } }

export type AnyMessage = { type: string; payload?: unknown }

export type Handler<TMsg extends AnyMessage = AnyMessage, TData = unknown> = (
  message: TMsg,
  sender: chrome.runtime.MessageSender
) => Promise<Response<TData>>

export type HandlerMap = Record<string, Handler<AnyMessage, unknown>>
