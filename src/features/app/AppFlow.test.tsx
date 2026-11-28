import { Capacitor } from '@capacitor/core'
import { act, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadPlans } from '../../data/plans.ts'
import { EMPTY_PLANS, plansReducer } from '../../lib/plans.ts'
import { fakeAccount, TEST_ACCOUNT } from '../../test/fakeAccount.ts'
import { renderApp, vancouverProfile } from '../../test/renderApp.tsx'

afterEach(() => {
  localStorage.clear()
})

describe('routing', () => {
  it('opens the app at /app: welcome when signed out, the feed when onboarded', async () => {
    const first = renderApp('/app')
    expect(first.router.state.location.pathname).toBe('/app/welcome')
    first.unmount()
    const again = renderApp('/app', { profile: vancouverProfile() })
    expect(again.router.state.location.pathname).toBe('/app/feed')
    expect(await screen.findByRole('heading', { name: 'Hi, Alex' })).toBeInTheDocument()
  })

  it('sends anyone signed out from an app screen to the welcome screen', () => {
    const { router } = renderApp('/app/plans')
    expect(router.state.location.pathname).toBe('/app/welcome')
    router.dispose()
    const onboarding = renderApp('/app/start/interests')
    expect(onboarding.router.state.location.pathname).toBe('/app/welcome')
  })

  it('sends someone signed in but not onboarded to onboarding', async () => {
    const fresh = renderApp('/app/plans', { signedIn: true })
    await waitFor(() => {
      expect(fresh.router.state.location.pathname).toBe('/app/start/pledge')
    })
    fresh.unmount()
    const { router } = renderApp('/app', { signedIn: true })
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/app/start/pledge')
    })
  })

  it('opens the native apps straight into the app instead of the landing page', () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true)
    const { router } = renderApp('/')
    expect(router.state.location.pathname).toBe('/app/welcome')
  })

  it('keeps signed-in people away from the welcome and sign-in screens', async () => {
    const welcome = renderApp('/app/welcome', { profile: vancouverProfile() })
    expect(welcome.router.state.location.pathname).toBe('/app/feed')
    welcome.unmount()
    const signIn = renderApp('/app/sign-in', { signedIn: true })
    await waitFor(() => {
      expect(signIn.router.state.location.pathname).toBe('/app/start/pledge')
    })
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

describe('loading the profile', () => {
  it('shows a quiet loading state until the profile arrives', async () => {
    const account = fakeAccount({ account: TEST_ACCOUNT, profile: vancouverProfile() })
    account.cache.clear()
    account.control.holdLoad = true
    const { router } = renderApp('/app/feed', { account })
    for (const path of ['/app/welcome', '/app/sign-in', '/app/start/name']) {
      await act(() => router.navigate(path))
      expect(screen.getByRole('status')).toHaveTextContent('Loading…')
    }
    await act(() => router.navigate('/app/feed'))
    await act(async () => {
      account.release()
      await Promise.resolve()
    })
    expect(await screen.findByRole('heading', { name: 'Hi, Alex' })).toBeInTheDocument()
  })

  it('opens from the copy on this device when offline', async () => {
    const account = fakeAccount({ account: TEST_ACCOUNT, profile: vancouverProfile() })
    account.fail.loadProfile = true
    renderApp('/app/feed', { account })
    expect(await screen.findByRole('heading', { name: 'Hi, Alex' })).toBeInTheDocument()
  })

  it('offers a retry when the profile can’t load and there’s no copy', async () => {
    const account = fakeAccount({ account: TEST_ACCOUNT, profile: vancouverProfile() })
    account.cache.clear()
    account.fail.loadProfile = true
    const { user } = renderApp('/app/feed', { account })
    expect(
      await screen.findByRole('heading', { name: 'We couldn’t load your answers.' }),
    ).toBeInTheDocument()
    account.fail.loadProfile = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Hi, Alex' })).toBeInTheDocument()
  })

  it.each([
    ['arrives', false],
    ['fails', true],
  ])('ignores a profile load that %s after the person signed out', async (_label, fails) => {
    const account = fakeAccount({ account: TEST_ACCOUNT, profile: vancouverProfile() })
    account.cache.clear()
    account.control.holdLoad = true
    account.fail.loadProfile = fails
    const { router } = renderApp('/app/feed', { account })
    act(() => {
      account.signIn(null)
    })
    await act(async () => {
      account.release()
      await Promise.resolve()
    })
    expect(router.state.location.pathname).toBe('/app/welcome')
    expect(screen.queryByRole('heading', { name: 'Hi, Alex' })).not.toBeInTheDocument()
  })

  it('lets someone log out from the retry screen', async () => {
    const account = fakeAccount({ account: TEST_ACCOUNT })
    account.fail.loadProfile = true
    const { user, router } = renderApp('/app', { account })
    await user.click(await screen.findByRole('button', { name: 'Log out' }))
    expect(router.state.location.pathname).toBe('/app/welcome')
  })
})

describe('You', () => {
  it('shows the person’s answers and how they’re stored', () => {
    renderApp('/app/you', {
      profile: vancouverProfile({
        intents: ['friends'],
        workArea: 'design',
        eventStyle: 'talk',
        groupSize: 'small',
        approach: 'warm-up',
        languages: ['english', 'korean'],
        freeTimes: ['weekend-days'],
        pace: 'weekly',
        accessNeeds: ['quieter'],
      }),
    })
    expect(screen.getByRole('heading', { name: 'Alex' })).toBeInTheDocument()
    for (const text of [
      'New friends',
      'Design & creative',
      'Board games, Language exchange, Pottery',
      'A talk, then chatting',
      'A small group',
      'Fine once someone else starts',
      'English, Korean',
      'Weekend days',
      'Once a week',
      'Quieter venues',
      'Signed in as alex@example.com',
    ]) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
    expect(screen.getByText('Not set')).toBeInTheDocument()
    expect(
      screen.getByText(/saved to your Firefly account, and only you can see them/),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Change your answers' })).toHaveAttribute(
      'href',
      '/app/start/name',
    )
  })

  it('logs out, clearing what this device kept', async () => {
    const plans = plansReducer(EMPTY_PLANS, { type: 'toggle-save', eventId: 'x' })
    const { user, router, account } = renderApp('/app/you', { profile: vancouverProfile(), plans })
    await user.click(screen.getByRole('button', { name: 'Log out' }))
    expect(router.state.location.pathname).toBe('/app/welcome')
    expect(account.current()).toBeNull()
    expect(loadPlans()).toEqual(EMPTY_PLANS)
  })

  it('deletes the account and this device’s copy after a confirmation', async () => {
    const plans = plansReducer(EMPTY_PLANS, { type: 'toggle-save', eventId: 'x' })
    const { user, router, account } = renderApp('/app/you', { profile: vancouverProfile(), plans })

    await user.click(screen.getByRole('button', { name: 'Delete my account' }))
    await user.click(screen.getByRole('button', { name: 'Keep my account' }))
    expect(account.profiles.size).toBe(1)

    await user.click(screen.getByRole('button', { name: 'Delete my account' }))
    await user.click(screen.getByRole('button', { name: 'Delete everything' }))
    expect(router.state.location.pathname).toBe('/app/welcome')
    expect(account.profiles.size).toBe(0)
    expect(account.current()).toBeNull()
    expect(localStorage.length).toBe(0)
  })

  it('keeps everything, and says so, when deleting fails', async () => {
    const { user, router, account } = renderApp('/app/you', { profile: vancouverProfile() })
    account.fail.deleteAccount = true
    await user.click(screen.getByRole('button', { name: 'Delete my account' }))
    await user.click(screen.getByRole('button', { name: 'Delete everything' }))
    expect(screen.getByRole('alert')).toHaveTextContent('We couldn’t delete your account.')
    expect(router.state.location.pathname).toBe('/app/you')
    expect(account.profiles.size).toBe(1)
    expect(account.current()).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'Keep my account' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
