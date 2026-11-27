import { describe, expect, it } from 'vitest'
import { makeProfile } from '../test/fixtures.ts'
import {
  draftFromProfile,
  emptyDraft,
  firstIncompleteStep,
  isStepId,
  STEPS,
  stepComplete,
  toggle,
  toProfile,
  type Draft,
} from './onboarding.ts'

const ready: Draft = {
  ...emptyDraft(),
  adult: true,
  pledge: true,
  firstName: ' Sam ',
  interests: ['board-games', 'pottery', 'trivia'],
}

describe('onboarding steps', () => {
  it('starts with free-or-low-cost as the budget and nothing else picked', () => {
    expect(emptyDraft()).toMatchObject({ budget: 'low', interests: [], newcomer: null })
  })

  it('requires 18+ and the pledge, a first name and at least 3 interests; the rest is optional', () => {
    const draft = emptyDraft()
    expect(STEPS.filter((s) => !stepComplete(s, draft))).toEqual(['pledge', 'name', 'interests'])
    expect(stepComplete('pledge', { ...draft, adult: true })).toBe(false)
    expect(stepComplete('interests', { ...draft, interests: ['pottery', 'trivia'] })).toBe(false)
  })

  it('finds the first step still missing an answer', () => {
    expect(firstIncompleteStep(emptyDraft())).toBe('pledge')
    expect(firstIncompleteStep({ ...ready, firstName: ' ' })).toBe('name')
    expect(firstIncompleteStep(ready)).toBeNull()
  })

  it('recognises step ids', () => {
    expect(isStepId('interests')).toBe(true)
    expect(isStepId('payment')).toBe(false)
  })
})

describe('toProfile', () => {
  it('builds a profile from a finished draft', () => {
    expect(toProfile(ready, 'vancouver', '2026-12-03T17:00:00.000Z')).toEqual({
      firstName: 'Sam',
      cityId: 'vancouver',
      intents: [],
      interests: ['board-games', 'pottery', 'trivia'],
      freeTimes: [],
      neighbourhoods: [],
      budget: 'low',
      newcomer: null,
      accessNeeds: [],
      pledgedAt: '2026-12-03T17:00:00.000Z',
    })
  })

  it('refuses an unfinished draft', () => {
    expect(() => toProfile({ ...ready, pledge: false }, 'vancouver', 'x')).toThrow('not finished')
    expect(() => toProfile({ ...ready, firstName: '' }, 'vancouver', 'x')).toThrow('not finished')
  })

  it('round-trips through draftFromProfile when answers are changed later', () => {
    const profile = makeProfile()
    expect(toProfile(draftFromProfile(profile), profile.cityId, profile.pledgedAt)).toEqual(profile)
  })
})

describe('toggle', () => {
  it('adds and removes', () => {
    expect(toggle(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggle(['a', 'b'], 'a')).toEqual(['b'])
  })
})
