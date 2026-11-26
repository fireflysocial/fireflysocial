import { describe, expect, it } from 'vitest'
import { createNoise2D, fractalNoise } from './noise.ts'

describe('createNoise2D', () => {
  it('gives the same field for the same seed, and a different one for another', () => {
    const a = createNoise2D(7)
    const b = createNoise2D(7)
    const c = createNoise2D(8)
    expect(a(1.3, 2.7)).toBe(b(1.3, 2.7))
    expect(a(1.3, 2.7)).not.toBe(c(1.3, 2.7))
  })

  it('is zero on whole-number grid points', () => {
    const noise = createNoise2D(1)
    expect(noise(3, 5)).toBeCloseTo(0)
    expect(noise(-2, 0)).toBeCloseTo(0)
  })

  it('stays within [-1, 1] and actually varies', () => {
    const noise = createNoise2D(3)
    let min = Infinity
    let max = -Infinity
    for (let x = -10; x < 10; x += 0.173) {
      for (let y = -10; y < 10; y += 0.219) {
        const value = noise(x, y)
        min = Math.min(min, value)
        max = Math.max(max, value)
      }
    }
    expect(min).toBeGreaterThanOrEqual(-1.0001)
    expect(max).toBeLessThanOrEqual(1.0001)
    expect(max - min).toBeGreaterThan(1)
  })

  it('is smooth: a tiny step gives a tiny change', () => {
    const noise = createNoise2D(4)
    for (let x = 0; x < 5; x += 0.37) {
      expect(Math.abs(noise(x + 0.001, 1.5) - noise(x, 1.5))).toBeLessThan(0.01)
    }
  })
})

describe('fractalNoise', () => {
  it('stays within [-1, 1]', () => {
    const noise = createNoise2D(5)
    for (let x = 0; x < 8; x += 0.31) {
      const value = fractalNoise(noise, x, x * 0.7, 4)
      expect(value).toBeGreaterThanOrEqual(-1.0001)
      expect(value).toBeLessThanOrEqual(1.0001)
    }
  })

  it('matches the base noise with one octave', () => {
    const noise = createNoise2D(6)
    expect(fractalNoise(noise, 0.4, 0.9, 1)).toBe(noise(0.4, 0.9))
  })

  it('is zero with no octaves', () => {
    expect(fractalNoise(createNoise2D(6), 0.4, 0.9, 0)).toBe(0)
  })
})
