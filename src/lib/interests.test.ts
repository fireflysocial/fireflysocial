import { describe, expect, it } from 'vitest'
import { INTEREST_GROUPS, interestLabel, isInterestId } from './interests.ts'

describe('interests', () => {
  it('has unique ids across every group', () => {
    const ids = INTEREST_GROUPS.flatMap((g) => g.interests.map((i) => i.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('recognises its own ids and nothing else', () => {
    expect(isInterestId('board-games')).toBe(true)
    expect(isInterestId('skydiving')).toBe(false)
    expect(isInterestId(3)).toBe(false)
  })

  it('gives the everyday label', () => {
    expect(interestLabel('run-clubs')).toBe('Run clubs')
  })
})
