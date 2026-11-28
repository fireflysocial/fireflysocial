import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { saveConnections } from '../data/connections.ts'
import { savePlans } from '../data/plans.ts'
import { AccountContext } from '../features/app/accountContext.ts'
import { ClockContext } from '../features/app/clock.ts'
import type { Plans } from '../lib/plans.ts'
import type { ConnectionsState } from '../lib/pods/connections.ts'
import type { Profile } from '../lib/profile.ts'
import { routes } from '../routes.tsx'
import { fakeAccount, TEST_ACCOUNT, type FakeAccount } from './fakeAccount.ts'
import { makeProfile, NOW } from './fixtures.ts'

/** A Vancouver profile that matches several of the example events. */
export const vancouverProfile = (overrides: Partial<Profile> = {}) =>
  makeProfile({
    cityId: 'vancouver',
    interests: ['board-games', 'language-exchange', 'pottery'],
    ...overrides,
  })

interface Options {
  /** Signs in as TEST_ACCOUNT with this profile already saved. */
  profile?: Profile
  /** Signed in as TEST_ACCOUNT, without a profile yet (mid-onboarding). */
  signedIn?: boolean
  /** A prepared fake, for tests that need to control failures. */
  account?: FakeAccount
  plans?: Plans
  connections?: ConnectionsState
  now?: Date
}

/** Renders the real routes at `path`, with a fake account, stored plans and a fixed clock. */
export function renderApp(
  path: string,
  { profile, signedIn, account, plans, connections, now = NOW }: Options = {},
) {
  localStorage.clear()
  if (plans) savePlans(plans)
  if (connections) saveConnections(connections)
  const fake =
    account ??
    fakeAccount({ account: profile || signedIn ? TEST_ACCOUNT : null, profile: profile ?? null })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  const view = render(
    <AccountContext.Provider value={fake.service}>
      <ClockContext.Provider value={() => now}>
        <RouterProvider router={router} />
      </ClockContext.Provider>
    </AccountContext.Provider>,
  )
  return { router, user, account: fake, ...view }
}

/** Simulates the person coming back to the tab (or the app) after visiting another page. */
export function returnToApp() {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
  document.dispatchEvent(new Event('visibilitychange'))
}
