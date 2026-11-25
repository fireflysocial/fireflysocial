/** Interests a person can pick in onboarding. Labels are everyday words, not categories. */
export const INTERESTS = [
  { id: 'board-games', label: 'Board games' },
  { id: 'running', label: 'Running' },
  { id: 'languages', label: 'Languages' },
  { id: 'crafts', label: 'Crafts' },
  { id: 'outdoors', label: 'Outdoors' },
  { id: 'books', label: 'Books' },
  { id: 'volunteering', label: 'Volunteering' },
  { id: 'food', label: 'Food & drink' },
] as const

export type InterestId = (typeof INTERESTS)[number]['id']

export interface EventSummary {
  id: string
  title: string
  /** Day and time as shown, e.g. "Thu · 7 pm". */
  when: string
  /** Where, as shown, e.g. "Commercial Drive". */
  place: string
  /** Price as shown, e.g. "Free" or "$12". */
  price: string
  interests: readonly InterestId[]
}

export interface RankedEvent {
  event: EventSummary
  /** Which of the person's interests this event matches, in the order they appear on the event. */
  matches: InterestId[]
  /** One plain line on why the event is here, or null when nothing was picked yet. */
  reason: string | null
}

export function interestLabel(id: InterestId): string {
  return INTERESTS.find((interest) => interest.id === id)?.label ?? id
}

/**
 * Orders events by how many of the person's interests they match, most first. Ties keep their
 * original order (soonest first, as listed), so the feed is stable as interests change.
 */
export function rankEvents(
  events: readonly EventSummary[],
  picked: ReadonlySet<InterestId>,
): RankedEvent[] {
  return events
    .map((event, index) => {
      const matches = event.interests.filter((interest) => picked.has(interest))
      return { event, matches, index }
    })
    .sort((a, b) => b.matches.length - a.matches.length || a.index - b.index)
    .map(({ event, matches }) => ({ event, matches, reason: reasonFor(matches, picked) }))
}

function reasonFor(matches: readonly InterestId[], picked: ReadonlySet<InterestId>): string | null {
  if (picked.size === 0) return null
  const [first, second] = matches
  if (!first) return 'Something new for you'
  if (!second) return `Because you like ${interestLabel(first).toLowerCase()}`
  return `Because you like ${interestLabel(first).toLowerCase()} and ${interestLabel(second).toLowerCase()}`
}
