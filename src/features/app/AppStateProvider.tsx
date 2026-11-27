import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { listEvents } from '../../data/events.ts'
import { deleteConnections, loadConnections, saveConnections } from '../../data/connections.ts'
import { deletePlans, loadPlans, savePlans } from '../../data/plans.ts'
import { deleteProfile, loadProfile, saveProfile } from '../../data/profile.ts'
import { cityById, LAUNCH_CITY } from '../../lib/cities.ts'
import { onReturnToApp } from '../../lib/platform/index.ts'
import { EMPTY_PLANS, plansReducer, prunePlans, type PlansAction } from '../../lib/plans.ts'
import {
  connectionsReducer,
  EMPTY_CONNECTIONS,
  pruneConnections,
  type ConnectionsAction,
} from '../../lib/pods/connections.ts'
import type { Profile } from '../../lib/profile.ts'
import { AppStateContext, type AppState, type EventsState } from './appState.ts'
import { useClock } from './clock.ts'

export function AppStateProvider({ children }: { children: ReactNode }) {
  const clock = useClock()
  const [profile, setProfile] = useState<Profile | null>(loadProfile)
  const [plans, setPlans] = useState(loadPlans)
  const [connections, setConnections] = useState(loadConnections)
  const [events, setEvents] = useState<EventsState>({ status: 'loading' })
  const [loadCount, setLoadCount] = useState(0)
  // A pending prompt from before the app was closed is shown straight away on reopening.
  const [returnedFor, setReturnedFor] = useState<string | null>(() => plans.awaitingReturn)
  const city = (profile && cityById(profile.cityId)) ?? LAUNCH_CITY

  const awaitingRef = useRef(plans.awaitingReturn)
  useEffect(() => {
    awaitingRef.current = plans.awaitingReturn
    // Nothing to keep yet, or everything was just deleted: don't write an empty record back.
    if (plans !== EMPTY_PLANS) savePlans(plans)
  }, [plans])

  useEffect(() => {
    // Nothing to keep yet, or everything was just deleted: don't write an empty record back.
    if (connections !== EMPTY_CONNECTIONS) saveConnections(connections)
  }, [connections])

  useEffect(
    () =>
      onReturnToApp(() => {
        setReturnedFor(awaitingRef.current)
      }),
    [],
  )

  useEffect(() => {
    let current = true
    listEvents(city, clock()).then(
      (list) => {
        if (!current) return
        setEvents({ status: 'ready', events: list })
        setPlans((p) => prunePlans(p, list, clock()))
        setConnections((c) => pruneConnections(c, list, clock()))
      },
      () => {
        if (current) setEvents({ status: 'error' })
      },
    )
    return () => {
      current = false
    }
  }, [city, clock, loadCount])

  const reloadEvents = useCallback(() => {
    setEvents({ status: 'loading' })
    setLoadCount((n) => n + 1)
  }, [])

  const dispatch = useCallback((action: PlansAction) => {
    setPlans((p) => plansReducer(p, action))
  }, [])

  const dispatchConnections = useCallback((action: ConnectionsAction) => {
    setConnections((c) => connectionsReducer(c, action))
  }, [])

  const completeOnboarding = useCallback((next: Profile) => {
    saveProfile(next)
    setProfile(next)
  }, [])

  const deleteEverything = useCallback(() => {
    deleteProfile()
    deletePlans()
    deleteConnections()
    setProfile(null)
    setPlans(EMPTY_PLANS)
    setConnections(EMPTY_CONNECTIONS)
    setReturnedFor(null)
  }, [])

  const value = useMemo<AppState>(
    () => ({
      profile,
      city,
      events,
      reloadEvents,
      plans,
      dispatch,
      connections,
      dispatchConnections,
      completeOnboarding,
      deleteEverything,
      returnPromptFor:
        returnedFor !== null && returnedFor === plans.awaitingReturn ? returnedFor : null,
    }),
    [
      profile,
      city,
      events,
      reloadEvents,
      plans,
      dispatch,
      connections,
      dispatchConnections,
      completeOnboarding,
      deleteEverything,
      returnedFor,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
