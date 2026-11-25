import { describe, expect, it } from 'vitest'
import { INTERESTS, interestLabel, rankEvents, type EventSummary, type InterestId } from './rank.ts'

const event = (id: string, interests: InterestId[]): EventSummary => ({
  id,
  title: id,
  when: 'Thu · 7 pm',
  place: 'Main Street',
  price: 'Free',
  interests,
})

const events = [
  event('walk', ['outdoors']),
  event('games', ['board-games', 'food']),
  event('run', ['running', 'outdoors']),
  event('pottery', ['crafts']),
]

const ids = (picked: InterestId[]) => rankEvents(events, new Set(picked)).map((r) => r.event.id)

describe('rankEvents', () => {
  it('keeps the listed order, with no reasons, before anything is picked', () => {
    const ranked = rankEvents(events, new Set())
    expect(ranked.map((r) => r.event.id)).toEqual(['walk', 'games', 'run', 'pottery'])
    expect(ranked.every((r) => r.reason === null)).toBe(true)
  })

  it('puts events matching more interests first', () => {
    expect(ids(['outdoors', 'running'])).toEqual(['run', 'walk', 'games', 'pottery'])
  })

  it('keeps ties in their listed order', () => {
    expect(ids(['crafts', 'board-games'])).toEqual(['games', 'pottery', 'walk', 'run'])
  })

  it('says why each event is there', () => {
    const [top, second, last] = rankEvents(events, new Set<InterestId>(['outdoors', 'running']))
    expect(top?.reason).toBe('Because you like running and outdoors')
    expect(second?.reason).toBe('Because you like outdoors')
    expect(last?.reason).toBe('Something new for you')
  })

  it('lists the matching interests in the event’s own order', () => {
    const [top] = rankEvents(events, new Set<InterestId>(['food', 'board-games']))
    expect(top?.matches).toEqual(['board-games', 'food'])
  })

  it('does not change the events it is given', () => {
    const copy = [...events]
    rankEvents(events, new Set<InterestId>(['crafts']))
    expect(events).toEqual(copy)
  })
})

describe('interestLabel', () => {
  it('gives the everyday label for every interest', () => {
    for (const interest of INTERESTS) expect(interestLabel(interest.id)).toBe(interest.label)
  })
})
