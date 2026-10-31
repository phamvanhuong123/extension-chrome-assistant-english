import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Toast } from './Toast'
import { useToastState } from './useToastState'

describe('Toast Component (shared/ui/Toast)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders message text with accessible status role and polite live region', () => {
    render(<Toast message='Đã xóa từ vựng' />)
    const toast = screen.getByRole('status')

    expect(toast).toBeInTheDocument()
    expect(toast).toHaveAttribute('aria-live', 'polite')
    expect(toast).toHaveTextContent('Đã xóa từ vựng')
  })

  it('renders action button and calls action.onClick and onDismiss when clicked', async () => {
    const handleAction = vi.fn()
    const handleDismiss = vi.fn()

    render(
      <Toast message='Đã xóa mục' action={{ label: 'Hoàn tác', onClick: handleAction }} onDismiss={handleDismiss} />
    )

    const actionBtn = screen.getByRole('button', { name: 'Hoàn tác' })
    expect(actionBtn).toBeInTheDocument()

    // Test click with fake timers
    actionBtn.click()

    expect(handleAction).toHaveBeenCalledTimes(1)
    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss automatically after duration (default 5000ms)', () => {
    const handleDismiss = vi.fn()

    render(<Toast message='Tự động biến mất' onDismiss={handleDismiss} />)

    expect(handleDismiss).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(4999)
    })
    expect(handleDismiss).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })

  it('cleans up timer on unmount', () => {
    const handleDismiss = vi.fn()

    const { unmount } = render(<Toast message='Unmount test' onDismiss={handleDismiss} />)

    unmount()

    act(() => {
      vi.advanceTimersByTime(6000)
    })
    expect(handleDismiss).not.toHaveBeenCalled()
  })

  it('supports useToastState hook to show and hide toast', () => {
    function TestConsumer() {
      const { toast, showToast, hideToast } = useToastState()

      return (
        <div>
          <button type='button' onClick={() => showToast('Thông báo mới', { label: 'Undo', onClick: vi.fn() })}>
            Show
          </button>
          <button type='button' onClick={hideToast}>
            Hide
          </button>
          {toast.visible && <Toast message={toast.message} action={toast.action} onDismiss={hideToast} />}
        </div>
      )
    }

    render(<TestConsumer />)

    expect(screen.queryByRole('status')).toBeNull()

    const showBtn = screen.getByRole('button', { name: 'Show' })
    act(() => {
      showBtn.click()
    })

    expect(screen.getByRole('status')).toHaveTextContent('Thông báo mới')
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()

    const hideBtn = screen.getByRole('button', { name: 'Hide' })
    act(() => {
      hideBtn.click()
    })

    expect(screen.queryByRole('status')).toBeNull()
  })
})
