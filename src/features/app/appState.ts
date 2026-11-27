import { createContext, useContext } from 'react'
import type { City } from '../../lib/cities.ts'
import type { CityEvent } from '../../lib/events.ts'
import type { Plans, PlansAction } from '../../lib/plans.ts'
import type { ConnectionsAction, ConnectionsState } from '../../lib/pods/connections.ts'
import type { Profile } from '../../lib/profile.ts'

export type EventsState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; events: CityEvent[] }

export interface AppState {
  profile: Profile | null
  city: City
  events: EventsState
  reloadEvents: () => void
  plans: Plans
  dispatch: (action: PlansAction) => void
  connections: ConnectionsState
  dispatchConnections: (action: ConnectionsAction) => void
  completeOnboarding: (profile: Profile) => void
  /** Deletes everything Firefly stored on this device (app store requirement, CLAUDE.md §9). */
  deleteEverything: () => void
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
