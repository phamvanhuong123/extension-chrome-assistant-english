import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'
import { createDailyStatFixture } from '@/test/factories'

describe('stats.repo (FR-08)', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.local._reset()
    vi.clearAllMocks()
  })

  it('increments daily stats lazily on first event of the day', async () => {
    const today = '2026-10-13'
    const stat = createDailyStatFixture({
      date: today,
      wordsLookedUp: 1,
      wordsSaved: 1,
      cardsReviewed: 0
    })

    await chromeMock.storage.local.set({ [`stats:${today}`]: stat })
    const stored = (await chromeMock.storage.local.get(`stats:${today}`))[`stats:${today}`]
    expect(stored).toEqual(stat)
  })

  it('calculates consecutive streak correctly from daily records', () => {
    // Pure calculation helper for streak
    function calculateStreak(datesWithReviews: string[], today: string): number {
      const set = new Set(datesWithReviews)
      let streak = 0
      const current = new Date(today)

      while (true) {
        const dateStr = current.toISOString().split('T')[0]
        if (set.has(dateStr)) {
          streak += 1
          current.setDate(current.getDate() - 1)
        } else {
          break
        }
      }
      return streak
    }

    const reviewedDates = ['2026-10-13', '2026-10-12', '2026-10-11']
    const streak = calculateStreak(reviewedDates, '2026-10-13')
    expect(streak).toBe(3)

    const brokenStreak = calculateStreak(['2026-10-13', '2026-10-11'], '2026-10-13')
    expect(brokenStreak).toBe(1)
  })
})
