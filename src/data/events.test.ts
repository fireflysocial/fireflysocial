import { describe, expect, it } from 'vitest'
import { CITIES } from '../lib/cities.ts'
import { localParts } from '../lib/time.ts'
import { NOW, TEST_CITY } from '../test/fixtures.ts'
import { listEvents } from './events.ts'
import { exampleEvents } from './exampleEvents.ts'

describe('example events (stub until the pipeline is live)', () => {
  it('are all marked as examples and link only to example.com', () => {
    for (const event of exampleEvents(TEST_CITY, NOW)) {
      expect(event.isExample).toBe(true)
      expect(new URL(event.sourceUrl).hostname).toBe('example.com')
      if (event.registrationUrl) expect(new URL(event.registrationUrl).hostname).toBe('example.com')
    }
  })

  it('are set in the city’s zone and currency, soonest first, with stable ids for the day', () => {
    const events = exampleEvents(TEST_CITY, NOW)
    const starts = events.map((e) => Date.parse(e.startsAt))
    expect(starts).toEqual([...starts].sort((a, b) => a - b))
    const coffee = events.find((e) => e.id === 'testville-founders-coffee-2026-12-04')
    expect(coffee).toBeDefined()
    expect(localParts(new Date(String(coffee?.startsAt)), TEST_CITY.timeZone)).toMatchObject({
      day: 4,
      hour: 8,
      minute: 30,
    })
    expect(events.every((e) => e.currency === 'CAD' && e.timeZone === TEST_CITY.timeZone)).toBe(
      true,
    )
    expect(events.every((e) => TEST_CITY.neighbourhoods.includes(e.neighbourhood))).toBe(true)
    expect(events.some((e) => e.registrationUrl === null)).toBe(true)
  })

  it('work for every launch city, and fall back to the city name with no neighbourhoods', () => {
    for (const city of CITIES) expect(exampleEvents(city, NOW).length).toBeGreaterThan(10)
    const bare = exampleEvents({ ...TEST_CITY, neighbourhoods: [] }, NOW)
    expect(bare.every((e) => e.neighbourhood === 'Testville')).toBe(true)
  })

  it('listEvents resolves to them', async () => {
    await expect(listEvents(TEST_CITY, NOW)).resolves.toEqual(exampleEvents(TEST_CITY, NOW))
  })
})
