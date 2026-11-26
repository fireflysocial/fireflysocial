import { TAU, clamp } from './math.ts'
import { between, createRandom } from './random.ts'

/**
 * The hero's meadow: a band of line-drawn grasses and seed stems that the fireflies float above,
 * swaying in one slow wind that travels across it. A hand brushing through bends the grass
 * aside, and it springs back. Pure geometry: the renderer draws what these functions describe.
 */

/** Grass is a tapered blade; a stem is a hairline with a seed head at its tip. */
export type PlantKind = 'blade' | 'stem'

/** Back (dim, short) to front (clearer, tall), so the meadow has depth. */
export type Layer = 0 | 1 | 2

export interface Plant {
  /** Where it grows across the meadow, 0 (left) to 1 (right). */
  x: number
  /** Its height as a share of the meadow's height. */
  height: number
  /** Width at the base, in pixels (stems are drawn as hairlines). */
  width: number
  /** Its resting curve: the tip's sideways offset as a share of its height (- left, + right). */
  lean: number
  /** How far the wind sways it, as a share of its height. */
  sway: number
  /** Its own offset in the wind's rhythm (radians). */
  phase: number
  layer: Layer
  kind: PlantKind
  /** Seed-head dots along the top of a stem: how far up it (0 to 1) and which side (px). */
  seeds: readonly { along: number; side: number }[]
  /** A hand's sideways push at the tip (px), and its velocity (px/s), springing back. */
  push: number
  pushVelocity: number
}

/** The meadow's area in the canvas, in pixels. */
export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/** A blade or stem's shape this frame: base, curve control and tip, in canvas pixels. */
export interface PlantShape {
  baseX: number
  baseY: number
  controlX: number
  controlY: number
  tipX: number
  tipY: number
}

/** One gust takes this long to cross the meadow and come round again (s). */
const WIND_SECONDS = 9
/** How many swells of wind lie across the meadow at once. */
const WIND_WAVES = 1.4
/** The spring that brings brushed grass back upright: stiffness (1/s²) and damping (1/s). */
const SPRING = 18
const DAMPING = 3.2
/** How close a hand must pass to bend a plant (px), and how far it bends it at most (share). */
const BRUSH_RADIUS = 90
const BRUSH_BEND = 0.5

/** How tall each layer may grow, as a share of the tallest. */
const REACH: Record<Layer, number> = { 0: 0.55, 1: 0.75, 2: 1 }

/** How many fireflies and specks of distant dust a meadow this size holds: few, so it is calm. */
export function meadowCounts(width: number, height: number) {
  const area = width * height
  return {
    fireflies: Math.round(clamp(area / 5000, 30, 90)),
    dust: Math.round(clamp(area / 1500, 60, 380)),
  }
}

/** How many plants a meadow this wide gets: a full sward, capped so phones keep 60fps. */
export function plantCountFor(width: number): number {
  return Math.round(clamp(width / 3.5, 80, 320))
}

/**
 * Grows `count` plants across the meadow, back layer first so the renderer can draw them in
 * order. Most are grass blades; about one in eight is a taller seed stem.
 */
export function createMeadow({ seed, count }: { seed: number; count: number }): Plant[] {
  const random = createRandom(seed)
  const plants: Plant[] = []
  for (let i = 0; i < Math.max(0, count); i++) {
    const roll = random()
    const layer: Layer = roll < 0.4 ? 0 : roll < 0.75 ? 1 : 2
    const stem = random() < 0.13
    // The front grows taller than the back, so the meadow recedes.
    const reach = REACH[layer]
    const height = stem ? between(random, 0.42, 0.72) * reach : between(random, 0.16, 0.46) * reach
    plants.push({
      x: between(random, -0.02, 1.02),
      height,
      width: stem ? 1 : between(random, 1.6, 3.4) * (0.7 + 0.15 * layer),
      lean: between(random, -0.22, 0.22),
      sway: between(random, 0.03, 0.07),
      phase: between(random, -0.6, 0.6),
      layer,
      kind: stem ? 'stem' : 'blade',
      seeds: stem
        ? Array.from({ length: 5 + Math.floor(random() * 4) }, () => ({
            along: between(random, 0.82, 1),
            side: between(random, -3, 3),
          }))
        : [],
      push: 0,
      pushVelocity: 0,
    })
  }
  return plants.sort((a, b) => a.layer - b.layer)
}

/**
 * Where a plant's tip has been carried sideways at animation-clock second `time`, as a share of
 * its height: its resting lean, plus a wind swell that travels across the meadow from left to
 * right, so neighbours sway together and the field moves like a breeze through grass.
 */
export function windBend(plant: Plant, time: number): number {
  const wave = Math.sin((TAU * time) / WIND_SECONDS - plant.x * TAU * WIND_WAVES + plant.phase)
  // The wind leans a little rightward on average, as a steady breeze would.
  return plant.lean + plant.sway * (0.35 + wave)
}

/**
 * A plant's shape this frame in the meadow `rect`: it grows from the meadow's floor, bends by
 * the wind and any push, and keeps roughly its length as it bends (its tip dips as it leans).
 */
export function plantShape(plant: Plant, time: number, rect: Rect): PlantShape {
  const height = plant.height * rect.height
  const baseX = rect.left + plant.x * rect.width
  const baseY = rect.top + rect.height
  const bend = windBend(plant, time) * height + plant.push
  const rise = Math.sqrt(Math.max(0, height * height - 0.6 * bend * bend))
  return {
    baseX,
    baseY,
    controlX: baseX + bend * 0.35,
    controlY: baseY - rise * 0.6,
    tipX: baseX + bend,
    tipY: baseY - rise,
  }
}

/** Spacing of the points a hand's path is sampled at (px), finer than any plant's reach. */
const PATH_STEP = 12

/**
 * Points along a hand's path (pixels, oldest first) no more than PATH_STEP apart, so a fast
 * sweep brushes every plant it crossed, not only the ones at the ends of each frame's move.
 */
export function samplePath(path: readonly { x: number; y: number }[]) {
  const points: { x: number; y: number }[] = []
  path.forEach((to, index) => {
    const from = index === 0 ? to : path[index - 1]
    // `index - 1` is in range whenever index > 0; the fallback only satisfies the type checker.
    /* v8 ignore next -- @preserve */
    if (!from) return
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / PATH_STEP))
    for (let step = index === 0 ? steps : 1; step <= steps; step++) {
      const t = step / steps
      points.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t })
    }
  })
  return points
}

/**
 * A hand passed through the meadow along `points` (pixels; see samplePath): every plant whose
 * upper part a point passes near bends away from the nearest such point, more the nearer it is,
 * easing the same at any frame rate. A sweep parts the grass along its whole path. Only the push
 * changes, so `advanceMeadow` springs each plant back upright. Returns how many it touched.
 */
export function brushMeadow(
  plants: Plant[],
  points: readonly { x: number; y: number }[],
  dt: number,
  rect: Rect,
): number {
  if (dt <= 0) return 0
  let touched = 0
  const frames = dt * 60
  const floor = rect.top + rect.height
  for (const plant of plants) {
    const height = plant.height * rect.height
    const baseX = rect.left + plant.x * rect.width
    // Only the upper part of a plant bends; a hand at its root, or in the air above, does nothing.
    let nearest = BRUSH_RADIUS
    let side = 0
    for (const point of points) {
      if (point.y < floor - height * 1.1 || point.y > floor - height * 0.3) continue
      const distance = Math.abs(baseX - point.x)
      if (distance >= nearest) continue
      nearest = distance
      side = baseX >= point.x ? 1 : -1
    }
    if (side === 0) continue
    const target = side * BRUSH_BEND * height * (1 - nearest / BRUSH_RADIUS)
    const blend = 1 - 0.8 ** frames
    // Never pulls a plant that is already bent further the same way back towards the hand.
    if (Math.abs(target) > Math.abs(plant.push) || Math.sign(target) !== Math.sign(plant.push)) {
      plant.push += (target - plant.push) * blend
    }
    plant.pushVelocity = 0
    touched++
  }
  return touched
}

/** Springs every pushed plant back upright, with a little sway as it settles. Mutates them. */
export function advanceMeadow(plants: Plant[], dt: number): void {
  for (const plant of plants) {
    if (plant.push === 0 && plant.pushVelocity === 0) continue
    plant.pushVelocity += (-SPRING * plant.push - DAMPING * plant.pushVelocity) * dt
    plant.push += plant.pushVelocity * dt
    // Upright and still enough: rest exactly, so a calm meadow costs nothing here.
    if (Math.abs(plant.push) < 0.05 && Math.abs(plant.pushVelocity) < 0.5) {
      plant.push = 0
      plant.pushVelocity = 0
    }
  }
}

/**
 * Where the meadow's fireflies may float, 0 to 1 at unit height y of the meadow: none at the
 * very top or right down in the roots, most around the grass tips, where real fireflies hang
 * on a summer evening.
 */
export function fireflyRoom(y: number): number {
  const above = clamp((y - 0.08) / 0.3)
  const roots = 1 - clamp((y - 0.86) / 0.12)
  return above * roots
}
