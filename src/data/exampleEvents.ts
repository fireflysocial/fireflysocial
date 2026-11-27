import type { City } from '../lib/cities.ts'
import type { CityEvent } from '../lib/events.ts'
import type { InterestId } from '../lib/interests.ts'
import type { AccessNeedId, IntentId } from '../lib/profile.ts'
import { addLocalDays, zonedToInstant } from '../lib/time.ts'

/**
 * MADE-UP events, shown until the event pipeline is live (v4, "The event pipeline"). They're
 * generated around "now" so the feed always has an upcoming week, and every one is marked
 * isExample so the UI labels it. Titles and venues are invented; links go to example.com.
 * Never present these as real listings (PRODUCT.md, "Evidence on Hand").
 */
interface Template {
  slug: string
  title: string
  venue: string
  /** Index into the city's neighbourhood list. */
  area: number
  /** Days after today (in the city's zone). */
  day: number
  hour: number
  minute?: number
  hours: number
  price: number
  /** False for a free event with no registration ("I'm going" directly). */
  registers: boolean
  interests: InterestId[]
  intents: IntentId[]
  newcomerFriendly?: boolean
  access?: Partial<Record<AccessNeedId, boolean>>
}

const TEMPLATES: Template[] = [
  {
    slug: 'founders-coffee',
    title: 'Founders’ coffee morning',
    venue: 'A café near the station',
    area: 1,
    day: 1,
    hour: 8,
    minute: 30,
    hours: 1.5,
    price: 0,
    registers: true,
    interests: ['startup-meetups', 'coffee-meetups'],
    intents: ['cofounder', 'network', 'collaborators'],
  },
  {
    slug: 'career-talk',
    title: 'Switching careers into tech: a panel',
    venue: 'Public library, room 3',
    area: 0,
    day: 1,
    hour: 18,
    hours: 2,
    price: 15,
    registers: true,
    interests: ['career-talks', 'networking-nights'],
    intents: ['network'],
    access: { 'step-free': true, captions: true },
  },
  {
    slug: 'hack-night',
    title: 'Hack night: build something in three hours',
    venue: 'A shared workspace',
    area: 4,
    day: 2,
    hour: 18,
    hours: 3,
    price: 10,
    registers: true,
    interests: ['hackathons', 'tech-talks'],
    intents: ['collaborators', 'cofounder'],
  },
  {
    slug: 'board-games',
    title: 'Board game social',
    venue: 'A board game café',
    area: 5,
    day: 2,
    hour: 19,
    hours: 3,
    price: 0,
    registers: false,
    interests: ['board-games'],
    intents: ['friends'],
    access: { 'step-free': true },
  },
  {
    slug: 'climbing',
    title: 'Beginner bouldering meetup',
    venue: 'A climbing gym',
    area: 8,
    day: 2,
    hour: 18,
    minute: 30,
    hours: 2,
    price: 22,
    registers: true,
    interests: ['climbing'],
    intents: ['friends'],
  },
  {
    slug: 'language-exchange',
    title: 'Language exchange: English, Spanish, French',
    venue: 'A community centre',
    area: 0,
    day: 3,
    hour: 18,
    minute: 30,
    hours: 2,
    price: 0,
    registers: true,
    interests: ['language-exchange', 'newcomer-meetups'],
    intents: ['friends'],
    newcomerFriendly: true,
    access: { quieter: true, 'step-free': true },
  },
  {
    slug: 'gallery-opening',
    title: 'Gallery opening: new work by local printmakers',
    venue: 'A small gallery',
    area: 2,
    day: 3,
    hour: 19,
    hours: 2,
    price: 0,
    registers: true,
    interests: ['gallery-openings'],
    intents: ['friends', 'network'],
    access: { 'step-free': false },
  },
  {
    slug: 'book-club',
    title: 'Short fiction book club',
    venue: 'A bookshop',
    area: 8,
    day: 4,
    hour: 19,
    hours: 1.5,
    price: 0,
    registers: true,
    interests: ['book-clubs', 'writing'],
    intents: ['friends'],
    access: { quieter: true },
  },
  {
    slug: 'run-club',
    title: 'Saturday 5K social run',
    venue: 'Meet at the beach park entrance',
    area: 7,
    day: 4,
    hour: 9,
    hours: 1.5,
    price: 0,
    registers: false,
    interests: ['run-clubs'],
    intents: ['friends'],
  },
  {
    slug: 'pottery',
    title: 'Pottery wheel drop-in',
    venue: 'A ceramics studio',
    area: 6,
    day: 5,
    hour: 14,
    hours: 2,
    price: 25,
    registers: true,
    interests: ['pottery', 'workshops'],
    intents: ['friends'],
  },
  {
    slug: 'trivia',
    title: 'Quiet-room trivia night',
    venue: 'A neighbourhood hall',
    area: 5,
    day: 5,
    hour: 19,
    minute: 30,
    hours: 2,
    price: 5,
    registers: true,
    interests: ['trivia'],
    intents: ['friends'],
    access: { quieter: true },
  },
  {
    slug: 'newcomer-welcome',
    title: 'New to the city? Welcome evening',
    venue: 'A community centre',
    area: 3,
    day: 6,
    hour: 18,
    hours: 2,
    price: 0,
    registers: true,
    interests: ['newcomer-meetups', 'volunteering'],
    intents: ['friends'],
    newcomerFriendly: true,
    access: { 'step-free': true, quieter: true },
  },
  {
    slug: 'park-cleanup',
    title: 'Park clean-up and coffee',
    venue: 'Meet by the park fieldhouse',
    area: 3,
    day: 6,
    hour: 10,
    hours: 2,
    price: 0,
    registers: true,
    interests: ['volunteering', 'walking-groups'],
    intents: ['friends'],
    newcomerFriendly: true,
  },
  {
    slug: 'design-crit',
    title: 'Design and product crit night',
    venue: 'A design studio',
    area: 4,
    day: 6,
    hour: 18,
    minute: 30,
    hours: 2,
    price: 0,
    registers: true,
    interests: ['startup-meetups', 'workshops'],
    intents: ['collaborators', 'network'],
  },
  {
    slug: 'supper-club',
    title: 'Long-table supper club',
    venue: 'A restaurant’s back room',
    area: 6,
    day: 9,
    hour: 19,
    hours: 2.5,
    price: 40,
    registers: true,
    interests: ['supper-clubs'],
    intents: ['friends'],
  },
]

/** The made-up events for a city, for the days around `now`, in the city's own time zone. */
export function exampleEvents(city: City, now: Date): CityEvent[] {
  return TEMPLATES.map((t) => {
    const date = addLocalDays(now, t.day, city.timeZone)
    const start = zonedToInstant({ ...date, hour: t.hour, minute: t.minute ?? 0 }, city.timeZone)
    const end = new Date(start.getTime() + t.hours * 60 * 60 * 1000)
    const stamp = `${String(date.year)}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    return {
      id: `${city.id}-${t.slug}-${stamp}`,
      cityId: city.id,
      title: t.title,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      timeZone: city.timeZone,
      venue: t.venue,
      neighbourhood: city.neighbourhoods[t.area % city.neighbourhoods.length] ?? city.name,
      price: t.price,
      currency: city.currency,
      registrationUrl: t.registers ? `https://example.com/events/${t.slug}` : null,
      sourceUrl: `https://example.com/events/${t.slug}`,
      interests: t.interests,
      intents: t.intents,
      newcomerFriendly: t.newcomerFriendly ?? false,
      access: t.access ?? {},
      isExample: true,
    }
  }).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
}
