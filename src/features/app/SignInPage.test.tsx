import { Capacitor } from '@capacitor/core'
import { act, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fakeAccount } from '../../test/fakeAccount.ts'
import { renderApp, vancouverProfile } from '../../test/renderApp.tsx'

afterEach(() => {
  localStorage.clear()
})

const RETURN_TO = `${window.location.origin}/app/sign-in`

describe('welcome', () => {
  it('says what Firefly is, then offers sign-up and log-in', () => {
    renderApp('/app/welcome')
    expect(
      screen.getByRole('heading', { name: 'Get more out of the events you already go to.' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/we email you a sign-in link/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Get started/ })).toHaveAttribute(
      'href',
      '/app/sign-in',
    )
    expect(screen.getByRole('link', { name: 'I already have an account' })).toHaveAttribute(
      'href',
      '/app/sign-in?mode=login',
    )
  })
})

describe('signing up and logging in', () => {
  it('emails a link back to this page, then starts onboarding once it’s opened', async () => {
    const { user, router, account } = renderApp('/app/sign-in')
    expect(screen.getByRole('heading', { name: 'What’s your email?' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Send link/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your email address.')
    expect(screen.getByLabelText('What’s your email?')).toHaveAttribute('aria-invalid', 'true')

    await user.type(screen.getByLabelText('What’s your email?'), ' Sam@Example.COM ')
    await user.click(screen.getByRole('button', { name: /Send link/ }))
    expect(account.sent).toEqual([{ email: 'Sam@example.com', redirectTo: RETURN_TO }])
    expect(screen.getByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    expect(screen.getByText('Sam@example.com')).toBeInTheDocument()

    act(() => {
      account.openLink('Sam@example.com')
    })
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/app/start/pledge')
    })
    expect(account.current()?.email).toBe('Sam@example.com')
  })

  it('takes someone who already has a profile straight to their feed', async () => {
    const account = fakeAccount()
    const { user, router } = renderApp('/app/sign-in?mode=login', { account })
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByText(/send you a link to log in/)).toBeInTheDocument()
    account.profiles.set('user-sam@example.com', vancouverProfile({ firstName: 'Sam' }))
    await user.type(screen.getByLabelText('Welcome back'), 'sam@example.com')
    await user.click(screen.getByRole('button', { name: /Send link/ }))
    act(() => {
      account.openLink('sam@example.com')
    })
    expect(await screen.findByRole('heading', { name: 'Hi, Sam' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/app/feed')
  })

  it('says so when a link has expired or was already used', () => {
    renderApp('/app/sign-in#error=access_denied&error_code=otp_expired')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'That sign-in link has expired or was already used.',
    )
    expect(screen.getByRole('heading', { name: 'What’s your email?' })).toBeInTheDocument()
  })

  it('explains each way sending can fail', async () => {
    const account = fakeAccount()
    const { user } = renderApp('/app/sign-in', { account })
    await user.type(screen.getByLabelText('What’s your email?'), 'sam@example.com')
    const send = () => user.click(screen.getByRole('button', { name: /Send link/ }))

    account.fail.sendLink = 'rate-limited'
    await send()
    expect(screen.getByRole('alert')).toHaveTextContent('Too many tries.')
    account.fail.sendLink = 'network'
    await send()
    expect(screen.getByRole('alert')).toHaveTextContent('You seem to be offline.')
    account.fail.sendLink = 'unavailable'
    await send()
    expect(screen.getByRole('alert')).toHaveTextContent('We couldn’t send a link right now.')
    expect(screen.getByRole('heading', { name: 'What’s your email?' })).toBeInTheDocument()
  })

  it('sends a new link, or goes back to change the email', async () => {
    const account = fakeAccount()
    const { user } = renderApp('/app/sign-in', { account })
    await user.type(screen.getByLabelText('What’s your email?'), 'sam@example.com')
    await user.click(screen.getByRole('button', { name: /Send link/ }))

    await user.click(screen.getByRole('button', { name: 'Send a new link' }))
    expect(screen.getByText('New link sent.')).toBeInTheDocument()
    expect(account.sent).toHaveLength(2)

    account.fail.sendLink = 'network'
    await user.click(screen.getByRole('button', { name: 'Send a new link' }))
    expect(screen.queryByText('New link sent.')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('You seem to be offline.')

    await user.click(screen.getByRole('button', { name: 'Use a different email' }))
    expect(screen.getByLabelText('What’s your email?')).toHaveValue('sam@example.com')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('goes back to the landing page on the web, and the welcome screen in the apps', async () => {
    const web = renderApp('/app/sign-in')
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/')
    web.unmount()
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true)
    const { user, router } = renderApp('/app/sign-in')
    await user.click(screen.getByRole('link', { name: 'Back' }))
    expect(router.state.location.pathname).toBe('/app/welcome')
  })
})
