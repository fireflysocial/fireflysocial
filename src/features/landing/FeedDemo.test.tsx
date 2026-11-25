import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FeedDemo } from './FeedDemo.tsx'

function feedTitles() {
  return within(screen.getByRole('list', { name: 'Example feed' }))
    .getAllByRole('listitem')
    .map((item) => item.querySelector('.feed__title')?.textContent)
}

/** jsdom has no View Transitions API; give the document one that runs the update at once. */
function stubViewTransitions() {
  const startViewTransition = vi.fn((update: () => void) => {
    update()
  })
  Object.defineProperty(document, 'startViewTransition', {
    value: startViewTransition,
    configurable: true,
  })
  return startViewTransition
}

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: reduce, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
}

describe('FeedDemo', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'startViewTransition')
  })

  it('starts with a couple of interests picked and a short, explained feed', () => {
    render(<FeedDemo />)
    expect(screen.getByRole('button', { name: 'Tech & startups' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Outdoors' })).toHaveAttribute('aria-pressed', 'true')
    expect(feedTitles()).toHaveLength(4)
    expect(feedTitles()[0]).toBe('Startup founders meetup')
    expect(screen.getAllByText('Because you like tech & startups')).toHaveLength(2)
  })

  it('re-ranks the feed when the visitor picks an interest', async () => {
    const user = userEvent.setup()
    render(<FeedDemo />)
    await user.click(screen.getByRole('button', { name: 'Crafts' }))
    await user.click(screen.getByRole('button', { name: 'Food & drink' }))
    expect(screen.getByRole('button', { name: 'Crafts' })).toHaveAttribute('aria-pressed', 'true')
    expect(feedTitles()[0]).toBe('Dumpling-making night')
    expect(screen.getByText('Because you like food & drink and crafts')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Top pick: Dumpling-making night')
  })

  it('un-picks on a second tap', async () => {
    const user = userEvent.setup()
    render(<FeedDemo />)
    const tech = screen.getByRole('button', { name: 'Tech & startups' })
    await user.click(tech)
    expect(tech).toHaveAttribute('aria-pressed', 'false')
  })

  it('invites the visitor to pick something when nothing is picked', async () => {
    const user = userEvent.setup()
    render(<FeedDemo />)
    await user.click(screen.getByRole('button', { name: 'Tech & startups' }))
    await user.click(screen.getByRole('button', { name: 'Outdoors' }))
    expect(
      screen.getByText('Pick something you’re into and the list reorders.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Because you like/)).not.toBeInTheDocument()
  })

  it('glides cards to their new places where view transitions are supported', async () => {
    const startViewTransition = stubViewTransitions()
    const user = userEvent.setup()
    render(<FeedDemo />)
    await user.click(screen.getByRole('button', { name: 'Crafts' }))
    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Crafts' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('skips the transition for reduced motion', async () => {
    stubReducedMotion(true)
    const startViewTransition = stubViewTransitions()
    const user = userEvent.setup()
    render(<FeedDemo />)
    await user.click(screen.getByRole('button', { name: 'Crafts' }))
    expect(startViewTransition).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Crafts' })).toHaveAttribute('aria-pressed', 'true')
  })
})
