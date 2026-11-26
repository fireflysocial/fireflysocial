export const TAU = Math.PI * 2

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

export function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount
}

/** Maps `value` from [start, end] onto [0, 1], clamped. */
export function progressBetween(value: number, start: number, end: number): number {
  if (end <= start) return value >= end ? 1 : 0
  return clamp((value - start) / (end - start))
}

/** Hermite smoothstep: eases in and out, flat at both ends. */
export function smoothstep(amount: number): number {
  const t = clamp(amount)
  return t * t * (3 - 2 * t)
}

/** Wraps a unit-space coordinate into [0, 1), so things leaving one edge come back at the other. */
export function wrapUnit(value: number): number {
  const wrapped = value % 1
  return wrapped < 0 ? wrapped + 1 : wrapped
}

/** Wraps an angle into [0, TAU). */
export function wrapPhase(phase: number): number {
  const wrapped = phase % TAU
  return wrapped < 0 ? wrapped + TAU : wrapped
}
