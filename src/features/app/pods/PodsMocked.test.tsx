import { act, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { listEvents } from '../../../data/events.ts'
import { getPod, type PodView } from '../../../data/pods.ts'
import { EMPTY_PLANS, plansReducer } from '../../../lib/plans.ts'
import {
  connectionsReducer,
  EMPTY_CONNECTIONS,
  type ConnectionsAction,
} from '../../../lib/pods/connections.ts'
import { inHours, makeEvent } from '../../../test/fixtures.ts'
import { renderApp, vancouverProfile } from '../../../test/renderApp.tsx'

// The data boundary (CLAUDE.md §6): control which events exist and what the pod job returns.
vi.mock('../../../data/events.ts', () => ({ listEvents: vi.fn() }))
vi.mock('../../../data/pods.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../data/pods.ts')>()),
  getPod: vi.fn(),
}))

const real = makeEvent({
  id: 'real',
  cityId: 'vancouver',
  timeZone: 'America/Vancouver',
  title: 'Real meetup',
  isExample: false,
  startsAt: inHours(2),
  endsAt: inHours(4),
})
const plans = plansReducer(EMPTY_PLANS, { type: 'answer-going', eventId: 'real', answer: 'going' })
const state = (...actions: ConnectionsAction[]) =>
  [
    {
      type: 'opt-in',
      eventId: 'real',
      optIn: { intents: ['make-friends'], mode: 'group' },
      podAnswer: { prompt: 'Ask me about', answer: 'maps' },
    } satisfies ConnectionsAction,
    ...actions,
  ].reduce(connectionsReducer, EMPTY_CONNECTIONS)

beforeEach(() => {
  vi.mocked(listEvents).mockResolvedValue([real])
})

afterEach(() => {
  localStorage.clear()
  vi.mocked(getPod).mockReset()
})

describe('pods with real events', () => {
  it('says "No pod this time", with no detail about who else was there', async () => {
    vi.mocked(getPod).mockResolvedValue({ kind: 'none' })
    renderApp('/app/events/real/pod', { profile: vancouverProfile(), plans, connections: state() })
    expect(await screen.findByRole('heading', { name: 'No pod this time.' })).toBeInTheDocument()
  })

  it('shows a loading state while the pod is found, and no demo controls on a real event', async () => {
    let resolve: (view: PodView) => void = () => undefined
    vi.mocked(getPod).mockReturnValue(new Promise((r) => (resolve = r)))
    const view = renderApp('/app/events/real/pod', {
      profile: vancouverProfile(),
      plans,
      connections: state(),
    })
    expect(await screen.findByText('Finding your pod…')).toBeInTheDocument()
    await act(async () => {
      resolve({
        kind: 'pod',
        podWord: 'Cedar',
        reason: 'You’re here for similar reasons.',
        mates: [],
        isExample: false,
      })
      await Promise.resolve()
    })
    expect(screen.getByRole('heading', { name: 'Pod Cedar' })).toBeInTheDocument()
    expect(screen.queryByText(/made up/)).not.toBeInTheDocument()
    expect(screen.queryByText('Example only')).not.toBeInTheDocument()
    view.unmount()
  })

  it('ignores a pod that arrives after the page has gone', async () => {
    let resolve: (view: PodView) => void = () => undefined
    vi.mocked(getPod).mockReturnValue(new Promise((r) => (resolve = r)))
    const view = renderApp('/app/events/real/pod', {
      profile: vancouverProfile(),
      plans,
      connections: state(),
    })
    await screen.findByText('Finding your pod…')
    view.unmount()
    await act(async () => {
      resolve({ kind: 'none' })
      await Promise.resolve()
    })
    expect(screen.queryByRole('heading', { name: 'No pod this time.' })).not.toBeInTheDocument()
  })

  it('can’t rejoin once the event has started', async () => {
    vi.mocked(getPod).mockResolvedValue({ kind: 'none' })
    renderApp('/app/events/real/pod', {
      profile: vancouverProfile(),
      plans,
      connections: state({ type: 'leave', eventId: 'real' }),
      now: new Date(Date.parse(inHours(3))),
    })
    expect(
      await screen.findByRole('heading', { name: 'You’ve left this pod.' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rejoin' })).not.toBeInTheDocument()
  })

  it('shows no demo skip on a real event that’s waiting for its pod', async () => {
    vi.mocked(listEvents).mockResolvedValue([
      { ...real, startsAt: inHours(48), endsAt: inHours(50) },
    ])
    renderApp('/app/events/real', { profile: vancouverProfile(), plans, connections: state() })
    expect(await screen.findByText(/You’re in. Your pod forms/)).toBeInTheDocument()
    expect(screen.queryByText('Example only')).not.toBeInTheDocument()
  })
})
