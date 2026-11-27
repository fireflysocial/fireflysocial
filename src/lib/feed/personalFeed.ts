import type { City } from '../cities.ts'
import type { CityEvent } from '../events.ts'
import { interestLabel, type InterestId } from '../interests.ts'
import type { Plans } from '../plans.ts'
import { formatPrice } from '../price.ts'
import { ACCESS_NEEDS, INTENTS, type AccessNeedId, type Profile } from '../profile.ts'
import { dayPart, dayPartLabel } from '../time.ts'

/** How far ahead the feed looks: "this week" (v4 §1). */
export const FEED_WINDOW_DAYS = 7

export type AccessNote = { kind: 'confirmed'; text: string } | { kind: 'not-listed'; text: string }

export interface FeedItem {
  event: CityEvent
  /** "Because you like board games · Thursday evening · Free". */
  reason: string
  /** Only when the person set an accessibility need. */
  access: AccessNote | null
  score: number
}

export interface Feed {
  items: FeedItem[]
  /** True when nothing this week fits, so the feed says so instead of padding (v4 §1). */
  nothingFits: boolean
}

interface FeedInput {
  events: readonly CityEvent[]
  profile: Profile
  plans: Plans
  city: City
  now: Date
  /** The person asked to see everything this week, after an honest empty feed. */
  showAll?: boolean
}

const WEIGHTS = {
  interest: 3,
  intent: 2,
  likedSimilar: 2,
  newcomer: 2,
  freeTime: 2,
  neighbourhood: 1,
  accessConfirmed: 1,
  overBudget: -4,
} as const

function budgetCap(profile: Profile, city: City): number {
  if (profile.budget === 'free') return 0
  if (profile.budget === 'low') return city.lowCostCap
  return Number.POSITIVE_INFINITY
}

/** Events the person said "Not for me" to, or whose page says a set access need isn't met. */
function isHidden(event: CityEvent, profile: Profile, plans: Plans): boolean {
  if (plans.feedback[event.id]?.kind === 'not-for-me') return true
  return profile.accessNeeds.some((need) => event.access[need] === false)
}

function accessNote(event: CityEvent, needs: readonly AccessNeedId[]): AccessNote | null {
  if (needs.length === 0) return null
  const confirmed = ACCESS_NEEDS.filter((n) => needs.includes(n.id) && event.access[n.id] === true)
  if (confirmed.length === needs.length) {
    return { kind: 'confirmed', text: confirmed.map((n) => n.confirmed).join(' · ') }
  }
  return { kind: 'not-listed', text: 'Accessibility not listed' }
}

function likedInterests(plans: Plans, events: readonly CityEvent[]): Set<InterestId> {
  const liked = new Set<InterestId>()
  for (const event of events) {
    if (plans.feedback[event.id]?.kind === 'more') for (const i of event.interests) liked.add(i)
  }
  return liked
}

/**
 * Builds the personal feed: this week's events, ranked for this person, each saying why it's
 * there. Pure and deterministic: everything it needs, including "now", is passed in.
 */
export function buildFeed({ events, profile, plans, city, now, showAll = false }: FeedInput): Feed {
  const windowEnd = now.getTime() + FEED_WINDOW_DAYS * 24 * 60 * 60 * 1000
  const liked = likedInterests(plans, events)
  const cap = budgetCap(profile, city)

  const scored = events
    .filter((event) => {
      const start = Date.parse(event.startsAt)
      return start > now.getTime() && start <= windowEnd && !isHidden(event, profile, plans)
    })
    .map((event) => {
      const start = new Date(event.startsAt)
      const interests = event.interests.filter((i) => profile.interests.includes(i))
      const intent = INTENTS.find(
        (i) => i.id !== 'events' && profile.intents.includes(i.id) && event.intents.includes(i.id),
      )
      const similar =
        event.interests.some((i) => liked.has(i)) && plans.feedback[event.id]?.kind !== 'more'
      const welcoming = profile.newcomer === true && event.newcomerFriendly
      const access = accessNote(event, profile.accessNeeds)

      const score =
        interests.length * WEIGHTS.interest +
        (intent ? WEIGHTS.intent : 0) +
        (similar ? WEIGHTS.likedSimilar : 0) +
        (welcoming ? WEIGHTS.newcomer : 0) +
        (isFree(profile, start, event.timeZone) ? WEIGHTS.freeTime : 0) +
        (profile.neighbourhoods.includes(event.neighbourhood) ? WEIGHTS.neighbourhood : 0) +
        (access?.kind === 'confirmed' ? WEIGHTS.accessConfirmed : 0) +
        (event.price > cap ? WEIGHTS.overBudget : 0)

      const fits = interests.length > 0 || intent !== undefined || similar || welcoming
      const why = interests[0]
        ? `Because you like ${interestLabel(interests[0]).toLowerCase()}`
        : intent
          ? `Because you're looking for ${intent.reason}`
          : similar
            ? 'Like events you wanted more of'
            : welcoming
              ? `Welcoming to people new to ${city.name}`
              : 'Something different'
      const reason = [
        why,
        dayPartLabel(start, event.timeZone, city.locale),
        formatPrice(event.price, event.currency, city.locale),
      ].join(' · ')

      return { item: { event, reason, access, score }, fits, start: start.getTime() }
    })

  const fitting = scored.filter((s) => s.fits)
  const shown = showAll ? scored : fitting
  const items = shown
    .sort((a, b) => b.item.score - a.item.score || a.start - b.start)
    .map((s) => s.item)
  return { items, nothingFits: fitting.length === 0 }
}

/** Whether the event falls in a time the person said they're free. Weekday daytime never does. */
function isFree(profile: Profile, start: Date, timeZone: string): boolean {
  const part = dayPart(start, timeZone)
  return profile.freeTimes.some((time) => time === part)
}
