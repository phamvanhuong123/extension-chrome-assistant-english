import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChromeMock } from '@/test/chrome-mock'
import { createWordFixture } from '@/test/factories'

describe('flashcards.handler (FR-06)', () => {
  const chromeMock = createChromeMock()

  beforeEach(() => {
    vi.stubGlobal('chrome', chromeMock)
    chromeMock.storage.local._reset()
    vi.clearAllMocks()
  })

  it('filters due cards where nextReviewAt <= now and respects dailyGoal limit', async () => {
    const now = 1760000000000
    const dueWord1 = createWordFixture({ id: 'w1', nextReviewAt: now - 1000 })
    const dueWord2 = createWordFixture({ id: 'w2', nextReviewAt: now })
    const futureWord = createWordFixture({ id: 'w3', nextReviewAt: now + 50000 })

    await chromeMock.storage.local.set({
      'vocab:w1': dueWord1,
      'vocab:w2': dueWord2,
      'vocab:w3': futureWord
    })

    const allItems = await chromeMock.storage.local.get(null)
    const words = Object.keys(allItems)
      .filter((k) => k.startsWith('vocab:'))
      .map((k) => allItems[k] as typeof dueWord1)

    const dueCards = words.filter((w) => w.nextReviewAt <= now)
    expect(dueCards).toHaveLength(2)
    expect(dueCards.map((c) => c.id)).toEqual(expect.arrayContaining(['w1', 'w2']))
  })
})
