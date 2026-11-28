import type { City } from '../lib/cities.ts'
import type { CityEvent } from '../lib/events.ts'
import type { Profile } from '../lib/profile.ts'

/** A test city in a settled time zone (Toronto), so expectations don't drift with tz rules. */
export const TEST_CITY: City = {
  id: 'testville',
  name: 'Testville',
  timeZone: 'America/Toronto',
  currency: 'CAD',
  locale: 'en-CA',
  lowCostCap: 20,
  neighbourhoods: ['Harbour', 'Old Town', 'Hillside'],
}

/** Thursday 3 December 2026, noon in Toronto. */
export const NOW = new Date('2026-12-03T17:00:00Z')

const HOUR = 60 * 60 * 1000

export function makeEvent(overrides: Partial<CityEvent> & { id: string }): CityEvent {
  const startsAt = overrides.startsAt ?? new Date(NOW.getTime() + 30 * HOUR).toISOString()
  return {
    cityId: TEST_CITY.id,
    title: `Event ${overrides.id}`,
    startsAt,
    endsAt: new Date(Date.parse(startsAt) + 2 * HOUR).toISOString(),
    timeZone: TEST_CITY.timeZone,
    venue: 'A hall',
    neighbourhood: 'Harbour',
    price: 0,
    currency: 'CAD',
    registrationUrl: 'https://example.com/e',
    sourceUrl: 'https://example.com/e',
    interests: [],
    intents: [],
    newcomerFriendly: false,
    access: {},
    isExample: true,
    ...overrides,
  }
}

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    firstName: 'Alex',
    cityId: TEST_CITY.id,
    intents: [],
    workArea: null,
    projectRoles: [],
    projectStage: null,
    interests: ['board-games', 'run-clubs', 'pottery'],
    eventStyle: null,
    groupSize: null,
    approach: null,
    languages: [],
    learning: [],
    freeTimes: [],
    pace: null,
    neighbourhoods: [],
    budget: 'any',
    newcomer: null,
    accessNeeds: [],
    pledgedAt: '2026-12-01T00:00:00.000Z',
    ...overrides,
  }
}

/** An ISO instant `hours` after NOW. */
export const inHours = (hours: number) => new Date(NOW.getTime() + hours * HOUR).toISOString()
