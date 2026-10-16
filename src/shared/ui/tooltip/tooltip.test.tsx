import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Tooltip } from './Tooltip'

describe('Tooltip Component (shared/ui/tooltip)', () => {
  it('renders children with accessible tooltip element', () => {
    render(
      <Tooltip content='Test Tooltip Label'>
        <button type='button'>Hover Me</button>
      </Tooltip>
    )

    expect(screen.getByRole('button', { name: 'Hover Me' })).toBeInTheDocument()
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toBeInTheDocument()
    expect(tooltip).toHaveTextContent('Test Tooltip Label')
  })

  it('applies custom alignment and position classes', () => {
    const { rerender } = render(
      <Tooltip content='Start Align' align='start' position='bottom'>
        <button type='button'>Item 1</button>
      </Tooltip>
    )

    let tooltip = screen.getByRole('tooltip')
    expect(tooltip.className).toContain('alignStart')
    expect(tooltip.className).toContain('positionBottom')

    rerender(
      <Tooltip content='End Align' align='end' position='top'>
        <button type='button'>Item 1</button>
      </Tooltip>
    )

    tooltip = screen.getByRole('tooltip')
    expect(tooltip.className).toContain('alignEnd')
    expect(tooltip.className).toContain('positionTop')
  })

  it('renders raw children if content is empty or null', () => {
    const { container } = render(
      <Tooltip content=''>
        <button type='button'>No Tooltip</button>
      </Tooltip>
    )

    expect(screen.getByRole('button', { name: 'No Tooltip' })).toBeInTheDocument()
    expect(container.querySelector('[role="tooltip"]')).toBeNull()
  })
})
