import { act, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { loadDraft, saveDraft } from '../../../data/onboardingDraft.ts'
import { emptyDraft } from '../../../lib/onboarding.ts'
import { fakeAccount, TEST_ACCOUNT } from '../../../test/fakeAccount.ts'
import { NOW } from '../../../test/fixtures.ts'
import { renderApp, vancouverProfile } from '../../../test/renderApp.tsx'

afterEach(() => {
  localStorage.clear()
})

const progress = () => screen.getByRole('progressbar', { name: 'Setup progress' })

describe('onboarding', () => {
  it('walks through every section to a personal feed, saving to the account', async () => {
    const { user, router, account } = renderApp('/app/start/pledge', { signedIn: true })
    const next = (name: RegExp | string = /^Continue/) =>
      user.click(screen.getByRole('button', { name }))

    // About you: 18+ and the pledge, both required
    await screen.findByRole('progressbar')
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
    const go = screen.getByRole('button', { name: /Continue/ })
    expect(go).toBeDisabled()
    await user.click(screen.getByLabelText('I’m 18 or older'))
    expect(go).toBeDisabled()
    await user.click(screen.getByLabelText(/good intent/))
    expect(progress()).toHaveAttribute('aria-valuenow', '1')
    expect(progress()).toHaveAttribute('aria-valuetext', 'Step 1 of 15: About you')
    await next()

    expect(screen.getByRole('button', { name: /Continue/ })).toBeDisabled()
    await user.type(screen.getByLabelText('What’s your first name?'), '  Sam ')
    await next()

    // What you're after: picking a co-founder adds the project step
    expect(progress()).toHaveAttribute('aria-valuetext', 'Step 3 of 15: What you’re after')
    expect(screen.getByRole('button', { name: /Skip/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'A co-founder' }))
    await user.click(screen.getByRole('button', { name: 'New friends' }))
    await user.click(screen.getByRole('button', { name: 'New friends' }))
    expect(progress()).toHaveAttribute('aria-valuemax', '16')
    await next()

    await user.click(screen.getByLabelText('Building my own thing'))
    await next()

    const roles = within(screen.getByRole('group', { name: 'What you’d bring' }))
    await user.click(roles.getByRole('button', { name: 'Engineering' }))
    await user.click(
      within(screen.getByRole('group', { name: 'Where your idea is at' })).getByLabelText(
        'I have an idea',
      ),
    )
    await next()

    // What you're into: at least three interests, then the kind of event
    expect(screen.getByText('Tap at least 3. 0 picked so far.')).toBeInTheDocument()
    for (const name of ['Board games', 'Pottery'])
      await user.click(screen.getByRole('button', { name }))
    expect(screen.getByRole('button', { name: /Continue/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Startup meetups' }))
    expect(screen.getByText('3 picked. Add more if you like.')).toBeInTheDocument()
    await next()

    await user.click(screen.getByLabelText(/Doing something together/))
    await next()

    // How you like to meet
    await user.click(screen.getByLabelText(/A small group/))
    await next()

    expect(
      screen.getByRole('heading', { name: 'Walking into a room of strangers feels…' }),
    ).toBeInTheDocument()
    await user.click(screen.getByLabelText('Honestly, a bit daunting'))
    expect(screen.getByText(/That’s what Firefly is for/)).toBeInTheDocument()
    await next()

    await user.click(
      within(screen.getByRole('group', { name: 'I speak' })).getByRole('button', {
        name: 'English',
      }),
    )
    await user.click(
      within(screen.getByRole('group', { name: 'I’m learning' })).getByRole('button', {
        name: 'Japanese',
      }),
    )
    await next()

    // Fitting it in
    await user.click(screen.getByRole('button', { name: 'Weekday evenings' }))
    await next()
    await user.click(screen.getByLabelText('Every couple of weeks'))
    await next()
    expect(
      screen.getByRole('heading', { name: 'Where in Vancouver would you happily go?' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Gastown' }))
    await next()
    expect(screen.getByLabelText('Under $20')).toBeChecked()
    await user.click(screen.getByLabelText('Free only'))
    await next()

    // Last bits
    await user.click(screen.getByLabelText(/Yes, I’m new here/))
    await next()
    await user.click(screen.getByRole('button', { name: 'Step-free access' }))
    await next(/Show my feed/)

    expect(router.state.location.pathname).toBe('/app/feed')
    expect(await screen.findByRole('heading', { name: 'Hi, Sam' })).toBeInTheDocument()
    expect(account.profiles.get(TEST_ACCOUNT.userId)).toEqual({
      firstName: 'Sam',
      cityId: 'vancouver',
      intents: ['cofounder'],
      workArea: 'building',
      projectRoles: ['engineering'],
      projectStage: 'idea',
      interests: ['board-games', 'pottery', 'startup-meetups'],
      eventStyle: 'activity',
      groupSize: 'small',
      approach: 'daunting',
      languages: ['english'],
      learning: ['japanese'],
      freeTimes: ['weekday-evenings'],
      pace: 'fortnightly',
      neighbourhoods: ['Gastown'],
      budget: 'free',
      newcomer: true,
      accessNeeds: ['step-free'],
      pledgedAt: NOW.toISOString(),
    })
    // The draft is gone once it's saved.
    expect(loadDraft()).toBeNull()
  })

  it('skips optional steps, and leaves out the project step for other goals', async () => {
    const account = fakeAccount({ account: TEST_ACCOUNT })
    account.control.holdLoad = true
    const { user, router } = renderApp('/app/start/brings', { account })
    saveDraft(
      {
        ...emptyDraft(),
        adult: true,
        pledge: true,
        firstName: 'Sam',
        interests: ['trivia', 'yoga', 'hiking'],
      },
      'brings',
    )
    await act(async () => {
      account.release()
      await Promise.resolve()
    })
    await user.click(await screen.findByRole('button', { name: /Skip/ }))
    expect(router.state.location.pathname).toBe('/app/start/work')
    await user.click(screen.getByRole('button', { name: /Skip/ }))
    expect(router.state.location.pathname).toBe('/app/start/interests')
  })

  it('remembers answers in progress on this device, and resumes where the person left off', async () => {
    const first = renderApp('/app/start/pledge', { signedIn: true })
    await first.user.click(await screen.findByLabelText('I’m 18 or older'))
    await first.user.click(screen.getByLabelText(/good intent/))
    await first.user.click(screen.getByRole('button', { name: /Continue/ }))
    await first.user.type(screen.getByLabelText('What’s your first name?'), 'Sam')
    expect(loadDraft()).toMatchObject({ step: 'name', draft: { firstName: 'Sam' } })
    first.unmount()

    // A reopened app finds the draft on the device and goes back to that step.
    const saved = loadDraft()
    const account = fakeAccount({ account: TEST_ACCOUNT })
    account.control.holdLoad = true
    const again = renderApp('/app', { account })
    if (saved) saveDraft(saved.draft, saved.step)
    await act(async () => {
      account.release()
      await Promise.resolve()
    })
    await waitFor(() => {
      expect(again.router.state.location.pathname).toBe('/app/start/name')
    })
    expect(screen.getByLabelText('What’s your first name?')).toHaveValue('Sam')
  })

  it('sends a skipped-ahead step back to the first missing answer, and an unknown one to the start', async () => {
    const skipped = renderApp('/app/start/free', { signedIn: true })
    await waitFor(() => {
      expect(skipped.router.state.location.pathname).toBe('/app/start/pledge')
    })
    skipped.unmount()
    const unknown = renderApp('/app/start/payment', { signedIn: true })
    await waitFor(() => {
      expect(unknown.router.state.location.pathname).toBe('/app/start/pledge')
    })
    unknown.unmount()
    const project = renderApp('/app/start/project', { profile: vancouverProfile() })
    expect(project.router.state.location.pathname).toBe('/app/start/interests')
  })

  it('goes back a step', async () => {
    const { user, router } = renderApp('/app/start/pledge', { signedIn: true })
    await user.click(await screen.findByLabelText('I’m 18 or older'))
    await user.click(screen.getByLabelText(/good intent/))
    await user.click(screen.getByRole('button', { name: /Continue/ }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(router.state.location.pathname).toBe('/app/start/pledge')
  })

  it('says so, and keeps the answers, when saving fails; retrying works', async () => {
    const account = fakeAccount({ account: TEST_ACCOUNT })
    account.control.holdLoad = true
    const { user, router } = renderApp('/app/start/access', { account })
    // The draft a person would have built up by the last screen.
    saveDraft(
      {
        ...emptyDraft(),
        adult: true,
        pledge: true,
        firstName: 'Sam',
        interests: ['trivia', 'yoga', 'hiking'],
      },
      'access',
    )
    account.fail.saveProfile = true
    await act(async () => {
      account.release()
      await Promise.resolve()
    })
    await user.click(await screen.findByRole('button', { name: /Show my feed/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('We couldn’t save your answers.')
    expect(router.state.location.pathname).toBe('/app/start/access')

    // Changing an answer clears the message; saving again works.
    await user.click(screen.getByRole('button', { name: 'Quieter venues' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    account.fail.saveProfile = false
    await user.click(screen.getByRole('button', { name: /Show my feed/ }))
    expect(router.state.location.pathname).toBe('/app/feed')
    expect(account.profiles.get(TEST_ACCOUNT.userId)?.accessNeeds).toEqual(['quieter'])
  })

  it('lets someone change their answers, keeping when they took the pledge', async () => {
    const profile = vancouverProfile({ pledgedAt: '2026-01-01T00:00:00.000Z' })
    const { user, router, account } = renderApp('/app/start/pledge', { profile })
    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/app/you')
    await act(async () => {
      await router.navigate('/app/start/name')
    })
    expect(screen.getByLabelText('What’s your first name?')).toHaveValue('Alex')
    await act(async () => {
      await router.navigate('/app/start/access')
    })
    await user.click(screen.getByRole('button', { name: 'Captions or hearing support' }))
    await user.click(screen.getByRole('button', { name: /Save changes/ }))
    expect(account.profiles.get(TEST_ACCOUNT.userId)).toMatchObject({
      accessNeeds: ['captions'],
      pledgedAt: '2026-01-01T00:00:00.000Z',
    })
    // Changing answers never leaves a draft behind.
    expect(loadDraft()).toBeNull()
  })

  it('answers "no" to being new in town', async () => {
    const { user } = renderApp('/app/start/newcomer', { profile: vancouverProfile() })
    expect(screen.getByRole('button', { name: /Skip/ })).toBeInTheDocument()
    await user.click(screen.getByLabelText('No, I’ve been here a while'))
    expect(screen.getByLabelText('No, I’ve been here a while')).toBeChecked()
    expect(screen.getByRole('button', { name: /^Continue/ })).toBeInTheDocument()
  })
})
