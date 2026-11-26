import { describe, expect, it } from 'vitest'
import { TAU, clamp, lerp, progressBetween, smoothstep, wrapPhase, wrapUnit } from './math.ts'

describe('clamp', () => {
  it('keeps values inside the range', () => {
    expect(clamp(-1)).toBe(0)
    expect(clamp(0.4)).toBe(0.4)
    expect(clamp(3)).toBe(1)
    expect(clamp(15, 10, 12)).toBe(12)
  })
})

describe('lerp', () => {
  it('interpolates between two values', () => {
    expect(lerp(10, 20, 0)).toBe(10)
    expect(lerp(10, 20, 0.5)).toBe(15)
    expect(lerp(10, 20, 1)).toBe(20)
  })
})

describe('progressBetween', () => {
  it('maps a range onto 0..1 and clamps outside it', () => {
    expect(progressBetween(5, 10, 20)).toBe(0)
    expect(progressBetween(15, 10, 20)).toBe(0.5)
    expect(progressBetween(25, 10, 20)).toBe(1)
  })

  it('treats an empty range as a step', () => {
    expect(progressBetween(9, 10, 10)).toBe(0)
    expect(progressBetween(10, 10, 10)).toBe(1)
  })
})

describe('smoothstep', () => {
  it('is flat at both ends and half way in the middle', () => {
    expect(smoothstep(0)).toBe(0)
    expect(smoothstep(0.5)).toBe(0.5)
    expect(smoothstep(1)).toBe(1)
    expect(smoothstep(-4)).toBe(0)
    expect(smoothstep(4)).toBe(1)
  })
})

describe('wrapPhase', () => {
  it('wraps angles into [0, TAU)', () => {
    expect(wrapPhase(0)).toBe(0)
    expect(wrapPhase(TAU)).toBeCloseTo(0)
    expect(wrapPhase(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2)
    expect(wrapPhase(3 * TAU + 1)).toBeCloseTo(1)
  })
})

describe('wrapUnit', () => {
  it('wraps coordinates into [0, 1)', () => {
    expect(wrapUnit(0.25)).toBe(0.25)
    expect(wrapUnit(1.25)).toBeCloseTo(0.25)
    expect(wrapUnit(-0.25)).toBeCloseTo(0.75)
    expect(wrapUnit(1)).toBe(0)
  })
})
