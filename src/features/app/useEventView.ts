import { useMemo } from 'react'
import type { CityEvent } from '../../lib/events.ts'
import { buildFeed, type FeedItem } from '../../lib/feed/personalFeed.ts'
import { EMPTY_PLANS } from '../../lib/plans.ts'
import { useAppState, useProfile } from './appState.ts'
import { useClock } from './clock.ts'

/**
 * One event with the same "why it's here" line and access note as its feed card, or null when it
 * isn't in this week's window (e.g. it has started). Feedback is ignored so the line still shows
 * for an event the person hid.
 */
export function useEventView(event: CityEvent | undefined): FeedItem | null {
  const { city } = useAppState()
  const profile = useProfile()
  const clock = useClock()
  return useMemo(() => {
    if (!event) return null
    const feed = buildFeed({
      events: [event],
      profile,
      plans: EMPTY_PLANS,
      city,
      now: clock(),
      showAll: true,
    })
    return feed.items[0] ?? null
  }, [event, profile, city, clock])
}
