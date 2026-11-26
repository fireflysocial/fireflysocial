import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FireflyMark } from './FireflyMark.tsx'

describe('FireflyMark', () => {
  it('is an image with an accessible name when given a title', () => {
    render(<FireflyMark title="Firefly" className="mark" />)
    const mark = screen.getByRole('img', { name: 'Firefly' })
    expect(mark).toHaveClass('mark')
    expect(mark).not.toHaveAttribute('aria-hidden')
  })

  it.each([
    ['no title', undefined],
    ['an empty title', ''],
  ])('is decorative and hidden from assistive technology with %s', (_, title) => {
    const { container } = render(<FireflyMark title={title} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('crops to its own extent for a lockup, and keeps its square canvas by default', () => {
    const { container, rerender } = render(<FireflyMark />)
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 512 512')
    rerender(<FireflyMark cropped />)
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '125.7 95 260.6 326')
  })
})
