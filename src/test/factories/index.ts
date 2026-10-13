export interface WordFixture {
  id: string
  text: string
  normalizedText: string
  translation: string
  phonetic?: string
  partOfSpeech?: string
  context?: string
  sourceUrl?: string
  sourceLang: string
  targetLang: string
  createdAt: number
  updatedAt: number
  reviewCount: number
  lapseCount: number
  srsStep: number
  lastReviewedAt?: number
  nextReviewAt: number
}

export interface DailyStatFixture {
  date: string
  wordsLookedUp: number
  wordsSaved: number
  cardsReviewed: number
  correctCount: number
  summariesUsed: number
}

export interface SettingsFixture {
  sourceLang: string
  targetLang: string
  uiLanguage: 'vi' | 'en'
  aiEnabled: boolean
  aiProvider?: 'openai' | 'anthropic' | 'custom'
  tooltipTrigger: 'auto' | 'icon'
  dailyGoal: number
  theme: 'system' | 'light' | 'dark'
}

let wordCounter = 0

export function createWordFixture(overrides: Partial<WordFixture> = {}): WordFixture {
  wordCounter += 1
  return {
    id: `test-word-${wordCounter}`,
    text: 'ubiquitous',
    normalizedText: 'ubiquitous',
    translation: 'có mặt ở khắp nơi',
    phonetic: '/juːˈbɪkwɪtəs/',
    partOfSpeech: 'adjective',
    context: 'Smartphones have become ubiquitous in modern life.',
    sourceUrl: 'https://example.com/article',
    sourceLang: 'en',
    targetLang: 'vi',
    createdAt: 1760000000000,
    updatedAt: 1760000000000,
    reviewCount: 0,
    lapseCount: 0,
    srsStep: 0,
    nextReviewAt: 1760000000000,
    ...overrides
  }
}

export function createDailyStatFixture(overrides: Partial<DailyStatFixture> = {}): DailyStatFixture {
  return {
    date: '2026-10-13',
    wordsLookedUp: 10,
    wordsSaved: 3,
    cardsReviewed: 8,
    correctCount: 7,
    summariesUsed: 1,
    ...overrides
  }
}

export function createSettingsFixture(overrides: Partial<SettingsFixture> = {}): SettingsFixture {
  return {
    sourceLang: 'en',
    targetLang: 'vi',
    uiLanguage: 'vi',
    aiEnabled: false,
    tooltipTrigger: 'auto',
    dailyGoal: 10,
    theme: 'system',
    ...overrides
  }
}

export function resetFixtureCounters(): void {
  wordCounter = 0
}
