import { act, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { loadPlans } from '../../../data/plans.ts'
import { exampleEvents } from '../../../data/exampleEvents.ts'
import { LAUNCH_CITY } from '../../../lib/cities.ts'
import { EMPTY_PLANS, plansReducer } from '../../../lib/plans.ts'
import { NOW } from '../../../test/fixtures.ts'
import { renderApp, returnToApp, vancouverProfile } from '../../../test/renderApp.tsx'

afterEach(() => {
  localStorage.clear()
})

const events = exampleEvents(LAUNCH_CITY, NOW)
const find = (slug: string) => {
  const event = events.find((e) => e.id.includes(`-${slug}-`))
  if (!event) throw new Error(`no example event ${slug}`)
  return event
}
const registered = find('language-exchange')
const walkIn = find('board-games')
const path = (id: string) => `/app/events/${encodeURIComponent(id)}`

describe('event page', () => {
  it('shows the facts, why it’s here, access and the source, labelled as an example', async () => {
    renderApp(path(registered.id), { profile: vancouverProfile() })
    expect(await screen.findByRole('heading', { name: registered.title })).toBeInTheDocument()
    expect(screen.getByText(/^Made up. Firefly/)).toBeInTheDocument()
    expect(screen.getByText(/^Because you like language exchange · /)).toBeInTheDocument()
    expect(
      screen.getByText('Step-free, per the organiser · Quieter venue, per the organiser'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'example.com' })).toHaveAttribute(
      'href',
      registered.sourceUrl,
    )
  })

  it('says when the organiser lists no accessibility facts', async () => {
    renderApp(path(find('hack-night').id), { profile: vancouverProfile() })
    expect(await screen.findByText('Not listed by the organiser')).toBeInTheDocument()
  })

  it('register and return: a click is interest only; going needs a yes', async () => {
    const { user } = renderApp(path(registered.id), { profile: vancouverProfile() })
    const register = await screen.findByRole('link', { name: 'Register on example.com' })
    expect(register).toHaveAttribute('target', '_blank')
    await user.click(register)
    expect(loadPlans()).toMatchObject({
      clicked: [registered.id],
      awaitingReturn: registered.id,
      going: {},
    })

    act(returnToApp)
    const dialog = await screen.findByRole('dialog', {
      name: `Did you register for ${registered.title}?`,
    })
    expect(dialog).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Yes, I’m going' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText(/You’re going. Only you can see this./)).toBeInTheDocument()
    expect(loadPlans().going).toEqual({ [registered.id]: 'going' })

    await user.click(screen.getByRole('button', { name: 'I’m not going any more' }))
    expect(loadPlans().going).toEqual({ [registered.id]: 'not-going' })
    expect(screen.getByRole('link', { name: 'Register on example.com' })).toBeInTheDocument()
  })

  it('"Ask me later" or Escape leaves a quiet question on the page instead of a pop-up', async () => {
    const { user } = renderApp(path(registered.id), { profile: vancouverProfile() })
    await user.click(await screen.findByRole('link', { name: 'Register on example.com' }))
    act(returnToApp)
    await user.click(await screen.findByRole('button', { name: 'Ask me later' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Did you register?' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Open example.com again' }))
    act(returnToApp)
    await screen.findByRole('dialog')
    await user.keyboard('a')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Not yet, remind me' }))
    expect(loadPlans().going).toEqual({ [registered.id]: 'remind' })
    expect(screen.getByRole('heading', { name: 'Did you register?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Not going' }))
    expect(loadPlans().going).toEqual({ [registered.id]: 'not-going' })
  })

  it('a free event with no registration is one tap: "I’m going"', async () => {
    const { user } = renderApp(path(walkIn.id), { profile: vancouverProfile() })
    expect(await screen.findByText('Free, and no registration needed.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /I’m going/ }))
    expect(loadPlans().going).toEqual({ [walkIn.id]: 'going' })
  })

  it('shows a pending prompt straight away when the app reopens', async () => {
    const plans = plansReducer(EMPTY_PLANS, { type: 'open-registration', eventId: registered.id })
    renderApp(path(registered.id), { profile: vancouverProfile(), plans })
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('saves, and flags a wrong listing for the team', async () => {
    const { user } = renderApp(path(registered.id), { profile: vancouverProfile() })
    await user.click(await screen.findByRole('button', { name: 'Save' }))
    expect(loadPlans().saved).toEqual([registered.id])
    await user.click(screen.getByRole('button', { name: 'Something wrong with this listing?' }))
    await user.click(screen.getByRole('button', { name: 'Flag this listing' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'The Firefly team will check this listing.',
    )
    expect(loadPlans().flagged).toEqual([registered.id])
  })

  it('says when an event isn’t listed any more', async () => {
    const { user, router } = renderApp(path('gone'), { profile: vancouverProfile() })
    expect(
      await screen.findByRole('heading', { name: 'This event isn’t listed any more.' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Back to your feed' }))
    expect(router.state.location.pathname).toBe('/app/feed')
  })
})
