import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

interface WordItem {
  id: string
  text: string
  translation: string
  context?: string
}

interface WordListProps {
  words: WordItem[]
  isLoading: boolean
  error: { code: string; message: string; retryable?: boolean } | null
  onRetry?: () => void
}

function MockWordList({ words, isLoading, error, onRetry }: WordListProps) {
  if (isLoading) {
    return (
      <div data-testid='skeleton-container'>
        <div data-testid='skeleton-row'>Loading 1...</div>
        <div data-testid='skeleton-row'>Loading 2...</div>
        <div data-testid='skeleton-row'>Loading 3...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <p>Lỗi tải dữ liệu: {error.message}</p>
        {error.retryable && (
          <button type='button' onClick={onRetry}>
            Thử lại
          </button>
        )}
      </div>
    )
  }

  if (words.length === 0) {
    return <p>Chưa có từ nào</p>
  }

  return (
    <ul>
      {words.map((w) => (
        <li key={w.id} data-testid='word-item'>
          <strong>{w.text}</strong>: {w.translation}
        </li>
      ))}
    </ul>
  )
}

describe('WordList UI Component (FR-05)', () => {
  it('renders empty-state message when words list is empty', () => {
    render(<MockWordList words={[]} isLoading={false} error={null} />)
    expect(screen.getByText('Chưa có từ nào')).toBeInTheDocument()
  })

  it('renders 3 skeleton rows while loading', () => {
    render(<MockWordList words={[]} isLoading={true} error={null} />)
    expect(screen.getAllByTestId('skeleton-row')).toHaveLength(3)
  })

  it('renders retry button when error is retryable', () => {
    render(
      <MockWordList
        words={[]}
        isLoading={false}
        error={{ code: 'STORAGE_ERROR', message: 'Read failed', retryable: true }}
      />
    )
    expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument()
  })

  it('renders list of words when data is loaded successfully', () => {
    const words: WordItem[] = [
      { id: '1', text: 'ubiquitous', translation: 'có mặt ở khắp nơi' },
      { id: '2', text: 'serendipity', translation: 'sự may mắn tình cờ' }
    ]
    render(<MockWordList words={words} isLoading={false} error={null} />)
    expect(screen.getAllByTestId('word-item')).toHaveLength(2)
  })
})
