import { describe, expect, it } from 'vitest'
import { makeProfile } from '../test/fixtures.ts'
import { cleanFirstName, parseAnswers, parseProfile, pickAnswers, wantsProject } from './profile.ts'

describe('cleanFirstName', () => {
  it('trims and collapses spaces', () => {
    expect(cleanFirstName('  Mary   Ann ')).toBe('Mary Ann')
  })

  it('rejects empty and over-long names', () => {
    expect(cleanFirstName('   ')).toBeNull()
    expect(cleanFirstName('x'.repeat(41))).toBeNull()
    expect(cleanFirstName('x'.repeat(40))).toBe('x'.repeat(40))
  })
})

describe('wantsProject', () => {
  it('is true for people looking for a co-founder or collaborators', () => {
    expect(wantsProject(['cofounder'])).toBe(true)
    expect(wantsProject(['friends', 'collaborators'])).toBe(true)
    expect(wantsProject(['friends', 'network'])).toBe(false)
  })
})

const full = makeProfile({
  intents: ['cofounder', 'friends'],
  workArea: 'building',
  projectRoles: ['engineering'],
  projectStage: 'idea',
  eventStyle: 'activity',
  groupSize: 'small',
  approach: 'daunting',
  languages: ['english', 'punjabi'],
  learning: ['french'],
  freeTimes: ['weekend-days'],
  pace: 'weekly',
  neighbourhoods: ['Harbour'],
  budget: 'free',
  newcomer: true,
  accessNeeds: ['quieter'],
})

describe('parseProfile', () => {
  it('accepts a complete profile with every answer, and removes duplicates', () => {
    const raw: unknown = JSON.parse(JSON.stringify({ ...full, languages: ['english', 'english'] }))
    expect(parseProfile(raw)).toEqual({ ...full, languages: ['english'] })
  })

  it('accepts skipped answers', () => {
    expect(parseProfile(makeProfile())).toEqual(makeProfile())
  })

  it('cleans the first name', () => {
    expect(parseProfile({ ...full, firstName: '  Sam  ' })?.firstName).toBe('Sam')
  })

  it.each([
    ['nothing', null],
    ['a string', 'profile'],
    ['no name', { ...full, firstName: ' ' }],
    ['a non-string name', { ...full, firstName: 3 }],
    ['an absurdly long name', { ...full, firstName: 'x'.repeat(81) }],
    ['no city', { ...full, cityId: undefined }],
    ['no pledge', { ...full, pledgedAt: undefined }],
    ['too few interests', { ...full, interests: ['board-games'] }],
    ['an unknown interest', { ...full, interests: ['a', 'b', 'c'] }],
    ['an unknown intent', { ...full, intents: ['romance'] }],
    ['an unknown work area', { ...full, workArea: 'astronaut' }],
    ['an unknown project role', { ...full, projectRoles: ['ceo'] }],
    ['an unknown project stage', { ...full, projectStage: 'ipo' }],
    ['an unknown event style', { ...full, eventStyle: 'rave' }],
    ['an unknown group size', { ...full, groupSize: 'stadium' }],
    ['an unknown approach', { ...full, approach: 'fearless' }],
    ['an unknown language', { ...full, languages: ['klingon'] }],
    ['an unknown learning language', { ...full, learning: ['klingon'] }],
    ['a bad free time', { ...full, freeTimes: ['3am'] }],
    ['an unknown pace', { ...full, pace: 'daily' }],
    ['bad neighbourhoods', { ...full, neighbourhoods: [1] }],
    ['an empty neighbourhood', { ...full, neighbourhoods: [''] }],
    [
      'too many neighbourhoods',
      { ...full, neighbourhoods: Array.from({ length: 51 }, (_, i) => `n${String(i)}`) },
    ],
    ['an unknown budget', { ...full, budget: 'lavish' }],
    ['a bad newcomer answer', { ...full, newcomer: 'yes' }],
    ['an unknown access need', { ...full, accessNeeds: ['jetpack'] }],
    ['a non-list', { ...full, accessNeeds: 'step-free' }],
    ['a missing single answer', { ...full, pace: undefined }],
  ])('rejects %s', (_label, raw) => {
    expect(parseProfile(raw)).toBeNull()
  })
})

describe('parseAnswers', () => {
  it('accepts answers in progress, with an empty name and no interests yet', () => {
    const answers = pickAnswers(makeProfile({ firstName: '', interests: [] }))
    expect(parseAnswers(answers)).toEqual(answers)
  })

  it('rejects anything that isn’t an object', () => {
    expect(parseAnswers(undefined)).toBeNull()
  })
})
