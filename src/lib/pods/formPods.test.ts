import { describe, expect, it } from 'vitest'
import { formPods, type PodCandidate } from './formPods.ts'

const person = (id: string, overrides: Partial<PodCandidate> = {}): PodCandidate => ({
  id,
  intents: ['make-friends'],
  interests: [],
  mode: 'group',
  keepMeetingWith: [],
  blocked: [],
  ...overrides,
})

describe('formPods', () => {
  it('grows pods to four, deterministically whatever the arrival order', () => {
    const people = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => person(id))
    const result = formPods(people)
    expect(result).toEqual({
      pods: [
        ['a', 'b', 'c', 'd'],
        ['e', 'f', 'g', 'h'],
      ],
      unplaced: [],
    })
    expect(formPods([...people].reverse())).toEqual(result)
  })

  it('never puts incompatible intents together', () => {
    const result = formPods([
      person('a'),
      person('b'),
      person('c'),
      person('x', { intents: ['meet-cofounder'] }),
      person('y', { intents: ['find-collaborators'] }),
      person('z', { intents: ['meet-cofounder'] }),
    ])
    expect(result.pods).toEqual([
      ['a', 'b', 'c'],
      ['x', 'y', 'z'],
    ])
  })

  it('prefers people who both chose to keep meeting, then shared interests', () => {
    const rules = { minSize: 2, targetSize: 3, maxSize: 3 }
    const result = formPods(
      [
        person('a', { interests: ['pottery'] }),
        person('b'),
        person('c', { interests: ['pottery'] }),
        person('d', { keepMeetingWith: ['a'] }),
        person('e'),
      ],
      rules,
    )
    // d chose a, but a didn't choose d, so it doesn't count; c shares pottery with a.
    expect(result.pods[0]).toEqual(['a', 'c', 'b'])
    const mutual = formPods(
      [
        person('a', { keepMeetingWith: ['d'] }),
        person('b'),
        person('c'),
        person('d', { keepMeetingWith: ['a'] }),
      ],
      { minSize: 2, targetSize: 2, maxSize: 2 },
    )
    expect(mutual.pods[0]).toEqual(['a', 'd'])
  })

  it('never places blocked people together, whichever of them blocked', () => {
    const result = formPods([
      person('a', { blocked: ['b'] }),
      person('b'),
      person('c'),
      person('d'),
      person('e', { blocked: ['f'] }),
      person('f'),
    ])
    for (const pod of result.pods) {
      expect(pod.includes('a') && pod.includes('b')).toBe(false)
      expect(pod.includes('e') && pod.includes('f')).toBe(false)
    }
  })

  it('folds a too-small group into a pod with room, or leaves people unplaced', () => {
    const full = formPods(
      [person('a'), person('b'), person('c'), person('d', { intents: ['open-to-anything'] })],
      { minSize: 3, targetSize: 3, maxSize: 3 },
    )
    expect(full).toEqual({ pods: [['a', 'b', 'c']], unplaced: ['d'] })
    // b (co-founder) can only sit with a, and that pair is too small; a then folds into
    // c, d and e's pod, and b is left without one.
    const folded = formPods([
      person('a', { intents: ['open-to-anything'] }),
      person('b', { intents: ['meet-cofounder'] }),
      person('c'),
      person('d'),
      person('e'),
    ])
    expect(folded).toEqual({ pods: [['c', 'd', 'e', 'a']], unplaced: ['b'] })
  })

  it('doesn’t strand people whose only options were taken by a flexible early pod', () => {
    // Seeding alphabetically and filling to five, a would take all four open people and leave
    // y and z with no pod. Seeding the most constrained first and growing to four places everyone.
    const result = formPods([
      person('a', { intents: ['find-collaborators'] }),
      ...['b', 'c', 'd', 'e'].map((id) => person(id, { intents: ['open-to-anything'] })),
      person('y'),
      person('z'),
    ])
    expect(result).toEqual({
      pods: [
        ['a', 'b', 'c', 'd'],
        ['y', 'z', 'e'],
      ],
      unplaced: [],
    })
  })

  it('pairs "one person first" people with someone compatible', () => {
    const result = formPods([
      person('a', { mode: 'one' }),
      person('b', { mode: 'one', intents: ['meet-cofounder'] }),
      person('c', { mode: 'one', interests: ['pottery'] }),
      person('d', { mode: 'one', intents: ['open-to-anything'] }),
    ])
    // b (co-founder) has the fewest options, so b is paired first.
    expect(result).toEqual({
      pods: [
        ['b', 'd'],
        ['a', 'c'],
      ],
      unplaced: [],
    })
    expect(formPods([person('solo', { mode: 'one' })]).unplaced).toEqual(['solo'])
  })

  it('gives nobody a pod when too few opted in', () => {
    expect(formPods([person('a'), person('b')])).toEqual({ pods: [], unplaced: ['a', 'b'] })
    expect(formPods([])).toEqual({ pods: [], unplaced: [] })
  })
})
