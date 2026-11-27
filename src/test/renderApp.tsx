import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { savePlans } from '../data/plans.ts'
import { saveProfile } from '../data/profile.ts'
import { ClockContext } from '../features/app/clock.ts'
import type { Plans } from '../lib/plans.ts'
import type { Profile } from '../lib/profile.ts'
import { routes } from '../routes.tsx'
import { makeProfile, NOW } from './fixtures.ts'

/** A Vancouver profile that matches several of the example events. */
export const vancouverProfile = (overrides: Partial<Profile> = {}) =>
  makeProfile({
    cityId: 'vancouver',
    interests: ['board-games', 'language-exchange', 'pottery'],
    ...overrides,
  })

interface Options {
  profile?: Profile
  plans?: Plans
  now?: Date
}

/** Renders the real routes at `path`, with stored answers and a fixed clock. */
export function renderApp(path: string, { profile, plans, now = NOW }: Options = {}) {
  localStorage.clear()
  if (profile) saveProfile(profile)
  if (plans) savePlans(plans)
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  const view = render(
    <ClockContext.Provider value={() => now}>
      <RouterProvider router={router} />
    </ClockContext.Provider>,
  )
  return { router, user, ...view }
}

/** Simulates the person coming back to the tab (or the app) after visiting another page. */
export function returnToApp() {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
  document.dispatchEvent(new Event('visibilitychange'))
}
