import { describe, expect, it } from 'vitest'
import { makeProfile } from '../test/fixtures.ts'
import { cleanFirstName, parseProfile } from './profile.ts'

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

describe('parseProfile', () => {
  it('accepts a complete profile and removes duplicates', () => {
    const profile = makeProfile({ intents: ['friends', 'friends'], newcomer: true })
    expect(parseProfile(JSON.parse(JSON.stringify(profile)))).toEqual({
      ...profile,
      intents: ['friends'],
    })
  })

  it('accepts a skipped "new to the city" answer', () => {
    expect(parseProfile(makeProfile({ newcomer: null }))?.newcomer).toBeNull()
  })

  it.each([
    ['nothing', null],
    ['a string', 'profile'],
    ['no name', { ...makeProfile(), firstName: ' ' }],
    ['a non-string name', { ...makeProfile(), firstName: 3 }],
    ['no city', { ...makeProfile(), cityId: undefined }],
    ['an unknown intent', { ...makeProfile(), intents: ['romance'] }],
    ['too few interests', { ...makeProfile(), interests: ['board-games'] }],
    ['an unknown interest', { ...makeProfile(), interests: ['a', 'b', 'c'] }],
    ['a bad free time', { ...makeProfile(), freeTimes: ['3am'] }],
    ['bad neighbourhoods', { ...makeProfile(), neighbourhoods: [1] }],
    ['an unknown access need', { ...makeProfile(), accessNeeds: ['jetpack'] }],
    ['a non-list', { ...makeProfile(), accessNeeds: 'step-free' }],
    ['an unknown budget', { ...makeProfile(), budget: 'lavish' }],
    ['a bad newcomer answer', { ...makeProfile(), newcomer: 'yes' }],
    ['no pledge', { ...makeProfile(), pledgedAt: undefined }],
  ])('rejects %s', (_label, raw) => {
    expect(parseProfile(raw)).toBeNull()
  })
})
