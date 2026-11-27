import { useParams } from 'react-router'
import type { CityEvent } from '../../../lib/events.ts'
import { readyEvents, useAppState } from '../appState.ts'

/** The event named in the URL, once events have loaded. */
export function useEvent(): CityEvent | undefined {
  const { eventId } = useParams()
  const { events } = useAppState()
  return readyEvents(events).find((e) => e.id === eventId)
}
