import { handleGetSettings, handleUpdateSettings, handleSetApiKey, handleHasApiKey } from './settings.handler'

export { handleGetSettings, handleUpdateSettings, handleSetApiKey, handleHasApiKey } from './settings.handler'

export { getSettings, saveSettings, getApiKey, setApiKey, hasApiKey } from './settings.repo'

export const settingsHandlers = {
  GET_SETTINGS: handleGetSettings,
  UPDATE_SETTINGS: handleUpdateSettings,
  SET_API_KEY: handleSetApiKey,
  HAS_API_KEY: handleHasApiKey
}
