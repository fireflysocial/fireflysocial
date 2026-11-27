import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { loadPlans } from '../../../data/plans.ts'
import { EMPTY_PLANS, plansReducer } from '../../../lib/plans.ts'
import { renderApp, vancouverProfile } from '../../../test/renderApp.tsx'

afterEach(() => {
  localStorage.clear()
})

const rows = () =>
  within(screen.getByRole('list', { name: 'Events for you this week' })).getAllByRole('listitem')

/** The top row of the feed; fails clearly if the feed is empty. */
function firstRow(): HTMLElement {
  const [row] = rows()
  if (!row) throw new Error('the feed has no rows')
  return row
}

describe('the personal feed', () => {
  it('lists this week’s example events for the person, each saying why, labelled as made up', async () => {
    renderApp('/app/feed', { profile: vancouverProfile() })
    expect(await screen.findByText(/made-up example events/)).toBeInTheDocument()
    expect(within(firstRow()).getByText(/^Because you like /)).toBeInTheDocument()
    // Only the best fit carries the Glow dot.
    expect(document.querySelectorAll('.reason .dot')).toHaveLength(1)
  })

  it('saves and asks for more like this, and both can be undone', async () => {
    const { user } = renderApp('/app/feed', { profile: vancouverProfile() })
    await screen.findByText(/made-up example events/)
    const row = within(firstRow())
    await user.click(row.getByRole('button', { name: 'Save' }))
    expect(row.getByRole('button', { name: 'Saved' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(row.getByRole('button', { name: 'More like this' }))
    expect(row.getByRole('button', { name: 'More like this' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(Object.values(loadPlans().feedback)).toEqual([{ kind: 'more' }])
    await user.click(row.getByRole('button', { name: 'More like this' }))
    await user.click(row.getByRole('button', { name: 'Saved' }))
    expect(loadPlans().saved).toEqual([])
    expect(loadPlans().feedback).toEqual({})
  })

  it('hides an event with "Not for me", asks why (optionally) and can undo', async () => {
    const { user } = renderApp('/app/feed', { profile: vancouverProfile() })
    await screen.findByText(/made-up example events/)
    const count = rows().length
    const title = within(firstRow()).getAllByRole('link')[0]?.textContent ?? ''
    await user.click(within(firstRow()).getByRole('button', { name: 'Not for me' }))
    expect(screen.getByText(`Hidden: ${title}. What was off? (optional)`)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Too far' }))
    expect(screen.getByText(`Hidden: ${title}. Thanks, that helps.`)).toBeInTheDocument()
    expect(Object.values(loadPlans().feedback)).toEqual([{ kind: 'not-for-me', reason: 'too-far' }])
    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(rows()).toHaveLength(count)
    expect(loadPlans().feedback).toEqual({})
  })

  it('leaves out events hidden on an earlier visit', async () => {
    const first = renderApp('/app/feed', { profile: vancouverProfile() })
    await screen.findByText(/made-up example events/)
    const count = rows().length
    await first.user.click(within(firstRow()).getByRole('button', { name: 'Not for me' }))
    const plans = loadPlans()
    first.unmount()
    renderApp('/app/feed', { profile: vancouverProfile(), plans })
    await screen.findByText(/made-up example events/)
    expect(rows()).toHaveLength(count - 1)
  })

  it('says when nothing fits, then shows everything on request', async () => {
    const { user } = renderApp('/app/feed', {
      profile: vancouverProfile({ interests: ['hiking', 'drawing', 'yoga'] }),
    })
    expect(
      await screen.findByRole('heading', { name: 'Nothing fits this week.' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Show everything this week' }))
    expect(
      screen.getByText('Nothing matched your answers, so here’s everything this week.'),
    ).toBeInTheDocument()
    expect(rows().length).toBeGreaterThan(5)
    expect(within(firstRow()).getByText(/^Something different · /)).toBeInTheDocument()
  })

  it('notes accessibility only when the person set a need, never assuming it', async () => {
    renderApp('/app/feed', { profile: vancouverProfile({ accessNeeds: ['step-free'] }) })
    expect(await screen.findAllByText('Step-free, per the organiser')).not.toHaveLength(0)
    expect(screen.getAllByText('Accessibility not listed')[0]).toHaveClass('small--muted')
  })

  it('marks events the person is going to', async () => {
    const first = renderApp('/app/feed', { profile: vancouverProfile() })
    await screen.findByText(/made-up example events/)
    const href = within(firstRow()).getAllByRole('link')[0]?.getAttribute('href') ?? ''
    first.unmount()
    const eventId = decodeURIComponent(href.split('/').pop() ?? '')
    const plans = plansReducer(EMPTY_PLANS, { type: 'answer-going', eventId, answer: 'going' })
    renderApp('/app/feed', { profile: vancouverProfile(), plans })
    expect(await screen.findByText('You’re going')).toBeInTheDocument()
  })
})
