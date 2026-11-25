/** A random number generator that returns floats in [0, 1). */
export type Random = () => number

/**
 * Seeded pseudo-random generator (mulberry32). The same seed always gives the same sequence,
 * so the firefly field looks the same on every visit and tests stay deterministic.
 */
export function createRandom(seed: number): Random {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A float in [min, max). */
export function between(random: Random, min: number, max: number): number {
  return min + random() * (max - min)
}
