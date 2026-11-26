import type { Tone } from '../../lib/fireflies/cloud.ts'
import { clamp } from '../../lib/fireflies/math.ts'

/** The colours the landing's canvases draw with, shared by the hero meadow and the story. */
export type Rgb = readonly [number, number, number]

/** The swarm's tones: Glow (#D9F84A), Dusk (#C3A0FF) and Ember (#F2ECCE). */
export const GLOW: Rgb = [217, 248, 74]
export const DUSK: Rgb = [195, 160, 255]
export const EMBER: Rgb = [242, 236, 206]
export const TONES: Record<Tone, Rgb> = { 0: GLOW, 1: DUSK, 2: EMBER }
/** Muted (#9A9A92), for names, hairlines and the meadow's grass. */
export const MUTED: Rgb = [154, 154, 146]

/** Halo sprite size in device pixels: large enough to scale down cleanly, small enough to be cheap. */
const HALO_SPRITE = 64

/** One pre-drawn soft halo per tone, scaled and faded per firefly as it is drawn. */
export type Halos = Record<Tone, CanvasImageSource>

export function rgba([r, g, b]: Rgb, alpha: number): string {
  return `rgba(${String(Math.round(r))}, ${String(Math.round(g))}, ${String(Math.round(b))}, ${String(clamp(alpha))})`
}

/**
 * Draws one soft halo per tone onto a small offscreen canvas: a radial fall-off from a warm
 * centre to nothing, so a firefly's light spills softly into the dark around its core. The one
 * soft light in the system (approved 2026-11-26, "soft halo, flashes only"). Null where an
 * offscreen canvas can't be drawn: the lights are then drawn without halos.
 */
export function makeHalos(): Halos | null {
  const sprites: CanvasImageSource[] = []
  for (const tone of [GLOW, DUSK, EMBER]) {
    const sprite = document.createElement('canvas')
    sprite.width = HALO_SPRITE
    sprite.height = HALO_SPRITE
    const context = sprite.getContext('2d')
    if (!context) return null
    const centre = HALO_SPRITE / 2
    const gradient = context.createRadialGradient(centre, centre, 0, centre, centre, centre)
    gradient.addColorStop(0, rgba(tone, 0.5))
    gradient.addColorStop(0.18, rgba(tone, 0.26))
    gradient.addColorStop(0.45, rgba(tone, 0.07))
    gradient.addColorStop(1, rgba(tone, 0))
    context.fillStyle = gradient
    context.fillRect(0, 0, HALO_SPRITE, HALO_SPRITE)
    sprites.push(sprite)
  }
  const [glow, dusk, ember] = sprites
  // Three tones were drawn just above, so all three are always there.
  /* v8 ignore next -- @preserve */
  if (!glow || !dusk || !ember) return null
  return { 0: glow, 1: dusk, 2: ember }
}

/** The tone stored in a glow run (a plain number there, so the run stays one flat array). */
export function toneAt(value: number | undefined): Tone {
  return value === 1 ? 1 : value === 2 ? 2 : 0
}

/**
 * Draws a frame's halos, given as flat x, y, radius, alpha, tone runs, added onto the dark so
 * overlapping lights pool into a brighter glow. Leaves the context painting normally after.
 */
export function drawHalos(context: CanvasRenderingContext2D, halos: Halos, glows: number[]) {
  context.globalCompositeOperation = 'lighter'
  for (let i = 0; i < glows.length; i += 5) {
    // Glows are pushed as whole runs of five, so every index here is in range; each fallback
    // only satisfies the type checker under noUncheckedIndexedAccess.
    /* v8 ignore next -- @preserve */
    const x = glows[i] ?? 0
    /* v8 ignore next -- @preserve */
    const y = glows[i + 1] ?? 0
    /* v8 ignore next -- @preserve */
    const radius = glows[i + 2] ?? 0
    /* v8 ignore next -- @preserve */
    context.globalAlpha = clamp(glows[i + 3] ?? 0)
    context.drawImage(halos[toneAt(glows[i + 4])], x - radius, y - radius, radius * 2, radius * 2)
  }
  context.globalAlpha = 1
  context.globalCompositeOperation = 'source-over'
}

/** A flat dot. No blur or bloom: per the brand, the flat dot is the light. */
export function dot(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  colour: Rgb,
  alpha: number,
) {
  context.fillStyle = rgba(colour, alpha)
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
}

/** All the lights drawn with one fill style in a frame. */
export interface Batch {
  style: string
  /** Dust and the mark are flat squares; a firefly's core is a round dot. */
  round: boolean
  /** Flat x, y, size triples, reused every frame so drawing allocates nothing per light. */
  squares: number[]
}

/** Brightness steps lights are drawn in, so a frame sets a few dozen fill styles, not thousands. */
export const LEVELS = 12
/**
 * The dimmest light drawn at all. Behind text a field is cleared to about 6%, so anything
 * fainter than this stays clean black there whatever the number of brightness steps.
 */
export const FAINTEST = 1 / 16

/**
 * The batch for a light of `tone`, `round` or square, at `brightness` (at least FAINTEST),
 * made on first use and reused every frame after.
 */
export function batchFor(
  batches: Map<number, Batch>,
  tone: Tone,
  round: boolean,
  brightness: number,
): Batch {
  const level = Math.round(clamp(brightness) * LEVELS)
  const key = (tone * 2 + (round ? 1 : 0)) * (LEVELS + 1) + level
  let batch = batches.get(key)
  if (!batch) {
    batch = { style: rgba(TONES[tone], level / LEVELS), round, squares: [] }
    batches.set(key, batch)
  }
  return batch
}

/** Draws every batch: round cores as one path per batch, squares one rectangle each. */
export function drawBatches(context: CanvasRenderingContext2D, batches: Map<number, Batch>) {
  for (const batch of batches.values()) {
    const { squares } = batch
    if (squares.length === 0) continue
    context.fillStyle = batch.style
    if (batch.round) {
      context.beginPath()
      for (let i = 0; i < squares.length; i += 3) {
        // Pushed as whole x, y, radius triples, so every index here is in range; each fallback
        // only satisfies the type checker under noUncheckedIndexedAccess.
        /* v8 ignore next -- @preserve */
        const x = squares[i] ?? 0
        /* v8 ignore next -- @preserve */
        const y = squares[i + 1] ?? 0
        /* v8 ignore next -- @preserve */
        const radius = squares[i + 2] ?? 0
        context.moveTo(x + radius, y)
        context.arc(x, y, radius, 0, Math.PI * 2)
      }
      context.fill()
      continue
    }
    for (let i = 0; i < squares.length; i += 3) {
      // Separate reads, not a destructured array, so drawing allocates nothing per square.
      /* v8 ignore next -- @preserve */
      const left = squares[i] ?? 0
      /* v8 ignore next -- @preserve */
      const top = squares[i + 1] ?? 0
      /* v8 ignore next -- @preserve */
      const side = squares[i + 2] ?? 0
      context.fillRect(left, top, side, side)
    }
  }
}
