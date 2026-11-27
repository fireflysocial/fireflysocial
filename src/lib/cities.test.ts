import { describe, expect, it } from 'vitest'
import { CITIES, cityById } from './cities.ts'

describe('cities', () => {
  it('every city has a valid time zone, currency and neighbourhoods', () => {
    for (const city of CITIES) {
      expect(() => new Intl.DateTimeFormat('en', { timeZone: city.timeZone })).not.toThrow()
      expect(
        () => new Intl.NumberFormat(city.locale, { style: 'currency', currency: city.currency }),
      ).not.toThrow()
      expect(city.neighbourhoods.length).toBeGreaterThan(0)
    }
  })

  it('finds a city by id, and nothing for an unknown id', () => {
    expect(cityById('vancouver')?.timeZone).toBe('America/Vancouver')
    expect(cityById('atlantis')).toBeUndefined()
  })
})
