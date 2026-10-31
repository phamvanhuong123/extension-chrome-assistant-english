import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner Component (shared/ui/Spinner)', () => {
  it('renders with default size 14 and aria-hidden', () => {
    const { container } = render(<Spinner />)
    const svg = container.querySelector('svg')

    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '14')
    expect(svg).toHaveAttribute('height', '14')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders with custom size', () => {
    const { container } = render(<Spinner size={24} />)
    const svg = container.querySelector('svg')

    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')
  })

  it('supports accessible status role and aria-label when label is provided', () => {
    render(<Spinner label='Đang tải...' />)
    const spinner = screen.getByRole('status', { name: 'Đang tải...' })

    expect(spinner).toBeInTheDocument()
    expect(spinner).not.toHaveAttribute('aria-hidden')
  })

  it('merges custom className', () => {
    const { container } = render(<Spinner className='custom-spinner' />)
    const svg = container.querySelector('svg')

    expect(svg?.className.baseVal || svg?.getAttribute('class')).toContain('custom-spinner')
  })
})
