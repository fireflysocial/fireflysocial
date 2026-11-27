import { describe, expect, it } from 'vitest'
import { keepMeetingLine, podReason } from './podReason.ts'

describe('podReason', () => {
  it('names a shared intent and the most shared interest', () => {
    expect(
      podReason([
        { intents: ['find-collaborators'], interests: ['startup-meetups', 'pottery'] },
        { intents: ['find-collaborators', 'grow-network'], interests: ['startup-meetups'] },
        { intents: ['find-collaborators'], interests: ['startup-meetups', 'hiking'] },
        { intents: ['find-collaborators'], interests: ['pottery'] },
      ]),
    ).toBe('You’re all here to find collaborators, and 3 of you like startup meetups.')
  })

  it('says "you all" when everyone shares an interest, and stays vague when intents differ', () => {
    expect(
      podReason([
        { intents: ['make-friends'], interests: ['board-games'] },
        { intents: ['open-to-anything'], interests: ['board-games'] },
      ]),
    ).toBe('You’re here for similar reasons, and you all like board games.')
  })

  it('leaves interests out when nobody shares one', () => {
    expect(
      podReason([
        { intents: ['open-to-anything'], interests: ['hiking'] },
        { intents: ['open-to-anything'], interests: ['pottery'] },
      ]),
    ).toBe('You’re here for similar reasons.')
  })
})

describe('keepMeetingLine', () => {
  it('reads naturally for one, two or more people', () => {
    expect(keepMeetingLine(['Sam'])).toBe('You and Sam both want to keep meeting.')
    expect(keepMeetingLine(['Sam', 'Aiko'])).toBe('Sam and Aiko want to keep meeting you too.')
    expect(keepMeetingLine(['Sam', 'Aiko', 'Omar'])).toBe(
      'Sam, Aiko and Omar want to keep meeting you too.',
    )
  })
})
