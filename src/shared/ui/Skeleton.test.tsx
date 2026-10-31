import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from './Skeleton'

describe('Skeleton Component (shared/ui/Skeleton)', () => {
  it('renders default variant text with aria-hidden', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.firstChild as HTMLElement

    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
    expect(skeleton.className).toContain('text')
  })

  it('renders rect and circle variants', () => {
    const { container, rerender } = render(<Skeleton variant='rect' />)
    let skeleton = container.firstChild as HTMLElement
    expect(skeleton.className).toContain('rect')

    rerender(<Skeleton variant='circle' width={40} />)
    skeleton = container.firstChild as HTMLElement
    expect(skeleton.className).toContain('circle')
    expect(skeleton.style.width).toBe('40px')
    expect(skeleton.style.height).toBe('40px')
  })

  it('applies custom dimensions in string and number formats', () => {
    const { container } = render(<Skeleton width='80%' height={24} />)
    const skeleton = container.firstChild as HTMLElement

    expect(skeleton.style.width).toBe('80%')
    expect(skeleton.style.height).toBe('24px')
  })

  it('applies custom borderRadius', () => {
    const { container } = render(<Skeleton borderRadius='12px' />)
    const skeleton = container.firstChild as HTMLElement

    expect(skeleton.style.borderRadius).toBe('12px')
  })

  it('merges custom className and style', () => {
    const { container } = render(<Skeleton className='custom-skeleton' style={{ marginTop: '10px' }} />)
    const skeleton = container.firstChild as HTMLElement

    expect(skeleton.className).toContain('custom-skeleton')
    expect(skeleton.style.marginTop).toBe('10px')
  })
})
