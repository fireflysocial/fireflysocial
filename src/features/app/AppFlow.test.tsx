import { Capacitor } from '@capacitor/core'
import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadPlans } from '../../data/plans.ts'
import { loadProfile } from '../../data/profile.ts'
import { EMPTY_PLANS, plansReducer } from '../../lib/plans.ts'
import { NOW } from '../../test/fixtures.ts'
import { renderApp, vancouverProfile } from '../../test/renderApp.tsx'

afterEach(() => {
  localStorage.clear()
})

describe('routing', () => {
  it('opens the app at /app: onboarding first, then the feed', async () => {
    const first = renderApp('/app')
    expect(first.router.state.location.pathname).toBe('/app/start/welcome')
    first.unmount()
    const again = renderApp('/app', { profile: vancouverProfile() })
    expect(again.router.state.location.pathname).toBe('/app/feed')
    expect(await screen.findByRole('heading', { name: 'Hi, Alex' })).toBeInTheDocument()
  })

  it('sends anyone not onboarded from an app screen to the start', () => {
    const { router } = renderApp('/app/plans')
    expect(router.state.location.pathname).toBe('/app/start/welcome')
  })

  it('opens the native apps straight into the app instead of the landing page', () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true)
    const { router } = renderApp('/')
    expect(router.state.location.pathname).toBe('/app/start/welcome')
  })

  it('shows a not-found page for unknown addresses', () => {
    renderApp('/nowhere')
    expect(
      screen.getByRole('heading', { name: 'There’s nothing at this address.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to Firefly' })).toHaveAttribute('href', '/app')
  })

  it('switches tabs', async () => {
    const { user, router } = renderApp('/app/feed', { profile: vancouverProfile() })
    await user.click(screen.getByRole('link', { name: 'Plans' }))
    expect(router.state.location.pathname).toBe('/app/plans')
    expect(screen.getByRole('link', { name: 'Plans' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('onboarding', () => {
  it('goes from welcome to a personal feed, storing only on this device', async () => {
    const { user, router } = renderApp('/app/start/welcome')
    const next = (name = 'Continue') =>
      user.click(screen.getByRole('button', { name: new RegExp(name) }))

    expect(
      screen.getByRole('heading', { name: 'Get more out of the events you already go to.' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    await next('Get started')

    // 18+ and the respect pledge, both required
    const go = screen.getByRole('button', { name: /Continue/ })
    expect(go).toBeDisabled()
    await user.click(screen.getByLabelText('I’m 18 or older'))
    expect(go).toBeDisabled()
    await user.click(screen.getByLabelText(/good intent/))
    expect(screen.getByRole('progressbar', { name: 'Setup progress' })).toHaveAttribute(
      'aria-valuenow',
      '1',
    )
    await next()

    // First name
    expect(screen.getByRole('button', { name: /Continue/ })).toBeDisabled()
    await user.type(screen.getByLabelText('What’s your first name?'), '  Sam ')
    await next()

    // What brings you (optional)
    await user.click(screen.getByRole('button', { name: 'A co-founder' }))
    await user.click(screen.getByRole('button', { name: 'New friends' }))
    await user.click(screen.getByRole('button', { name: 'New friends' }))
    expect(screen.getByRole('button', { name: 'A co-founder' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await next()

    // Interests: at least three
    expect(screen.getByText('Tap at least 3. 0 picked so far.')).toBeInTheDocument()
    for (const name of ['Board games', 'Pottery'])
      await user.click(screen.getByRole('button', { name }))
    expect(screen.getByRole('button', { name: /Continue/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Startup meetups' }))
    expect(screen.getByText('3 picked. Add more if you like.')).toBeInTheDocument()
    await next()

    // Free times
    await user.click(screen.getByRole('button', { name: 'Weekday evenings' }))
    await next()

    // Extras
    const budget = within(screen.getByRole('group', { name: 'Budget' }))
    expect(budget.getByRole('button', { name: 'Under $20' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(budget.getByRole('button', { name: 'Free only' }))
    await user.click(screen.getByRole('button', { name: 'Gastown' }))
    const newcomer = within(screen.getByRole('group', { name: 'New to Vancouver?' }))
    await user.click(newcomer.getByRole('button', { name: 'Yes' }))
    await user.click(newcomer.getByRole('button', { name: 'No' }))
    await user.click(newcomer.getByRole('button', { name: 'No' }))
    await user.click(newcomer.getByRole('button', { name: 'Yes' }))
    await user.click(screen.getByRole('button', { name: 'Step-free access' }))
    await next('Show my feed')

    expect(router.state.location.pathname).toBe('/app/feed')
    expect(await screen.findByRole('heading', { name: 'Hi, Sam' })).toBeInTheDocument()
    expect(loadProfile()).toEqual({
      firstName: 'Sam',
      cityId: 'vancouver',
      intents: ['cofounder'],
      interests: ['board-games', 'pottery', 'startup-meetups'],
      freeTimes: ['weekday-evenings'],
      neighbourhoods: ['Gastown'],
      budget: 'free',
      newcomer: true,
      accessNeeds: ['step-free'],
      pledgedAt: NOW.toISOString(),
    })
  })

  it('goes back a step', async () => {
    const { user, router } = renderApp('/app/start/welcome')
    await user.click(screen.getByRole('button', { name: /Get started/ }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(router.state.location.pathname).toBe('/app/start/welcome')
  })

  it('sends an unknown step to the welcome screen, and a skipped-ahead step back to the first gap', () => {
    const unknown = renderApp('/app/start/payment')
    expect(unknown.router.state.location.pathname).toBe('/app/start/welcome')
    unknown.unmount()
    const skipped = renderApp('/app/start/free')
    expect(skipped.router.state.location.pathname).toBe('/app/start/pledge')
  })

  it('lets someone change their answers, keeping when they took the pledge', async () => {
    const profile = vancouverProfile({ pledgedAt: '2026-01-01T00:00:00.000Z' })
    const { user } = renderApp('/app/start/brings', { profile })
    await user.click(screen.getByRole('button', { name: 'Collaborators' }))
    // brings → interests → free → extras
    for (let step = 0; step < 3; step++) {
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /Continue/ }))
    }
    await user.click(screen.getByRole('button', { name: /Show my feed/ }))
    expect(loadProfile()).toMatchObject({
      intents: ['collaborators'],
      pledgedAt: '2026-01-01T00:00:00.000Z',
    })
  })
})

describe('You', () => {
  it('shows the person’s answers', () => {
    renderApp('/app/you', {
      profile: vancouverProfile({
        intents: ['friends'],
        freeTimes: ['weekend-days'],
        accessNeeds: ['quieter'],
      }),
    })
    expect(screen.getByRole('heading', { name: 'Alex' })).toBeInTheDocument()
    expect(screen.getByText('New friends')).toBeInTheDocument()
    expect(screen.getByText('Board games, Language exchange, Pottery')).toBeInTheDocument()
    expect(screen.getByText('Weekend days')).toBeInTheDocument()
    expect(screen.getByText('Quieter venues')).toBeInTheDocument()
    expect(screen.getByText('Not set')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Change your answers' })).toHaveAttribute(
      'href',
      '/app/start/brings',
    )
  })

  it('deletes everything on this device after a confirmation', async () => {
    const plans = plansReducer(EMPTY_PLANS, { type: 'toggle-save', eventId: 'x' })
    const { user, router } = renderApp('/app/you', { profile: vancouverProfile(), plans })

    await user.click(screen.getByRole('button', { name: 'Delete my data' }))
    await user.click(screen.getByRole('button', { name: 'Keep my data' }))
    expect(loadProfile()).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Delete my data' }))
    await user.click(screen.getByRole('button', { name: 'Delete everything' }))
    expect(router.state.location.pathname).toBe('/app/start/welcome')
    expect(loadProfile()).toBeNull()
    expect(loadPlans()).toEqual(EMPTY_PLANS)
    expect(localStorage.length).toBe(0)
  })
})
