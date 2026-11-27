import { describe, expect, it } from 'vitest'
import { inHours, makeEvent, makeProfile, NOW, TEST_CITY } from '../../test/fixtures.ts'
import type { CityEvent } from '../events.ts'
import { EMPTY_PLANS, plansReducer, type Plans } from '../plans.ts'
import type { Profile } from '../profile.ts'
import { zonedToInstant } from '../time.ts'
import { buildFeed } from './personalFeed.ts'

// NOW is Thursday 3 Dec 2026, noon in the test city (Toronto).
const local = (day: number, hour: number) =>
  zonedToInstant({ year: 2026, month: 12, day, hour, minute: 0 }, TEST_CITY.timeZone).toISOString()

const feed = (
  events: CityEvent[],
  profile: Profile = makeProfile(),
  plans: Plans = EMPTY_PLANS,
  showAll = false,
) => buildFeed({ events, profile, plans, city: TEST_CITY, now: NOW, showAll })

const ids = (f: ReturnType<typeof feed>) => f.items.map((i) => i.event.id)

describe('buildFeed: what is shown', () => {
  it('shows only this week’s upcoming events', () => {
    const events = [
      makeEvent({ id: 'past', startsAt: inHours(-1), interests: ['board-games'] }),
      makeEvent({ id: 'soon', startsAt: inHours(24), interests: ['board-games'] }),
      makeEvent({ id: 'next-week', startsAt: inHours(24 * 8), interests: ['board-games'] }),
    ]
    expect(ids(feed(events))).toEqual(['soon'])
  })

  it('hides events the person said "Not for me" to', () => {
    const events = [makeEvent({ id: 'a', interests: ['board-games'] })]
    const plans = plansReducer(EMPTY_PLANS, { type: 'not-for-me', eventId: 'a', reason: null })
    expect(ids(feed(events, makeProfile(), plans))).toEqual([])
  })

  it('hides an event whose page says it doesn’t meet a set access need', () => {
    const events = [
      makeEvent({ id: 'stairs', interests: ['board-games'], access: { 'step-free': false } }),
    ]
    expect(ids(feed(events, makeProfile({ accessNeeds: ['step-free'] })))).toEqual([])
    expect(ids(feed(events))).toEqual(['stairs'])
  })

  it('says honestly when nothing fits, instead of padding with poor matches', () => {
    const events = [makeEvent({ id: 'unrelated', interests: ['hiking'] })]
    const result = feed(events)
    expect(result.items).toEqual([])
    expect(result.nothingFits).toBe(true)
    const all = feed(events, makeProfile(), EMPTY_PLANS, true)
    expect(ids(all)).toEqual(['unrelated'])
    expect(all.items[0]?.reason).toMatch(/^Something different · /)
  })
})

describe('buildFeed: ranking', () => {
  it('ranks by matching interests, then soonest first', () => {
    const events = [
      makeEvent({ id: 'one', startsAt: inHours(5), interests: ['board-games'] }),
      makeEvent({ id: 'two', startsAt: inHours(30), interests: ['board-games', 'pottery'] }),
      makeEvent({ id: 'one-later', startsAt: inHours(10), interests: ['run-clubs'] }),
    ]
    expect(ids(feed(events))).toEqual(['two', 'one', 'one-later'])
  })

  it('favours free times, neighbourhoods, budget and confirmed access', () => {
    const base = { interests: ['board-games'] as const }
    const events = [
      makeEvent({ id: 'plain', startsAt: local(4, 12), ...base }),
      makeEvent({ id: 'evening', startsAt: local(4, 19), ...base }), // Friday evening
      makeEvent({ id: 'nearby', startsAt: local(4, 13), neighbourhood: 'Hillside', ...base }),
      makeEvent({ id: 'pricey', startsAt: local(4, 11), price: 30, ...base }),
    ]
    const profile = makeProfile({
      freeTimes: ['weekday-evenings'],
      neighbourhoods: ['Hillside'],
      budget: 'low',
    })
    expect(ids(feed(events, profile))).toEqual(['evening', 'nearby', 'plain', 'pricey'])
  })

  it('treats "free only" as a budget of zero', () => {
    const events = [
      makeEvent({ id: 'paid', startsAt: inHours(5), price: 5, interests: ['board-games'] }),
      makeEvent({ id: 'free', startsAt: inHours(6), interests: ['board-games'] }),
    ]
    expect(ids(feed(events, makeProfile({ budget: 'free' })))).toEqual(['free', 'paid'])
  })

  it('ranks up events like ones the person wanted more of', () => {
    const liked = makeEvent({
      id: 'liked',
      startsAt: inHours(5),
      interests: ['board-games', 'trivia'],
    })
    const similar = makeEvent({ id: 'similar', startsAt: inHours(30), interests: ['trivia'] })
    const plans = plansReducer(EMPTY_PLANS, { type: 'more-like-this', eventId: 'liked' })
    const result = feed([liked, similar], makeProfile(), plans)
    expect(ids(result)).toEqual(['liked', 'similar'])
    expect(result.items[1]?.reason).toMatch(/^Like events you wanted more of · /)
    expect(ids(feed([liked, similar]))).toEqual(['liked'])
  })
})

describe('buildFeed: why each event is there', () => {
  it('names the interest, the day and the price', () => {
    const events = [
      makeEvent({
        id: 'a',
        startsAt: local(3, 19),
        price: 12,
        interests: ['pottery', 'board-games'],
      }),
    ]
    expect(feed(events).items[0]?.reason).toBe('Because you like pottery · Thursday evening · $12')
  })

  it('names what brings the person to Firefly when no interest matches', () => {
    const events = [makeEvent({ id: 'founders', startsAt: local(4, 8), intents: ['cofounder'] })]
    const profile = makeProfile({ intents: ['events', 'cofounder'] })
    expect(feed(events, profile).items[0]?.reason).toBe(
      "Because you're looking for a co-founder · Friday morning · Free",
    )
  })

  it('"just good events" alone doesn’t count as a match', () => {
    const events = [makeEvent({ id: 'any', intents: ['friends'] })]
    expect(feed(events, makeProfile({ intents: ['events'] })).nothingFits).toBe(true)
  })

  it('welcomes newcomers to newcomer-friendly events', () => {
    const events = [makeEvent({ id: 'welcome', startsAt: local(4, 14), newcomerFriendly: true })]
    expect(feed(events).items).toEqual([])
    expect(feed(events, makeProfile({ newcomer: true })).items[0]?.reason).toBe(
      'Welcoming to people new to Testville · Friday afternoon · Free',
    )
  })
})

describe('buildFeed: accessibility is never assumed', () => {
  const needs = makeProfile({ accessNeeds: ['step-free', 'quieter'] })

  it('says so when the page confirms every need, and ranks it higher', () => {
    const events = [
      makeEvent({ id: 'unlisted', startsAt: inHours(5), interests: ['board-games'] }),
      makeEvent({
        id: 'confirmed',
        startsAt: inHours(6),
        interests: ['board-games'],
        access: { 'step-free': true, quieter: true },
      }),
    ]
    const result = feed(events, needs)
    expect(ids(result)).toEqual(['confirmed', 'unlisted'])
    expect(result.items[0]?.access).toEqual({
      kind: 'confirmed',
      text: 'Step-free, per the organiser · Quieter venue, per the organiser',
    })
    expect(result.items[1]?.access).toEqual({
      kind: 'not-listed',
      text: 'Accessibility not listed',
    })
  })

  it('treats a partly confirmed event as not listed', () => {
    const events = [
      makeEvent({ id: 'partly', interests: ['board-games'], access: { 'step-free': true } }),
    ]
    expect(feed(events, needs).items[0]?.access?.kind).toBe('not-listed')
  })

  it('shows no access note when the person set no needs', () => {
    const events = [
      makeEvent({ id: 'a', interests: ['board-games'], access: { 'step-free': true } }),
    ]
    expect(feed(events).items[0]?.access).toBeNull()
  })
})
