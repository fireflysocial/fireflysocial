import { clamp, smoothstep } from './math.ts'
import { between, type Random } from './random.ts'

/**
 * The Firefly mark, drawn by the cloud: on the landing page part of the cloud gathers into the
 * mark's shape (two folded wings and a round tail), as if the city's fireflies found each other.
 * The geometry is the mark's own (brand/firefly-mark-transparent.svg, viewBox 0 0 512 512):
 * each wing is a lens between two arcs of radius 200, and the tail is a circle.
 */

interface Point {
  readonly x: number
  readonly y: number
}

/** The two arc centres of a lens drawn between `a` and `b` with arcs of radius `r`. */
export function lensCentres(a: Point, b: Point, r: number): readonly [Point, Point] {
  const midX = (a.x + b.x) / 2
  const midY = (a.y + b.y) / 2
  const chordX = b.x - a.x
  const chordY = b.y - a.y
  const chord = Math.hypot(chordX, chordY)
  const rise = Math.sqrt(Math.max(0, r * r - (chord / 2) ** 2))
  // Unit normal to the chord: the centres sit either side of it.
  const nx = -chordY / chord
  const ny = chordX / chord
  return [
    { x: midX + nx * rise, y: midY + ny * rise },
    { x: midX - nx * rise, y: midY - ny * rise },
  ]
}

const WING_RADIUS = 200
const WINGS = [
  lensCentres({ x: 249, y: 96 }, { x: 132, y: 326 }, WING_RADIUS),
  lensCentres({ x: 380, y: 326 }, { x: 263, y: 96 }, WING_RADIUS),
] as const
const TAIL = { x: 256, y: 348, r: 72 } as const
/** The mark's drawn extent in the viewBox: wing tips at y 96 to the tail's foot at y 420. */
const BOUNDS = { left: 132, right: 380, top: 96, bottom: 420 } as const
const MARK_HEIGHT = BOUNDS.bottom - BOUNDS.top
const CENTRE = { x: 256, y: (BOUNDS.top + BOUNDS.bottom) / 2 } as const
/** Mark width as a share of its height. */
export const MARK_ASPECT = (BOUNDS.right - BOUNDS.left) / MARK_HEIGHT

export type MarkPart = 'wing' | 'tail'

/** Which part of the mark covers viewBox point (x, y), if any. The tail is drawn over the wings. */
export function markPartAt(x: number, y: number): MarkPart | null {
  if (Math.hypot(x - TAIL.x, y - TAIL.y) <= TAIL.r) return 'tail'
  for (const [a, b] of WINGS) {
    if (
      Math.hypot(x - a.x, y - a.y) <= WING_RADIUS &&
      Math.hypot(x - b.x, y - b.y) <= WING_RADIUS
    ) {
      return 'wing'
    }
  }
  return null
}

/** A light's place in the mark, in mark heights from the mark's centre (about -0.5 to 0.5). */
export interface MarkSlot {
  x: number
  y: number
  /** The tail is the mark's one light: Glow, solid, keeping the beat. */
  tail: boolean
  /** When this light sets off to its place as the mark gathers, 0 (first) to 1 (last). */
  stagger: number
}

/**
 * Scatters `count` places over the mark: the wings take most of them, so their folded shapes
 * read, and the tail, drawn solid and slightly swollen, stays the one light without becoming a
 * heavy ball.
 */
export function sampleMark(random: Random, count: number): MarkSlot[] {
  const slots: MarkSlot[] = []
  while (slots.length < Math.max(0, count)) {
    const x = between(random, BOUNDS.left, BOUNDS.right)
    const y = between(random, BOUNDS.top, BOUNDS.bottom)
    const part = markPartAt(x, y)
    if (part === null) continue
    // The tail packs its lights tighter than the wings, so it reads solid; half are enough.
    if (part === 'tail' && random() > 0.5) continue
    slots.push({
      x: (x - CENTRE.x) / MARK_HEIGHT,
      y: (y - CENTRE.y) / MARK_HEIGHT,
      tail: part === 'tail',
      stagger: random(),
    })
  }
  return slots
}

/** Where the mark sits in a field, in pixels. */
export interface MarkLayout {
  centerX: number
  centerY: number
  /** The mark's height in pixels. */
  size: number
}

/** The open band between the header and the text, in pixels from the field's top. */
export interface MarkBand {
  top: number
  bottom: number
}

/** Below this width the hero stacks its text, matching the page's 900px breakpoint. */
const STACKED = 900
/** Share of the open band the mark may fill, leaving clear space above and below it. */
const BAND_FILL = 0.78

/**
 * Where the gathered mark sits in the hero: in the open band above the text. Stacked layouts
 * centre it; wide ones set it above the intro column, aligned to the right gutter. Given the
 * measured `band`, it is sized to fit and centred in it, so it never crowds the header or runs
 * into the text on a short window; without one, it falls back to shares of the field.
 */
export function markLayout(width: number, height: number, band?: MarkBand): MarkLayout {
  const stacked = width < STACKED
  const fits = stacked
    ? Math.min(height * 0.3, width * 0.62)
    : Math.min(height * 0.46, width * 0.28)
  const size = band ? Math.max(0, Math.min(fits, (band.bottom - band.top) * BAND_FILL)) : fits
  const centerY = band ? (band.top + band.bottom) / 2 : height * (stacked ? 0.27 : 0.36)
  if (stacked) return { centerX: width / 2, centerY, size }
  const gutter = clamp(width * 0.024, 16, 32)
  return { centerX: width - gutter - (size * MARK_ASPECT) / 2, centerY, size }
}

/** How many lights draw the mark: enough for a crisp silhouette, capped so phones keep 60fps. */
export function markCountFor(size: number): number {
  return Math.round(clamp((size * size) / 32, 800, 3400))
}

/** Gathering starts this long after the field first moves, and takes this long (s). */
const GATHER_DELAY = 0.4
const GATHER_SECONDS = 3.2

/** How far the mark has gathered `seconds` after the field started, from 0 to 1 (linear). */
export function markGather(seconds: number): number {
  return clamp((seconds - GATHER_DELAY) / GATHER_SECONDS)
}

/**
 * One light's own progress towards its place, given the mark's overall `gather`. Each light
 * leaves at its own moment (`stagger`, 0 to 1), so the mark gathers like a swarm rather than
 * sliding in as one piece. It lifts off from rest and lands at rest (smootherstep), so no light
 * jumps from standing still to full speed in one frame; its top speed is under twice its average.
 */
export function arrival(gather: number, stagger: number): number {
  const spread = 0.55
  const t = clamp(clamp(gather) * (1 + spread) - spread * clamp(stagger))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/**
 * How brightly to draw the drifting crowd at pixel point (x, y), from 0.2 to 1: once the mark
 * has gathered, the crowd thins inside it, so the mark reads as a shape and not as more cloud.
 */
export function markClearance(x: number, y: number, layout: MarkLayout, gather: number): number {
  const d = Math.hypot(
    (x - layout.centerX) / (layout.size * 0.5),
    (y - layout.centerY) / (layout.size * 0.62),
  )
  const inside = 1 - smoothstep((d - 0.75) / 0.45)
  return 1 - 0.8 * clamp(gather) * inside
}
