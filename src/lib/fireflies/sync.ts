import { TAU, wrapPhase } from './math.ts'

/**
 * Firefly synchrony, modelled with the Kuramoto model: each firefly has its own natural
 * flashing rhythm, and every firefly nudges its neighbours' rhythm towards its own. With no
 * coupling they drift apart; with enough coupling they end up flashing together. That is the
 * landing page's story: strangers who keep meeting fall into step.
 */

/**
 * Advances every phase by `dt` seconds. `omegas` are natural angular frequencies (radians per
 * second) and `coupling` is the Kuramoto K. Returns a new array; the input is not changed.
 */
export function kuramotoStep(
  phases: readonly number[],
  omegas: readonly number[],
  coupling: number,
  dt: number,
): number[] {
  const count = phases.length
  if (count === 0) return []
  // Mean field (r, psi) lets each update cost O(1) instead of summing over every pair.
  let sumCos = 0
  let sumSin = 0
  for (const phase of phases) {
    sumCos += Math.cos(phase)
    sumSin += Math.sin(phase)
  }
  const r = Math.hypot(sumCos, sumSin) / count
  const psi = Math.atan2(sumSin, sumCos)
  return phases.map((phase, index) => {
    const omega = omegas[index] ?? 0
    return wrapPhase(phase + dt * (omega + coupling * r * Math.sin(psi - phase)))
  })
}

/**
 * Kuramoto order parameter r: 0 when the phases are spread evenly, 1 when every firefly
 * flashes at the same moment.
 */
export function orderParameter(phases: readonly number[]): number {
  if (phases.length === 0) return 0
  let sumCos = 0
  let sumSin = 0
  for (const phase of phases) {
    sumCos += Math.cos(phase)
    sumSin += Math.sin(phase)
  }
  return Math.hypot(sumCos, sumSin) / phases.length
}

/**
 * Brightness of a flash at `phase`, in [0, 1]: a short bright pulse once per cycle and dark
 * the rest of the time, like a real firefly. `sharpness` narrows the pulse.
 */
export function flash(phase: number, sharpness = 6): number {
  const wave = (1 + Math.cos(wrapPhase(phase))) / 2
  return wave ** sharpness
}

/** Phase that is `fraction` of the way through a cycle. */
export function phaseAt(fraction: number): number {
  return wrapPhase(fraction * TAU)
}
