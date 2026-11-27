import { describe, expect, it } from 'vitest'
import {
  addLocalDays,
  dayPart,
  dayPartLabel,
  formatEventWhen,
  localParts,
  zonedToInstant,
  type LocalDateTime,
} from './time.ts'

// Expectations are written as round trips through Intl, or in zones whose rules are long settled,
// so they don't depend on the machine's zone or on a city changing its DST rules.
const at = (iso: string) => new Date(iso)

describe('zonedToInstant', () => {
  it.each([
    ['America/Vancouver', { year: 2026, month: 12, day: 3, hour: 19, minute: 0 }],
    ['America/Vancouver', { year: 2026, month: 7, day: 1, hour: 9, minute: 30 }],
    ['Australia/Sydney', { year: 2026, month: 12, day: 3, hour: 19, minute: 0 }],
    ['Australia/Sydney', { year: 2026, month: 6, day: 15, hour: 8, minute: 15 }],
    ['Asia/Kolkata', { year: 2026, month: 3, day: 1, hour: 18, minute: 45 }],
  ] satisfies [string, LocalDateTime][])('round-trips %s %o', (zone, local) => {
    const instant = zonedToInstant(local, zone)
    const { weekday, ...back } = localParts(instant, zone)
    expect(back).toEqual(local)
    expect(weekday).toBeGreaterThanOrEqual(0)
  })

  it('uses the offset in force on the day, either side of a DST change (northern hemisphere)', () => {
    // Toronto: EST (UTC-5) until 8 March 2026, EDT (UTC-4) after.
    const before = { year: 2026, month: 3, day: 7, hour: 19, minute: 0 }
    const after = { year: 2026, month: 3, day: 9, hour: 19, minute: 0 }
    expect(zonedToInstant(before, 'America/Toronto').toISOString()).toBe('2026-03-08T00:00:00.000Z')
    expect(zonedToInstant(after, 'America/Toronto').toISOString()).toBe('2026-03-09T23:00:00.000Z')
  })

  it('uses the offset in force on the day, either side of a DST change (southern hemisphere)', () => {
    // Sydney: AEDT (UTC+11) until 5 April 2026, AEST (UTC+10) after.
    const before = { year: 2026, month: 4, day: 4, hour: 19, minute: 0 }
    const after = { year: 2026, month: 4, day: 6, hour: 19, minute: 0 }
    expect(zonedToInstant(before, 'Australia/Sydney').toISOString()).toBe(
      '2026-04-04T08:00:00.000Z',
    )
    expect(zonedToInstant(after, 'Australia/Sydney').toISOString()).toBe('2026-04-06T09:00:00.000Z')
  })

  it('moves a time in the spring-forward gap forward, as clocks do', () => {
    // 2:30 am on 8 March 2026 doesn't exist in Toronto.
    const instant = zonedToInstant(
      { year: 2026, month: 3, day: 8, hour: 2, minute: 30 },
      'America/Toronto',
    )
    expect(localParts(instant, 'America/Toronto').hour).toBe(3)
  })
})

describe('localParts', () => {
  it('gives the weekday in the zone, not the machine', () => {
    // 03:00 UTC on Friday 4 Dec is still Thursday evening in the Americas, Friday in Sydney.
    expect(localParts(at('2026-12-04T03:00:00Z'), 'America/Toronto').weekday).toBe(4)
    expect(localParts(at('2026-12-04T03:00:00Z'), 'Australia/Sydney').weekday).toBe(5)
  })
})

describe('addLocalDays', () => {
  it('crosses month and year ends', () => {
    expect(addLocalDays(at('2026-12-30T20:00:00Z'), 3, 'Australia/Sydney')).toEqual({
      year: 2027,
      month: 1,
      day: 3,
    })
    expect(addLocalDays(at('2026-02-27T12:00:00Z'), 2, 'America/Toronto')).toEqual({
      year: 2026,
      month: 3,
      day: 1,
    })
  })
})

describe('dayPart', () => {
  const zone = 'America/Toronto'
  const local = (day: number, hour: number) =>
    zonedToInstant({ year: 2026, month: 12, day, hour, minute: 0 }, zone)

  it('splits the week into weekday and weekend, days and evenings (from 5 pm)', () => {
    expect(dayPart(local(3, 12), zone)).toBe('weekday-days') // Thursday noon
    expect(dayPart(local(3, 17), zone)).toBe('weekday-evenings') // Thursday 5 pm
    expect(dayPart(local(5, 10), zone)).toBe('weekend-days') // Saturday
    expect(dayPart(local(6, 19), zone)).toBe('weekend-evenings') // Sunday
  })
})

describe('dayPartLabel', () => {
  const zone = 'America/Toronto'
  const local = (hour: number) =>
    zonedToInstant({ year: 2026, month: 12, day: 3, hour, minute: 0 }, zone)

  it('names the day and part of day in the event’s zone', () => {
    expect(dayPartLabel(local(9), zone, 'en-CA')).toBe('Thursday morning')
    expect(dayPartLabel(local(14), zone, 'en-CA')).toBe('Thursday afternoon')
    expect(dayPartLabel(local(19), zone, 'en-CA')).toBe('Thursday evening')
  })
})

describe('formatEventWhen', () => {
  it('shows the date and hour in the event’s zone and locale', () => {
    const instant = zonedToInstant(
      { year: 2026, month: 12, day: 3, hour: 19, minute: 0 },
      'America/Toronto',
    )
    expect(formatEventWhen(instant, 'America/Toronto', 'en-CA')).toBe('Thu Dec 3 · 7 p.m.')
  })

  it('adds minutes only when they aren’t :00', () => {
    const instant = zonedToInstant(
      { year: 2026, month: 12, day: 3, hour: 19, minute: 30 },
      'America/Toronto',
    )
    expect(formatEventWhen(instant, 'America/Toronto', 'en-CA')).toBe('Thu Dec 3 · 7:30 p.m.')
  })

  it('follows the locale’s own order in another city', () => {
    const instant = zonedToInstant(
      { year: 2026, month: 12, day: 4, hour: 14, minute: 0 },
      'Australia/Sydney',
    )
    expect(formatEventWhen(instant, 'Australia/Sydney', 'en-AU')).toBe('Fri 4 Dec · 2 pm')
  })
})
