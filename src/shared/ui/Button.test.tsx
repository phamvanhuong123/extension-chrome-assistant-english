import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button Component (shared/ui/Button)', () => {
  it('renders children with default secondary variant and md size', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })

    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
    expect(button.className).toContain('secondary')
    expect(button.className).toContain('md')
  })

  it('applies custom variant classes', () => {
    const { rerender } = render(<Button variant='primary'>Primary</Button>)
    let button = screen.getByRole('button', { name: 'Primary' })
    expect(button.className).toContain('primary')

    rerender(<Button variant='ghost'>Ghost</Button>)
    button = screen.getByRole('button', { name: 'Ghost' })
    expect(button.className).toContain('ghost')

    rerender(<Button variant='destructive'>Delete</Button>)
    button = screen.getByRole('button', { name: 'Delete' })
    expect(button.className).toContain('destructive')
  })

  it('applies custom sizes', () => {
    const { rerender } = render(<Button size='sm'>Small</Button>)
    let button = screen.getByRole('button', { name: 'Small' })
    expect(button.className).toContain('sm')

    rerender(<Button size='lg'>Large</Button>)
    button = screen.getByRole('button', { name: 'Large' })
    expect(button.className).toContain('lg')
  })

  it('triggers onClick when clicked by user', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Action</Button>)
    const button = screen.getByRole('button', { name: 'Action' })

    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled and prevents click when disabled=true', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Disabled' })

    expect(button).toBeDisabled()
    expect(button.className).toContain('disabled')

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('handles loading state with aria-busy, renders spinner, and disables clicks', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button isLoading onClick={handleClick}>
        Save
      </Button>
    )
    const button = screen.getByRole('button', { name: 'Save' })

    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    expect(button.querySelector('svg')).toBeInTheDocument()

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders left and right icons, swapping leftIcon with spinner on loading', () => {
    const { rerender } = render(
      <Button leftIcon={<span data-testid='left-icon'>L</span>} rightIcon={<span data-testid='right-icon'>R</span>}>
        Icon Button
      </Button>
    )

    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()

    rerender(
      <Button
        isLoading
        leftIcon={<span data-testid='left-icon'>L</span>}
        rightIcon={<span data-testid='right-icon'>R</span>}
      >
        Icon Button
      </Button>
    )

    expect(screen.queryByTestId('left-icon')).toBeNull()
    expect(screen.queryByTestId('right-icon')).toBeNull()
    const button = screen.getByRole('button', { name: 'Icon Button' })
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('supports isIconOnly button with aria-label', () => {
    render(
      <Button isIconOnly aria-label='Settings'>
        <span data-testid='gear-icon'>⚙</span>
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Settings' })
    expect(button.className).toContain('iconOnly')
    expect(screen.getByTestId('gear-icon')).toBeInTheDocument()
  })
})
