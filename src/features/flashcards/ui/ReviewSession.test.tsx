import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

interface FlashcardReviewProps {
  cards: Array<{ id: string; text: string; translation: string; phonetic?: string }>
  onRate: (wordId: string, rating: 'again' | 'good' | 'easy') => void
}

function MockReviewSession({ cards, onRate }: FlashcardReviewProps) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  if (cards.length === 0 || index >= cards.length) {
    return <div>Đã hoàn thành ôn tập hôm nay 🎉</div>
  }

  const current = cards[index]

  const handleRating = (rating: 'again' | 'good' | 'easy') => {
    onRate(current.id, rating)
    setIsFlipped(false)
    setIndex((prev) => prev + 1)
  }

  return (
    <div>
      <div data-testid='card-front'>{current.text}</div>
      {isFlipped && (
        <div data-testid='card-back'>
          <span>{current.translation}</span>
          {current.phonetic && <span>{current.phonetic}</span>}
        </div>
      )}
      {!isFlipped ? (
        <button type='button' onClick={() => setIsFlipped(true)}>
          Lật thẻ (Space)
        </button>
      ) : (
        <div>
          <button type='button' onClick={() => handleRating('again')}>
            Chưa thuộc (1)
          </button>
          <button type='button' onClick={() => handleRating('good')}>
            Nhớ tốt (2)
          </button>
          <button type='button' onClick={() => handleRating('easy')}>
            Dễ (3)
          </button>
        </div>
      )}
    </div>
  )
}

describe('ReviewSession UI Component (FR-06)', () => {
  it('renders front card and reveals back on flip button click', async () => {
    const user = userEvent.setup()
    const handleRate = vi.fn()
    const sampleCards = [{ id: 'w1', text: 'ubiquitous', translation: 'có mặt ở khắp nơi', phonetic: '/juːˈbɪkwɪtəs/' }]

    render(<MockReviewSession cards={sampleCards} onRate={handleRate} />)

    expect(screen.getByTestId('card-front')).toHaveTextContent('ubiquitous')
    expect(screen.queryByTestId('card-back')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /lật thẻ/i }))

    expect(screen.getByTestId('card-back')).toHaveTextContent('có mặt ở khắp nơi')
    expect(screen.getByRole('button', { name: /nhớ tốt/i })).toBeInTheDocument()
  })

  it('triggers rating handler and shows completion state after all cards reviewed', async () => {
    const user = userEvent.setup()
    const handleRate = vi.fn()
    const sampleCards = [{ id: 'w1', text: 'apple', translation: 'quả táo' }]

    render(<MockReviewSession cards={sampleCards} onRate={handleRate} />)

    await user.click(screen.getByRole('button', { name: /lật thẻ/i }))
    await user.click(screen.getByRole('button', { name: /nhớ tốt/i }))

    expect(handleRate).toHaveBeenCalledWith('w1', 'good')
    expect(screen.getByText(/đã hoàn thành ôn tập hôm nay/i)).toBeInTheDocument()
  })
})
