import { createRandom } from './random.ts'

/** Smooth 2D noise: nearby points give nearby values, in roughly [-1, 1]. */
export type Noise2D = (x: number, y: number) => number

/** Eight unit gradient directions, as separate x and y tables. */
const GRADIENT_X = Float64Array.of(
  1,
  -1,
  0,
  0,
  Math.SQRT1_2,
  -Math.SQRT1_2,
  Math.SQRT1_2,
  -Math.SQRT1_2,
)
const GRADIENT_Y = Float64Array.of(
  0,
  0,
  1,
  -1,
  Math.SQRT1_2,
  Math.SQRT1_2,
  -Math.SQRT1_2,
  -Math.SQRT1_2,
)

/**
 * Seeded Perlin (gradient) noise. Used to shape the firefly cloud into organic clumps and voids,
 * and to make it drift like smoke rather than jitter. Same seed, same field.
 */
export function createNoise2D(seed: number): Noise2D {
  const random = createRandom(seed)
  const order = new Uint8Array(256)
  for (let i = 0; i < 256; i++) order[i] = i
  // Fisher–Yates shuffle with the seeded generator.
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const swap = read(order, i)
    order[i] = read(order, j)
    order[j] = swap
  }
  // Doubled, so a lookup at (index + offset) never runs off the end.
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = read(order, i & 255)

  const corner = (ix: number, iy: number, dx: number, dy: number) => {
    const gradient = read(perm, read(perm, ix & 255) + (iy & 255)) & 7
    return read(GRADIENT_X, gradient) * dx + read(GRADIENT_Y, gradient) * dy
  }

  return (x, y) => {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    const fx = x - ix
    const fy = y - iy
    const u = fade(fx)
    const v = fade(fy)
    const a = corner(ix, iy, fx, fy)
    const b = corner(ix + 1, iy, fx - 1, fy)
    const c = corner(ix, iy + 1, fx, fy - 1)
    const d = corner(ix + 1, iy + 1, fx - 1, fy - 1)
    const top = a + (b - a) * u
    const bottom = c + (d - c) * u
    // Raw 2D Perlin peaks near ±0.71; scale it to use roughly [-1, 1].
    return (top + (bottom - top) * v) * Math.SQRT2
  }
}

/**
 * Fractal noise: `octaves` layers of noise, each twice as fine and half as strong, normalised
 * back to roughly [-1, 1]. Gives clouds their soft edges with detail inside.
 */
export function fractalNoise(noise: Noise2D, x: number, y: number, octaves = 3): number {
  let sum = 0
  let amplitude = 1
  let frequency = 1
  let total = 0
  for (let octave = 0; octave < octaves; octave++) {
    sum += noise(x * frequency, y * frequency) * amplitude
    total += amplitude
    amplitude /= 2
    frequency *= 2
  }
  return total === 0 ? 0 : sum / total
}

/** Perlin's quintic ease: smooth at whole numbers, so the noise has no visible grid. */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/** Reads a typed array at an index its caller has already masked or bounded into range. */
function read(values: Uint8Array | Float64Array, index: number): number {
  // Every index above is masked (& 255, & 7) or loop-bounded, so the fallback only satisfies
  // the type checker under noUncheckedIndexedAccess.
  /* v8 ignore next -- @preserve */
  return values[index] ?? 0
}
