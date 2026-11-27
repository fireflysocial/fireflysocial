import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { loadConnections } from '../../../data/connections.ts'
import { exampleEvents } from '../../../data/exampleEvents.ts'
import { LAUNCH_CITY } from '../../../lib/cities.ts'
import { EMPTY_PLANS, plansReducer } from '../../../lib/plans.ts'
import {
  connectionsReducer,
  EMPTY_CONNECTIONS,
  type ConnectionsAction,
} from '../../../lib/pods/connections.ts'
import { NOW } from '../../../test/fixtures.ts'
import { renderApp, vancouverProfile } from '../../../test/renderApp.tsx'

afterEach(() => {
  localStorage.clear()
})

const events = exampleEvents(LAUNCH_CITY, NOW)
const find = (slug: string) => {
  const event = events.find((e) => e.id.includes(`-${slug}-`))
  if (!event) throw new Error(`no example event ${slug}`)
  return event
}
// Three days away: the pod hasn't formed, so the invite is open.
const later = find('language-exchange')
// Under a day away: pods have already formed.
const soon = find('founders-coffee')
const eventPath = `/app/events/${encodeURIComponent(later.id)}`
const going = (...ids: string[]) =>
  ids.reduce(
    (p, id) => plansReducer(p, { type: 'answer-going', eventId: id, answer: 'going' }),
    EMPTY_PLANS,
  )
/** The first match; fails clearly when there's none. */
function first<T>(items: readonly T[]): T {
  const [item] = items
  if (item === undefined) throw new Error('nothing matched')
  return item
}
const connections = (...actions: ConnectionsAction[]) =>
  actions.reduce(connectionsReducer, EMPTY_CONNECTIONS)
const optedIn = (...more: ConnectionsAction[]) =>
  connections(
    {
      type: 'opt-in',
      eventId: later.id,
      optIn: { intents: ['open-to-anything'], mode: 'group' },
      podAnswer: { prompt: 'Ask me about', answer: 'old maps' },
    },
    ...more,
  )
const profile = vancouverProfile({ intents: ['collaborators', 'cofounder', 'friends'] })

describe('meeting people on an event page', () => {
  it('is only offered once the person says they’re going', async () => {
    renderApp(eventPath, { profile })
    await screen.findByRole('heading', { name: later.title })
    expect(screen.queryByRole('heading', { name: 'Meeting people' })).not.toBeInTheDocument()
  })

  it('asks, and "Not this time" can be changed', async () => {
    const { user } = renderApp(eventPath, { profile, plans: going(later.id) })
    expect(await screen.findByText(/Open to meeting people at this event\?/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Not this time' }))
    expect(screen.getByText(/No pod for this one/)).toBeInTheDocument()
    expect(loadConnections().optIns).toEqual({ [later.id]: 'declined' })
    await user.click(screen.getByRole('button', { name: 'Change my mind' }))
    expect(screen.getByRole('link', { name: 'Yes, I’m open' })).toBeInTheDocument()
  })

  it('says when pods have already closed', async () => {
    renderApp(`/app/events/${encodeURIComponent(soon.id)}`, { profile, plans: going(soon.id) })
    expect(await screen.findByText('Pods for this event have closed.')).toBeInTheDocument()
  })
})

describe('opting in', () => {
  it('prefills intents (two at most), asks one prompt, and refuses contact details', async () => {
    const { user, router } = renderApp(`${eventPath}/meet`, { profile, plans: going(later.id) })
    const intents = within(
      await screen.findByRole('group', { name: 'What you want out of this event' }),
    )
    expect(intents.getByRole('button', { name: 'Find collaborators' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(intents.getByRole('button', { name: 'Meet a co-founder' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(intents.getByRole('button', { name: 'Make friends' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await user.click(intents.getByRole('button', { name: 'Make friends' }))
    // A third pick drops the oldest.
    expect(intents.getByRole('button', { name: 'Find collaborators' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await user.click(intents.getByRole('button', { name: 'Make friends' }))
    await user.click(intents.getByRole('button', { name: 'Meet a co-founder' }))
    expect(screen.getByRole('button', { name: /Put me in a pod/ })).toBeDisabled()
    await user.click(intents.getByRole('button', { name: 'Make friends' }))

    await user.click(screen.getByRole('button', { name: 'One person first' }))
    await user.click(screen.getByRole('button', { name: 'A small group' }))
    await user.click(screen.getByRole('button', { name: 'Ask me about' }))
    const answer = screen.getByLabelText('Ask me about…')
    await user.type(answer, 'find me @alex')
    await user.click(screen.getByRole('button', { name: /Put me in a pod/ }))
    expect(screen.getByText(/Leave out links, handles/)).toBeInTheDocument()
    expect(answer).toHaveAttribute('aria-invalid', 'true')

    await user.clear(answer)
    await user.type(answer, 'old maps of the city')
    await user.click(screen.getByRole('button', { name: /Put me in a pod/ }))
    expect(router.state.location.pathname).toBe(eventPath)
    expect(await screen.findByText(/You’re in. Your pod forms/)).toBeInTheDocument()
    expect(screen.getByText(/Here for: Make friends. A small group./)).toBeInTheDocument()
    expect(loadConnections()).toMatchObject({
      podAnswer: { prompt: 'Ask me about', answer: 'old maps of the city' },
      optIns: { [later.id]: { intents: ['make-friends'], mode: 'group' } },
    })
  })

  it('doesn’t ask the prompt again once answered', async () => {
    const answered = connections({
      type: 'opt-in',
      eventId: 'elsewhere',
      optIn: { intents: ['make-friends'], mode: 'one' },
      podAnswer: { prompt: 'Ask me about', answer: 'old maps' },
    })
    const { user } = renderApp(`${eventPath}/meet`, {
      profile,
      plans: going(later.id),
      connections: answered,
    })
    await screen.findByRole('heading', { name: 'What do you want out of this one?' })
    expect(screen.queryByRole('group', { name: 'Choose a prompt' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'One person first' }))
    await user.click(screen.getByRole('button', { name: /Put me in a pod/ }))
    expect(await screen.findByText(/One person first./)).toBeInTheDocument()
  })

  it('sends people who can’t opt in back to the event, or the feed', async () => {
    const notGoing = renderApp(`${eventPath}/meet`, { profile })
    await screen.findByRole('heading', { name: later.title })
    expect(notGoing.router.state.location.pathname).toBe(eventPath)
    notGoing.unmount()
    const gone = renderApp('/app/events/gone/meet', { profile })
    await screen.findByRole('heading', { name: /^Hi, / })
    expect(gone.router.state.location.pathname).toBe('/app/feed')
  })
})

describe('the pod, step by step (example pod)', () => {
  it('waits, reveals the pod without names, then leaves and rejoins', async () => {
    const { user } = renderApp(eventPath, {
      profile,
      plans: going(later.id),
      connections: optedIn(),
    })
    await user.click(await screen.findByRole('button', { name: 'Leave' }))
    expect(await screen.findByRole('link', { name: 'You left this pod' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'You left this pod' }))
    await user.click(await screen.findByRole('button', { name: 'Rejoin' }))
    // Rejoined before the pod forms: back on the event page, waiting again.
    expect(await screen.findByText(/You’re in. Your pod forms/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Skip to when the pod forms/ }))
    await user.click(screen.getByRole('link', { name: 'See your pod' }))

    expect(await screen.findByRole('heading', { name: /^Pod [A-Z]/ })).toBeInTheDocument()
    expect(screen.getByText(/pod-mates are made up/)).toBeInTheDocument()
    const mates = within(screen.getByRole('list', { name: 'Your pod-mates' })).getAllByRole(
      'listitem',
      {
        name: undefined,
      },
    )
    expect(screen.getByText('Pod-mate 1')).toBeInTheDocument()
    expect(mates.length).toBeGreaterThan(2)
    expect(screen.getByText(/look for the Firefly sign/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Leave this pod' }))
    expect(screen.getByRole('heading', { name: 'You’ve left this pod.' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Rejoin' }))
    expect(await screen.findByRole('heading', { name: /^Pod [A-Z]/ })).toBeInTheDocument()
  })

  it('blocks and reports from any card, and the card disappears', async () => {
    const { user } = renderApp(`${eventPath}/pod`, {
      profile,
      plans: going(later.id),
      connections: optedIn({ type: 'preview', eventId: later.id, step: 'pod' }),
    })
    await screen.findByText('Pod-mate 2')
    const count = screen.getAllByText(/^Pod-mate \d$/).length

    await user.click(first(screen.getAllByRole('button', { name: 'Block' })))
    expect(screen.getByRole('status')).toHaveTextContent('Blocked.')
    expect(screen.queryAllByText(/^Pod-mate \d$/)).toHaveLength(count - 1)

    await user.click(first(screen.getAllByRole('button', { name: 'Report' })))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(first(screen.getAllByRole('button', { name: 'Report' })))
    await user.click(screen.getByRole('button', { name: 'Unwanted advance' }))
    expect(screen.getByRole('status')).toHaveTextContent('Reported.')
    expect(screen.queryAllByText(/^Pod-mate \d$/)).toHaveLength(count - 2)
    expect(loadConnections().blocked).toHaveLength(2)
    expect(loadConnections().reported).toHaveLength(1)
  })

  it('"We met", then keep meeting, then sharing socials with a mutual connection', async () => {
    const { user } = renderApp(`${eventPath}/pod`, {
      profile,
      plans: going(later.id),
      connections: optedIn({ type: 'preview', eventId: later.id, step: 'event' }),
    })
    expect(await screen.findByRole('heading', { name: 'Who did you meet?' })).toBeInTheDocument()
    const boxes = screen.getAllByRole('checkbox')
    for (const box of boxes) await user.click(box)
    await user.click(first(boxes))
    await user.click(first(boxes))
    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(await screen.findByRole('heading', { name: 'Thanks.' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Skip to after the event/ }))
    expect(
      await screen.findByRole('heading', { name: 'Anyone you’d like to keep meeting?' }),
    ).toBeInTheDocument()
    const groups = screen.getAllByRole('group', { name: /^Keep meeting / })
    for (const group of groups)
      await user.click(within(group).getByRole('button', { name: 'Keep meeting' }))
    await user.click(within(first(groups)).getByRole('button', { name: 'Not this time' }))
    await user.click(screen.getByRole('button', { name: 'Send privately' }))

    const heading = await screen.findByRole('heading', { name: /want to keep meeting/ })
    expect(heading).toBeInTheDocument()
    const person = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('href')?.startsWith('/app/people/'))
    if (!person) throw new Error('expected a connection')
    const name = person.textContent
    await user.click(person)

    expect(await screen.findByRole('heading', { name })).toBeInTheDocument()
    expect(screen.getByText(`${name} is a made-up example person.`)).toBeInTheDocument()
    const instagram = screen.getByLabelText('Instagram')
    await user.type(instagram, 'not valid!')
    await user.click(screen.getByRole('button', { name: /Share my Instagram/ }))
    expect(screen.getByText('Enter your Instagram username, like @yourname.')).toBeInTheDocument()
    await user.clear(instagram)
    await user.type(instagram, 'alex.makes')
    await user.click(screen.getByRole('button', { name: /Share my Instagram/ }))
    expect(screen.getByText('Shared: @alex.makes')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Share my LinkedIn/ }))
    expect(screen.getByText(/Enter your LinkedIn profile/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: `Block ${name}` }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.click(screen.getByRole('button', { name: `Block ${name}` }))
    const confirm = within(screen.getByRole('group', { name: 'Confirm block' }))
    await user.click(confirm.getByRole('button', { name: `Block ${name}` }))
    expect(await screen.findByRole('heading', { name: 'Your plans' })).toBeInTheDocument()
  })

  it('says so honestly when nobody met back, or nobody kept meeting', async () => {
    const none = renderApp(`${eventPath}/pod`, {
      profile,
      plans: going(later.id),
      connections: optedIn(
        { type: 'met-confirmed', eventId: later.id, mutual: [] },
        { type: 'preview', eventId: later.id, step: 'after' },
      ),
    })
    expect(
      await screen.findByRole('heading', { name: 'No one to choose this time.' }),
    ).toBeInTheDocument()
    none.unmount()

    const { user } = renderApp(`${eventPath}/pod`, {
      profile,
      plans: going(later.id),
      connections: optedIn(
        { type: 'met-confirmed', eventId: later.id, mutual: ['example-1'] },
        { type: 'preview', eventId: later.id, step: 'after' },
      ),
    })
    await user.click(await screen.findByRole('button', { name: 'Not this time' }))
    await user.click(screen.getByRole('button', { name: 'Send privately' }))
    expect(
      await screen.findByRole('heading', { name: 'No new connections this time.' }),
    ).toBeInTheDocument()
  })

  it('links from the event page at each step', async () => {
    const step = (...more: ConnectionsAction[]) => optedIn(...more)
    const cases: [ReturnType<typeof step>, string][] = [
      [step({ type: 'preview', eventId: later.id, step: 'event' }), 'Your pod'],
      [
        step(
          { type: 'preview', eventId: later.id, step: 'after' },
          { type: 'met-confirmed', eventId: later.id, mutual: [] },
        ),
        'Who would you like to keep meeting?',
      ],
      [
        step(
          { type: 'preview', eventId: later.id, step: 'after' },
          { type: 'met-confirmed', eventId: later.id, mutual: [] },
          { type: 'picks-sent', eventId: later.id, connections: [] },
        ),
        'See how it went',
      ],
      [step({ type: 'leave', eventId: later.id }), 'You left this pod'],
    ]
    for (const [state, label] of cases) {
      const view = renderApp(eventPath, { profile, plans: going(later.id), connections: state })
      expect(await screen.findByRole('link', { name: label })).toBeInTheDocument()
      view.unmount()
    }
  })

  it('sends anyone not in a pod back to the event, or the feed', async () => {
    const notIn = renderApp(`${eventPath}/pod`, { profile, plans: going(later.id) })
    await screen.findByRole('heading', { name: later.title })
    expect(notIn.router.state.location.pathname).toBe(eventPath)
    notIn.unmount()
    const gone = renderApp('/app/events/gone/pod', { profile })
    await screen.findByRole('heading', { name: /^Hi, / })
    expect(gone.router.state.location.pathname).toBe('/app/feed')
  })
})

describe('your people', () => {
  const someone = {
    personId: 'real-person',
    firstName: 'Rin',
    eventId: later.id,
    eventTitle: later.title,
    metAt: later.startsAt,
    shared: [],
  }

  it('lists mutual connections on Plans, or says how they get there', async () => {
    const empty = renderApp('/app/plans', { profile })
    expect(
      await screen.findByText(/both choose to keep meeting, they show up here/),
    ).toBeInTheDocument()
    empty.unmount()
    renderApp('/app/plans', {
      profile,
      connections: connections({ type: 'picks-sent', eventId: later.id, connections: [someone] }),
    })
    expect(await screen.findByRole('link', { name: 'Rin' })).toHaveAttribute(
      'href',
      '/app/people/real-person',
    )
  })

  it('shows nothing shared yet for someone who hasn’t, and redirects for strangers', async () => {
    const view = renderApp('/app/people/real-person', {
      profile,
      connections: connections({ type: 'picks-sent', eventId: later.id, connections: [someone] }),
    })
    expect(await screen.findByText('Nothing yet.')).toBeInTheDocument()
    expect(screen.queryByText(/made-up example person/)).not.toBeInTheDocument()
    view.unmount()
    const stranger = renderApp('/app/people/nobody', { profile })
    expect(stranger.router.state.location.pathname).toBe('/app/plans')
  })
})
