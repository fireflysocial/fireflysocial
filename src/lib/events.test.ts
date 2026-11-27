import { describe, expect, it } from 'vitest'
import { inHours, makeEvent, NOW } from '../test/fixtures.ts'
import { hasEnded, hasStarted, siteName } from './events.ts'

describe('event timing', () => {
  const event = makeEvent({ id: 'e', startsAt: inHours(-1), endsAt: inHours(1) })

  it('knows when an event has started and ended', () => {
    expect(hasStarted(event, NOW)).toBe(true)
    expect(hasEnded(event, NOW)).toBe(false)
    expect(hasEnded(event, new Date(Date.parse(inHours(1))))).toBe(true)
    expect(hasStarted(makeEvent({ id: 'later', startsAt: inHours(2) }), NOW)).toBe(false)
  })
})

describe('siteName', () => {
  it('names the site without www', () => {
    expect(siteName('https://www.example.com/a')).toBe('example.com')
    expect(siteName('https://lu.ma/x')).toBe('lu.ma')
  })

  it('falls back for a broken URL', () => {
    expect(siteName('not a url')).toBe('the event page')
  })
})
