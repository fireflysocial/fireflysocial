import type { InterestId } from './interests.ts'
import type { AccessNeedId, IntentId } from './profile.ts'

/**
 * An event found by the pipeline (an "Around the city" event, v4). Times are ISO instants and the
 * event carries its own IANA zone; it's always shown in that zone.
 */
export interface CityEvent {
  id: string
  cityId: string
  title: string
  startsAt: string
  endsAt: string
  timeZone: string
  venue: string
  neighbourhood: string
  /** In the event's currency; 0 means free. */
  price: number
  currency: string
  /** The event's own registration page, or null for a free event with no registration. */
  registrationUrl: string | null
  /** The page the facts were taken from. Every event keeps it. */
  sourceUrl: string
  interests: readonly InterestId[]
  /** Which reasons for coming this event suits (e.g. founder meetups suit "a co-founder"). */
  intents: readonly IntentId[]
  /** Newcomer meetups, language exchanges, "new members welcome" nights (v4 step 8). */
  newcomerFriendly: boolean
  /**
   * What the event's page states about access: true = confirmed, false = stated it isn't met,
   * missing = not listed. Never guessed.
   */
  access: Partial<Record<AccessNeedId, boolean>>
  /** True for the made-up events shown until the event pipeline is live. */
  isExample: boolean
}

export function hasStarted(event: CityEvent, now: Date): boolean {
  return Date.parse(event.startsAt) <= now.getTime()
}

export function hasEnded(event: CityEvent, now: Date): boolean {
  return Date.parse(event.endsAt) <= now.getTime()
}

/** The site an event links to, for "Register on example.com". */
export function siteName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'the event page'
  }
}
