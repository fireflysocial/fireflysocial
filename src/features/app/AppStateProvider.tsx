import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Account } from '../../data/account.ts'
import { deleteConnections, loadConnections, saveConnections } from '../../data/connections.ts'
import { listEvents } from '../../data/events.ts'
import { deleteDraft } from '../../data/onboardingDraft.ts'
import { deletePlans, loadPlans, savePlans } from '../../data/plans.ts'
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
import { useAccountService } from './accountContext.ts'
import { AppStateContext, type AppState, type EventsState, type Gate } from './appState.ts'
import { useClock } from './clock.ts'

type AuthState = { status: 'loading' } | { status: 'known'; account: Account | null }

/** The latest answer from the server for one account and one attempt. */
interface Loaded {
  userId: string
  attempt: number
  profile: Profile | null | 'error'
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const clock = useClock()
  const service = useAccountService()
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' })
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [plans, setPlans] = useState(loadPlans)
  const [connections, setConnections] = useState(loadConnections)
  const [events, setEvents] = useState<EventsState>({ status: 'loading' })
  const [loadCount, setLoadCount] = useState(0)
  // A pending prompt from before the app was closed is shown straight away on reopening.
  const [returnedFor, setReturnedFor] = useState<string | null>(() => plans.awaitingReturn)

  const account = auth.status === 'known' ? auth.account : null
  const userId = account?.userId ?? null

  useEffect(
    () =>
      service.watch((next) => {
        setAuth({ status: 'known', account: next })
      }),
    [service],
  )

  // Load the profile from the server whenever the account changes, or on retry.
  useEffect(() => {
    if (userId === null) return
    let current = true
    service.loadProfile(userId).then(
      (profile) => {
        if (current) setLoaded({ userId, attempt, profile })
      },
      () => {
        if (current) setLoaded({ userId, attempt, profile: 'error' })
      },
    )
    return () => {
      current = false
    }
  }, [service, userId, attempt])

  // A small read from device storage; the provider only re-renders when its state changes.
  const cached = userId === null ? null : service.cachedProfile(userId)

  const fresh = loaded?.userId === userId && loaded.attempt === attempt ? loaded : null
  // The server's answer wins; while it's on its way, or if it fails, the device copy stands in.
  const known: Profile | null | undefined =
    fresh && fresh.profile !== 'error' ? fresh.profile : (cached ?? undefined)

  let gate: Gate
  if (auth.status === 'loading') gate = 'loading'
  else if (userId === null) gate = 'signed-out'
  else if (known === undefined) gate = fresh ? 'error' : 'loading'
  else gate = known ? 'ready' : 'onboarding'

  const profile = known ?? null
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

  const retryProfile = useCallback(() => {
    setAttempt((n) => n + 1)
  }, [])

  const dispatch = useCallback((action: PlansAction) => {
    setPlans((p) => plansReducer(p, action))
  }, [])

  const dispatchConnections = useCallback((action: ConnectionsAction) => {
    setConnections((c) => connectionsReducer(c, action))
  }, [])

  const completeOnboarding = useCallback(
    async (next: Profile) => {
      if (userId === null) return false
      try {
        await service.saveProfile(userId, next)
      } catch {
        return false
      }
      deleteDraft()
      setLoaded({ userId, attempt, profile: next })
      return true
    },
    [service, userId, attempt],
  )

  /** What this device kept for the person, beyond the account itself. */
  const clearDevice = useCallback(() => {
    deletePlans()
    deleteConnections()
    deleteDraft()
    setPlans(EMPTY_PLANS)
    setConnections(EMPTY_CONNECTIONS)
    setReturnedFor(null)
    setLoaded(null)
  }, [])

  const signOut = useCallback(async () => {
    await service.signOut()
    clearDevice()
  }, [service, clearDevice])

  const deleteEverything = useCallback(async () => {
    try {
      await service.deleteAccount()
    } catch {
      return false
    }
    clearDevice()
    return true
  }, [service, clearDevice])

  const value = useMemo<AppState>(
    () => ({
      gate,
      account,
      retryProfile,
      profile,
      city,
      events,
      reloadEvents,
      plans,
      dispatch,
      connections,
      dispatchConnections,
      completeOnboarding,
      signOut,
      deleteEverything,
      returnPromptFor:
        returnedFor !== null && returnedFor === plans.awaitingReturn ? returnedFor : null,
    }),
    [
      gate,
      account,
      retryProfile,
      profile,
      city,
      events,
      reloadEvents,
      plans,
      dispatch,
      connections,
      dispatchConnections,
      completeOnboarding,
      signOut,
      deleteEverything,
      returnedFor,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
