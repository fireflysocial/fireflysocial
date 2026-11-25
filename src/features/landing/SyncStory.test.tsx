import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WEEKS_SHOWN } from '../../lib/fireflies/story.ts'
import { SyncStory } from './SyncStory.tsx'

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: reduce,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

describe('SyncStory', () => {
  it('starts the caption at the first chapter when motion is allowed', () => {
    stubReducedMotion(false)
    // The story section sits below the fold, so the visitor hasn't scrolled into it yet.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ y: 2000, width: 360, height: 4000 }),
    )
    render(<SyncStory />)
    expect(screen.getByText('People to go with')).toBeInTheDocument()
    expect(screen.queryByText('Example: Tuesday run club')).not.toBeInTheDocument()
  })

  it('shows the end of the story at once for reduced motion', () => {
    stubReducedMotion(true)
    const { container } = render(<SyncStory />)
    expect(screen.getByText('Example: Tuesday run club')).toBeInTheDocument()
    const week = container.querySelector('.story__week')
    expect(week).toHaveAttribute('data-shown', 'true')
    expect(week).toHaveTextContent(`Week${String(WEEKS_SHOWN)}`)
  })
})
