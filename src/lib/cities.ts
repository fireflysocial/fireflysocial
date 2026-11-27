/**
 * The cities Firefly runs in. Everything city-specific (time zone, currency, neighbourhoods, the
 * low-cost budget cap) lives here as data, never in code (CLAUDE.md §1). Vancouver is the first
 * launch city; adding a city means adding a row here, after its privacy-law review (§12).
 */
export interface City {
  id: string
  name: string
  /** IANA time zone. */
  timeZone: string
  /** ISO 4217 currency code. */
  currency: string
  /** BCP 47 locale for dates and prices. */
  locale: string
  /** The "low cost" budget cap, in the city's currency (v3 #16). */
  lowCostCap: number
  /** Neighbourhoods people can pick (a list, never GPS). */
  neighbourhoods: readonly string[]
}

const VANCOUVER: City = {
  id: 'vancouver',
  name: 'Vancouver',
  timeZone: 'America/Vancouver',
  currency: 'CAD',
  locale: 'en-CA',
  lowCostCap: 20,
  neighbourhoods: [
    'Downtown',
    'Gastown',
    'Chinatown',
    'Strathcona',
    'Mount Pleasant',
    'Main Street',
    'Commercial Drive',
    'Kitsilano',
    'Fairview',
    'West End',
  ],
}

export const CITIES: readonly City[] = [VANCOUVER]

/** The city new people start in while Vancouver is the only one (v4 step 4 is skipped). */
export const LAUNCH_CITY: City = VANCOUVER

export function cityById(id: string): City | undefined {
  return CITIES.find((city) => city.id === id)
}
