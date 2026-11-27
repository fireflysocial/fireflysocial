import type { City } from '../lib/cities.ts'
import type { CityEvent } from '../lib/events.ts'
import { exampleEvents } from './exampleEvents.ts'

/**
 * Events for a city, soonest first. STUB: returns made-up example events until the event
 * pipeline and its Supabase table exist. Keep the signature when it's replaced, so the screens
 * don't change. Async on purpose: the real version is a network call that can fail.
 */
export function listEvents(city: City, now: Date): Promise<CityEvent[]> {
  return Promise.resolve(exampleEvents(city, now))
}
