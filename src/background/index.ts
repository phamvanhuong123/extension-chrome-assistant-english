import { createRouter, type HandlerMap } from '@/shared/messaging'
import { translateHandlers } from '@/features/translate/background'
import { vocabularyHandlers } from '@/features/vocabulary/background'
import { settingsHandlers } from '@/features/settings/background'

const router = createRouter({
  ...translateHandlers,
  ...vocabularyHandlers,
  ...settingsHandlers
} as unknown as HandlerMap)

chrome.runtime.onMessage.addListener(router.listener)
