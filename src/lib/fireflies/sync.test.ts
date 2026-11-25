import { describe, expect, it } from 'vitest'
import { TAU } from './math.ts'
import { flash, kuramotoStep, orderParameter, phaseAt } from './sync.ts'

const spreadPhases = [0, 0.2, 0.4, 0.6, 0.8].map(phaseAt)
// Spread out but not perfectly balanced, like a real pod. A perfectly even spread is an
// unstable equilibrium with no mean field to pull towards, so it isn't a useful start.
const startPhases = [0, 0.15, 0.45, 0.6, 0.85].map(phaseAt)
const omegas = [3.0, 3.2, 3.4, 3.6, 3.8]

function simulate(coupling: number, seconds: number, dt = 1 / 60): number[] {
  let phases = startPhases
  for (let t = 0; t < seconds; t += dt) phases = kuramotoStep(phases, omegas, coupling, dt)
  return phases
}

describe('orderParameter', () => {
  it('is 1 when everyone flashes together', () => {
    expect(orderParameter([1, 1, 1, 1])).toBeCloseTo(1)
  })

  it('is 0 when phases are spread evenly', () => {
    expect(orderParameter(spreadPhases)).toBeCloseTo(0)
  })

  it('is 0 for an empty pod', () => {
    expect(orderParameter([])).toBe(0)
  })
})

describe('kuramotoStep', () => {
  it('returns nothing for an empty pod', () => {
    expect(kuramotoStep([], [], 2, 0.1)).toEqual([])
  })

  it('does not change its input', () => {
    const phases = [0, 1, 2]
    kuramotoStep(phases, [1, 1, 1], 2, 0.1)
    expect(phases).toEqual([0, 1, 2])
  })

  it('advances each phase by its own rhythm when uncoupled', () => {
    const next = kuramotoStep([0, 0], [1, 2], 0, 0.5)
    expect(next[0]).toBeCloseTo(0.5)
    expect(next[1]).toBeCloseTo(1)
  })

  it('treats a missing rhythm as standing still', () => {
    expect(kuramotoStep([1], [], 0, 1)[0]).toBeCloseTo(1)
  })

  it('keeps every phase within one cycle', () => {
    for (const phase of simulate(0, 10)) {
      expect(phase).toBeGreaterThanOrEqual(0)
      expect(phase).toBeLessThan(TAU)
    }
  })

  it('pulls a coupled pod into sync', () => {
    expect(orderParameter(simulate(2.4, 6))).toBeGreaterThan(0.95)
  })

  it('leaves an uncoupled pod out of sync', () => {
    expect(orderParameter(simulate(0, 6))).toBeLessThan(0.6)
  })
})

describe('flash', () => {
  it('peaks at the start of the cycle and is dark half way through', () => {
    expect(flash(0)).toBeCloseTo(1)
    expect(flash(Math.PI)).toBeCloseTo(0)
  })

  it('stays within [0, 1]', () => {
    for (let phase = -10; phase < 10; phase += 0.37) {
      expect(flash(phase)).toBeGreaterThanOrEqual(0)
      expect(flash(phase)).toBeLessThanOrEqual(1)
    }
  })

  it('narrows the pulse as sharpness rises', () => {
    expect(flash(1, 12)).toBeLessThan(flash(1, 2))
  })
})
