import { act, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { listEvents } from '../../data/events.ts'
import { loadPlans } from '../../data/plans.ts'
import type { CityEvent } from '../../lib/events.ts'
import { EMPTY_PLANS, plansReducer, type PlansAction } from '../../lib/plans.ts'
import { inHours, makeEvent } from '../../test/fixtures.ts'
import { renderApp, vancouverProfile } from '../../test/renderApp.tsx'
import { useAppState, useProfile } from './appState.ts'
import { AppStateProvider } from './AppStateProvider.tsx'

// The events module is the data boundary (CLAUDE.md §6): mocking it lets these tests control
// timing, failures and exactly which events exist.
vi.mock('../../data/events.ts', () => ({ listEvents: vi.fn() }))
const mockedList = vi.mocked(listEvents)

const vancouverEvent = (overrides: Partial<CityEvent> & { id: string }) =>
  makeEvent({
    cityId: 'vancouver',
    timeZone: 'America/Vancouver',
    interests: ['board-games'],
    ...overrides,
  })

const plansWith = (...actions: PlansAction[]) => actions.reduce(plansReducer, EMPTY_PLANS)

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  let reject: (reason: unknown) => void = () => undefined
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  mockedList.mockReset()
})

afterEach(() => {
  localStorage.clear()
})

describe('loading and failure', () => {
  it('shows a loading state, then an error with a working retry', async () => {
    const first = deferred<CityEvent[]>()
    mockedList.mockReturnValueOnce(first.promise)
    const { user } = renderApp('/app/feed', { profile: vancouverProfile() })
    expect(screen.getByRole('status')).toHaveTextContent('Finding this week’s events…')

    await act(async () => {
      first.reject(new Error('offline'))
      await first.promise.catch(() => undefined)
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Couldn’t load events.')

    mockedList.mockResolvedValueOnce([vancouverEvent({ id: 'a', title: 'Games night' })])
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('link', { name: 'Games night' })).toBeInTheDocument()
  })

  it('shows loading on the event and plans pages too', () => {
    mockedList.mockReturnValue(new Promise(() => undefined))
    const first = renderApp('/app/events/a', { profile: vancouverProfile() })
    expect(screen.getByRole('status')).toHaveTextContent('Finding this week’s events…')
    first.unmount()
    renderApp('/app/plans', { profile: vancouverProfile() })
    expect(screen.getByRole('status')).toHaveTextContent('Finding this week’s events…')
  })

  it('ignores a load that finishes after the screen has gone', async () => {
    const ok = deferred<CityEvent[]>()
    const bad = deferred<CityEvent[]>()
    mockedList.mockReturnValueOnce(ok.promise).mockReturnValueOnce(bad.promise)
    renderApp('/app/feed', { profile: vancouverProfile() }).unmount()
    renderApp('/app/feed', { profile: vancouverProfile() }).unmount()
    await act(async () => {
      ok.resolve([])
      bad.reject(new Error('late'))
      await Promise.allSettled([ok.promise, bad.promise])
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('doesn’t show a return prompt for an event it can’t find yet', () => {
    mockedList.mockReturnValue(new Promise(() => undefined))
    renderApp('/app/feed', {
      profile: vancouverProfile(),
      plans: plansWith({ type: 'open-registration', eventId: 'a' }),
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('feed edge cases', () => {
  it('is honest when nothing at all is listed this week', async () => {
    mockedList.mockResolvedValue([
      vancouverEvent({ id: 'far', startsAt: inHours(24 * 10), interests: [], isExample: false }),
    ])
    const { user } = renderApp('/app/feed', { profile: vancouverProfile() })
    await user.click(await screen.findByRole('button', { name: 'Show everything this week' }))
    expect(
      screen.getByRole('heading', { name: 'No events are listed for this week yet.' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/made-up example events/)).not.toBeInTheDocument()
  })
})

describe('quiet cards', () => {
  const upcoming = vancouverEvent({ id: 'up', title: 'Pottery night', startsAt: inHours(5) })
  const ended = vancouverEvent({
    id: 'done',
    title: 'Trivia',
    startsAt: inHours(-5),
    endsAt: inHours(-3),
  })

  it('asks "Did you register?" quietly, and "Did you go?" once after an event', async () => {
    mockedList.mockResolvedValue([upcoming, ended])
    const plans = plansWith(
      { type: 'open-registration', eventId: 'up' },
      { type: 'dismiss-return' },
      { type: 'answer-going', eventId: 'done', answer: 'going' },
    )
    const { user } = renderApp('/app/feed', { profile: vancouverProfile(), plans })
    const quiet = within(await screen.findByRole('region', { name: 'Waiting for your answer' }))
    expect(quiet.getByRole('link', { name: 'Pottery night' })).toHaveAttribute(
      'href',
      '/app/events/up',
    )
    expect(quiet.getByText('Did you go to Trivia? How was it?')).toBeInTheDocument()

    await user.click(quiet.getByRole('button', { name: 'Good' }))
    expect(loadPlans().afterEvent).toEqual({ done: 'good' })
    await user.click(quiet.getByRole('button', { name: 'Yes, I’m going' }))
    expect(
      screen.queryByRole('region', { name: 'Waiting for your answer' }),
    ).not.toBeInTheDocument()
  })
})

describe('event timing on the event page', () => {
  it('says when an event has started or ended', async () => {
    const event = vancouverEvent({ id: 'e', startsAt: inHours(-1), endsAt: inHours(1) })
    mockedList.mockResolvedValue([event])
    const first = renderApp('/app/events/e', { profile: vancouverProfile() })
    expect(await screen.findByText('This event has started.')).toBeInTheDocument()
    first.unmount()
    renderApp('/app/events/e', {
      profile: vancouverProfile(),
      now: new Date(Date.parse(inHours(2))),
    })
    expect(await screen.findByText('This event has ended.')).toBeInTheDocument()
  })
})

describe('plans', () => {
  it('lists upcoming going and saved events, owner-only, with empty states', async () => {
    mockedList.mockResolvedValue([
      vancouverEvent({ id: 'go', title: 'Run club', startsAt: inHours(5) }),
      vancouverEvent({ id: 'save', title: 'Book club', startsAt: inHours(6) }),
      vancouverEvent({ id: 'past', title: 'Old', startsAt: inHours(-5), endsAt: inHours(-3) }),
    ])
    const plans = plansWith(
      { type: 'answer-going', eventId: 'go', answer: 'going' },
      { type: 'toggle-save', eventId: 'go' },
      { type: 'toggle-save', eventId: 'save' },
      { type: 'toggle-save', eventId: 'past' },
      { type: 'answer-going', eventId: 'past', answer: 'going' },
    )
    const first = renderApp('/app/plans', { profile: vancouverProfile(), plans })
    expect(screen.getByText('Only you can see this')).toBeInTheDocument()
    const going = within(await screen.findByRole('region', { name: 'Going' }))
    expect(going.getAllByRole('link').map((a) => a.textContent)).toEqual(['Run club'])
    const saved = within(screen.getByRole('region', { name: 'Saved' }))
    expect(saved.getAllByRole('link').map((a) => a.textContent)).toEqual(['Book club'])
    first.unmount()

    renderApp('/app/plans', { profile: vancouverProfile() })
    expect(await screen.findByText(/Nothing yet. When you register/)).toBeInTheDocument()
    expect(screen.getByText('Events you save show up here.')).toBeInTheDocument()
  })
})

describe('app state hooks', () => {
  function UsesState() {
    useAppState()
    return null
  }
  function UsesProfile() {
    useProfile()
    return null
  }

  it('fail loudly when used in the wrong place', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockedList.mockReturnValue(new Promise(() => undefined))
    expect(() => render(<UsesState />)).toThrow('inside <AppStateProvider>')
    expect(() =>
      render(
        <AppStateProvider>
          <UsesProfile />
        </AppStateProvider>,
      ),
    ).toThrow('only for screens shown after onboarding')
  })
})
