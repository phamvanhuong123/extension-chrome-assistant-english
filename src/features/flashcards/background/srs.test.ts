import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Pure logic SRS algorithm tests based on PRD FR-07 and DATA-SCHEMA §4.1
// SRS ladder days: [1, 3, 7, 14, 30]
export const SRS_LADDER_DAYS = [1, 3, 7, 14, 30]

export type Rating = 'again' | 'good' | 'easy'

export interface SrsState {
  srsStep: number
  lapseCount: number
  reviewCount: number
  lastReviewedAt?: number
  nextReviewAt: number
}

export function computeNextReview(
  state: Pick<SrsState, 'srsStep' | 'lapseCount' | 'reviewCount'>,
  rating: Rating,
  now: number = Date.now()
): SrsState {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000

  if (rating === 'again') {
    return {
      srsStep: 0,
      lapseCount: state.lapseCount + 1,
      reviewCount: state.reviewCount + 1,
      lastReviewedAt: now,
      nextReviewAt: now + SRS_LADDER_DAYS[0] * ONE_DAY_MS
    }
  }

  const stepIncrement = rating === 'easy' ? 2 : 1
  const nextStep = Math.min(state.srsStep + stepIncrement, SRS_LADDER_DAYS.length - 1)

  return {
    srsStep: nextStep,
    lapseCount: state.lapseCount,
    reviewCount: state.reviewCount + 1,
    lastReviewedAt: now,
    nextReviewAt: now + SRS_LADDER_DAYS[nextStep] * ONE_DAY_MS
  }
}

describe('SRS algorithm (computeNextReview - FR-07)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resets srsStep to 0, increments lapseCount and sets nextReviewAt to 1 day on "again"', () => {
    const fixedNow = new Date('2026-10-13T00:00:00Z').getTime()
    vi.setSystemTime(fixedNow)

    const initial = { srsStep: 2, lapseCount: 0, reviewCount: 3 }
    const result = computeNextReview(initial, 'again', fixedNow)

    expect(result.srsStep).toBe(0)
    expect(result.lapseCount).toBe(1)
    expect(result.reviewCount).toBe(4)
    expect(result.lastReviewedAt).toBe(fixedNow)
    expect(result.nextReviewAt).toBe(fixedNow + 1 * 24 * 60 * 60 * 1000)
  })

  it('increments srsStep by 1 on "good" without changing lapseCount', () => {
    const fixedNow = new Date('2026-10-13T00:00:00Z').getTime()
    const initial = { srsStep: 1, lapseCount: 0, reviewCount: 2 }
    const result = computeNextReview(initial, 'good', fixedNow)

    expect(result.srsStep).toBe(2)
    expect(result.lapseCount).toBe(0)
    expect(result.reviewCount).toBe(3)
    expect(result.nextReviewAt).toBe(fixedNow + SRS_LADDER_DAYS[2] * 24 * 60 * 60 * 1000)
  })

  it('increments srsStep by 2 on "easy" (skip ladder step)', () => {
    const fixedNow = new Date('2026-10-13T00:00:00Z').getTime()
    const initial = { srsStep: 0, lapseCount: 0, reviewCount: 1 }
    const result = computeNextReview(initial, 'easy', fixedNow)

    expect(result.srsStep).toBe(2)
    expect(result.nextReviewAt).toBe(fixedNow + SRS_LADDER_DAYS[2] * 24 * 60 * 60 * 1000)
  })

  it('caps srsStep at max step (index 4 = 30 days) on repeated good ratings', () => {
    const fixedNow = new Date('2026-10-13T00:00:00Z').getTime()
    const initial = { srsStep: 4, lapseCount: 0, reviewCount: 10 }
    const result = computeNextReview(initial, 'good', fixedNow)

    expect(result.srsStep).toBe(4)
    expect(result.nextReviewAt).toBe(fixedNow + 30 * 24 * 60 * 60 * 1000)
  })
})
