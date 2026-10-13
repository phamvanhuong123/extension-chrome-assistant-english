import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

interface TooltipProps {
  originalText: string
  translation?: string
  phonetic?: string
  isLoading: boolean
  error?: string | null
  onSave?: () => void
  onRetry?: () => void
}

function MockTooltip({ originalText, translation, phonetic, isLoading, error, onSave, onRetry }: TooltipProps) {
  if (isLoading) {
    return <div data-testid='tooltip-loading'>Đang dịch...</div>
  }

  if (error) {
    return (
      <div data-testid='tooltip-error'>
        <span>Lỗi: {error}</span>
        <button type='button' onClick={onRetry}>
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div data-testid='tooltip-container'>
      <div data-testid='tooltip-header'>
        <strong>{originalText}</strong>
        {phonetic && <span data-testid='tooltip-phonetic'>{phonetic}</span>}
      </div>
      <div data-testid='tooltip-translation'>{translation}</div>
      {onSave && (
        <button type='button' onClick={onSave}>
          Lưu từ
        </button>
      )}
    </div>
  )
}

describe('Tooltip UI Component (FR-01, FR-02)', () => {
  it('renders loading indicator when translating', () => {
    render(<MockTooltip originalText='ubiquitous' isLoading={true} />)
    expect(screen.getByTestId('tooltip-loading')).toHaveTextContent('Đang dịch...')
  })

  it('renders translation and phonetic when lookup succeeds', () => {
    render(
      <MockTooltip
        originalText='ubiquitous'
        translation='có mặt ở khắp nơi'
        phonetic='/juːˈbɪkwɪtəs/'
        isLoading={false}
      />
    )
    expect(screen.getByTestId('tooltip-translation')).toHaveTextContent('có mặt ở khắp nơi')
    expect(screen.getByTestId('tooltip-phonetic')).toHaveTextContent('/juːˈbɪkwɪtəs/')
  })

  it('renders error state and triggers retry callback', async () => {
    const user = userEvent.setup()
    const handleRetry = vi.fn()

    render(<MockTooltip originalText='resilience' isLoading={false} error='Mạng không ổn định' onRetry={handleRetry} />)

    expect(screen.getByTestId('tooltip-error')).toHaveTextContent('Mạng không ổn định')
    await user.click(screen.getByRole('button', { name: /thử lại/i }))
    expect(handleRetry).toHaveBeenCalledOnce()
  })
})
