import { describe, expect, it } from 'vitest'
import { inHours, makeEvent, NOW } from '../test/fixtures.ts'
import {
  afterEventQuestions,
  EMPTY_PLANS,
  isGoing,
  notForMeReason,
  parsePlans,
  plansReducer,
  prunePlans,
  registrationReminders,
  type Plans,
  type PlansAction,
} from './plans.ts'

const run = (...actions: PlansAction[]) => actions.reduce(plansReducer, EMPTY_PLANS)

describe('plansReducer', () => {
  it('saves and unsaves', () => {
    expect(run({ type: 'toggle-save', eventId: 'a' }).saved).toEqual(['a'])
    expect(
      run({ type: 'toggle-save', eventId: 'a' }, { type: 'toggle-save', eventId: 'a' }).saved,
    ).toEqual([])
  })

  it('records feedback and undoes it', () => {
    const more = run({ type: 'more-like-this', eventId: 'a' })
    expect(more.feedback).toEqual({ a: { kind: 'more' } })
    const not = run({ type: 'not-for-me', eventId: 'b', reason: 'too-far' })
    expect(not.feedback).toEqual({ b: { kind: 'not-for-me', reason: 'too-far' } })
    expect(plansReducer(not, { type: 'undo-feedback', eventId: 'b' }).feedback).toEqual({})
  })

  it('records a registration click as interest only, and waits for the return', () => {
    const plans = run(
      { type: 'open-registration', eventId: 'a' },
      { type: 'open-registration', eventId: 'a' },
    )
    expect(plans.clicked).toEqual(['a'])
    expect(plans.awaitingReturn).toBe('a')
    expect(isGoing(plans, 'a')).toBe(false)
  })

  it('only a confirmed yes counts as going, and answering stops the wait', () => {
    const plans = run(
      { type: 'open-registration', eventId: 'a' },
      { type: 'answer-going', eventId: 'a', answer: 'going' },
    )
    expect(isGoing(plans, 'a')).toBe(true)
    expect(plans.awaitingReturn).toBeNull()
    const remind = run({ type: 'answer-going', eventId: 'a', answer: 'remind' })
    expect(isGoing(remind, 'a')).toBe(false)
  })

  it('answering for another event keeps waiting for the open one', () => {
    const plans = run(
      { type: 'open-registration', eventId: 'a' },
      { type: 'answer-going', eventId: 'b', answer: 'going' },
    )
    expect(plans.awaitingReturn).toBe('a')
  })

  it('dismisses the return prompt, flags listings once, and records after-event answers', () => {
    const plans = run(
      { type: 'open-registration', eventId: 'a' },
      { type: 'dismiss-return' },
      { type: 'flag', eventId: 'a' },
      { type: 'flag', eventId: 'a' },
      { type: 'after-event', eventId: 'a', answer: 'good' },
    )
    expect(plans.awaitingReturn).toBeNull()
    expect(plans.flagged).toEqual(['a'])
    expect(plans.afterEvent).toEqual({ a: 'good' })
  })
})

describe('notForMeReason', () => {
  it('gives the reason only for a "Not for me" with one', () => {
    const plans = run(
      { type: 'not-for-me', eventId: 'a', reason: 'too-far' },
      { type: 'more-like-this', eventId: 'b' },
    )
    expect(notForMeReason(plans, 'a')).toBe('too-far')
    expect(notForMeReason(plans, 'b')).toBeNull()
    expect(notForMeReason(plans, 'c')).toBeNull()
  })
})

describe('registrationReminders', () => {
  const soon = makeEvent({ id: 'soon', startsAt: inHours(5) })
  const started = makeEvent({ id: 'started', startsAt: inHours(-1) })
  const other = makeEvent({ id: 'other', startsAt: inHours(5) })

  it('asks about clicked-but-unanswered and "remind me" events until they start', () => {
    const plans = run(
      { type: 'open-registration', eventId: 'soon' },
      { type: 'dismiss-return' },
      { type: 'open-registration', eventId: 'started' },
      { type: 'dismiss-return' },
      { type: 'answer-going', eventId: 'other', answer: 'remind' },
    )
    expect(registrationReminders(plans, [soon, started, other], NOW).map((e) => e.id)).toEqual([
      'soon',
      'other',
    ])
  })

  it('doesn’t repeat the open prompt, or ask about answered events', () => {
    const waiting = run({ type: 'open-registration', eventId: 'soon' })
    expect(registrationReminders(waiting, [soon], NOW)).toEqual([])
    const answered = run(
      { type: 'open-registration', eventId: 'soon' },
      { type: 'answer-going', eventId: 'soon', answer: 'not-going' },
    )
    expect(registrationReminders(answered, [soon], NOW)).toEqual([])
  })
})

describe('afterEventQuestions', () => {
  it('asks "Did you go?" once, only for ended events the person was going to', () => {
    const ended = makeEvent({ id: 'ended', startsAt: inHours(-3), endsAt: inHours(-1) })
    const upcoming = makeEvent({ id: 'upcoming', startsAt: inHours(3) })
    const notGoing = makeEvent({ id: 'not-going', startsAt: inHours(-3), endsAt: inHours(-1) })
    const plans = run(
      { type: 'answer-going', eventId: 'ended', answer: 'going' },
      { type: 'answer-going', eventId: 'upcoming', answer: 'going' },
    )
    const events = [ended, upcoming, notGoing]
    expect(afterEventQuestions(plans, events, NOW).map((e) => e.id)).toEqual(['ended'])
    const answered = plansReducer(plans, {
      type: 'after-event',
      eventId: 'ended',
      answer: 'didnt-go',
    })
    expect(afterEventQuestions(answered, events, NOW)).toEqual([])
  })
})

describe('prunePlans', () => {
  it('forgets events that ended over a week ago or are no longer listed', () => {
    const recent = makeEvent({ id: 'recent', startsAt: inHours(-30), endsAt: inHours(-28) })
    const old = makeEvent({ id: 'old', startsAt: inHours(-24 * 8 - 2), endsAt: inHours(-24 * 8) })
    const everything = (id: string): PlansAction[] => [
      { type: 'toggle-save', eventId: id },
      { type: 'more-like-this', eventId: id },
      { type: 'open-registration', eventId: id },
      { type: 'answer-going', eventId: id, answer: 'going' },
      { type: 'flag', eventId: id },
      { type: 'after-event', eventId: id, answer: 'good' },
    ]
    const plans = run(...everything('recent'), ...everything('old'), ...everything('gone'), {
      type: 'open-registration',
      eventId: 'recent',
    })
    const pruned = prunePlans(plans, [recent, old], NOW)
    expect(pruned).toEqual({
      saved: ['recent'],
      feedback: { recent: { kind: 'more' } },
      clicked: ['recent'],
      going: { recent: 'going' },
      awaitingReturn: 'recent',
      flagged: ['recent'],
      afterEvent: { recent: 'good' },
    })
    expect(
      prunePlans(run({ type: 'open-registration', eventId: 'gone' }), [], NOW).awaitingReturn,
    ).toBeNull()
    expect(prunePlans(EMPTY_PLANS, [], NOW).awaitingReturn).toBeNull()
  })
})

describe('parsePlans', () => {
  it('round-trips valid plans', () => {
    const plans: Plans = run(
      { type: 'toggle-save', eventId: 'a' },
      { type: 'not-for-me', eventId: 'b', reason: null },
      { type: 'not-for-me', eventId: 'c', reason: 'too-expensive' },
      { type: 'more-like-this', eventId: 'd' },
      { type: 'open-registration', eventId: 'a' },
      { type: 'answer-going', eventId: 'a', answer: 'going' },
      { type: 'flag', eventId: 'a' },
      { type: 'after-event', eventId: 'a', answer: 'not-for-me' },
    )
    expect(parsePlans(JSON.parse(JSON.stringify(plans)))).toEqual(plans)
  })

  it('starts empty from nothing or junk', () => {
    expect(parsePlans(null)).toEqual(EMPTY_PLANS)
    expect(parsePlans('plans')).toEqual(EMPTY_PLANS)
    expect(parsePlans({})).toEqual(EMPTY_PLANS)
  })

  it('drops damaged entries one by one, keeping the rest', () => {
    expect(
      parsePlans({
        saved: ['a', 3],
        feedback: {
          a: { kind: 'more' },
          b: { kind: 'not-for-me' },
          c: { kind: 'not-for-me', reason: 'boring' },
          d: { kind: 'love' },
          e: 'more',
        },
        going: { a: 'going', b: 'maybe' },
        afterEvent: { a: 'good', b: 'great' },
        clicked: 'a',
        flagged: [null, 'z'],
        awaitingReturn: 5,
      }),
    ).toEqual({
      ...EMPTY_PLANS,
      saved: ['a'],
      feedback: { a: { kind: 'more' }, b: { kind: 'not-for-me', reason: null } },
      going: { a: 'going' },
      afterEvent: { a: 'good' },
      flagged: ['z'],
    })
    expect(parsePlans({ going: ['going'] }).going).toEqual({})
    expect(parsePlans({ awaitingReturn: 'a' }).awaitingReturn).toBe('a')
  })
})
