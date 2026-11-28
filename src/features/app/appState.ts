import { createContext, useContext } from 'react'
import type { Account } from '../../data/account.ts'
import type { City } from '../../lib/cities.ts'
import type { CityEvent } from '../../lib/events.ts'
import type { Plans, PlansAction } from '../../lib/plans.ts'
import type { ConnectionsAction, ConnectionsState } from '../../lib/pods/connections.ts'
import type { Profile } from '../../lib/profile.ts'

export type EventsState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; events: CityEvent[] }

/**
 * Where the person is: still finding out, signed out, signed in but the profile couldn't load (and
 * there's no copy on this device), signed in mid-onboarding, or ready for the feed.
 */
export type Gate = 'loading' | 'signed-out' | 'error' | 'onboarding' | 'ready'

export interface AppState {
  gate: Gate
  account: Account | null
  /** Tries loading the profile again after an error. */
  retryProfile: () => void
  profile: Profile | null
  city: City
  events: EventsState
  reloadEvents: () => void
  plans: Plans
  dispatch: (action: PlansAction) => void
  connections: ConnectionsState
  dispatchConnections: (action: ConnectionsAction) => void
  /** Saves the finished profile to the account. Resolves false if it couldn't be saved. */
  completeOnboarding: (profile: Profile) => Promise<boolean>
  /** Signs out and clears what this device kept (plans, connections, the onboarding draft). */
  signOut: () => Promise<void>
  /** Deletes the account and everything stored with it, and this device's copy (app store
   *  requirement, CLAUDE.md §9). Resolves false if the account couldn't be deleted. */
  deleteEverything: () => Promise<boolean>
  /** The event whose "Did you register?" prompt is showing after the person came back. */
  returnPromptFor: string | null
}

export const AppStateContext = createContext<AppState | null>(null)

export function useAppState(): AppState {
  const state = useContext(AppStateContext)
  if (!state) throw new Error('useAppState must be used inside <AppStateProvider>')
  return state
}

/** The profile, for screens that only render after onboarding (inside TabLayout). */
export function useProfile(): Profile {
  const { profile } = useAppState()
  if (!profile) throw new Error('useProfile is only for screens shown after onboarding')
  return profile
}

/** The events list once loaded, or an empty list while loading or after an error. */
export function readyEvents(events: EventsState): CityEvent[] {
  return events.status === 'ready' ? events.events : []
}
