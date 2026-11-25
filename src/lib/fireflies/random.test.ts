import { describe, expect, it } from 'vitest'
import { between, createRandom } from './random.ts'

describe('createRandom', () => {
  it('gives the same sequence for the same seed', () => {
    const a = createRandom(42)
    const b = createRandom(42)
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b))
  })

  it('gives different sequences for different seeds', () => {
    expect(createRandom(1)()).not.toBe(createRandom(2)())
  })

  it('stays within [0, 1)', () => {
    const random = createRandom(7)
    for (let i = 0; i < 1000; i++) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('between', () => {
  it('maps into the requested range', () => {
    const random = createRandom(3)
    for (let i = 0; i < 200; i++) {
      const value = between(random, -2, 5)
      expect(value).toBeGreaterThanOrEqual(-2)
      expect(value).toBeLessThan(5)
    }
  })
})
