import { TAU, clamp, smoothstep, wrapPhase, wrapUnit } from './math.ts'
import { arrival, sampleMark, type MarkLayout, type MarkSlot } from './mark.ts'
import { createNoise2D, fractalNoise, type Noise2D } from './noise.ts'
import { between, createRandom } from './random.ts'

/**
 * The firefly cloud: thousands of tiny lights drifting in organic clumps, in three tones.
 * Inspired by the particle fields of civic design studios (decided 2026-11-25): dense swirls
 * and dark voids rather than an even scatter, moving like smoke along a flow field.
 *
 * Every light has a home (where the drift has carried it) and an offset from that home. A hand
 * passing through pushes the offset; a spring pulls it back, so the cloud parts and heals
 * instead of being scarred by every pass. Lights a hand passes wake up and fall into step with
 * one shared beat: the beat of the Firefly mark's tail.
 */

/** Tones, painted by the renderer: 0 Glow (yellow-green), 1 Dusk (violet), 2 Ember (warm white). */
export type Tone = 0 | 1 | 2
export const TONE_COUNT = 3

/** One light in the cloud. */
export interface Mote {
  /**
   * Home, in unit space (0 to 1 across the field). For a crowd mote, where the drift has carried
   * it. For a mark mote, where it waits in the crowd before the mark gathers.
   */
  x: number
  y: number
  /** Offset from home in pixels, and its velocity (px/s): a hand's push, springing back. */
  dx: number
  dy: number
  vx: number
  vy: number
  /** Where it was drawn last frame, in pixels: home plus offset. Set by `placeCloud`. */
  px: number
  py: number
  tone: Tone
  /** Twinkle phase and rhythm (radians, radians per second). */
  phase: number
  omega: number
  /** Relative size, around 1. */
  size: number
  /** Animation-clock second at which this mote answers a call; -Infinity if it hasn't. */
  answerAt: number
  /** How awake a passing hand has left it, 0 to 1. Awake motes fall into step with the beat. */
  awake: number
  /** Its place in the Firefly mark, for the lights that draw it; null for the drifting crowd. */
  slot: MarkSlot | null
}

export interface Cloud {
  motes: Mote[]
  /** Noise that steers the drift. */
  flow: Noise2D
}

export interface CloudOptions {
  seed: number
  count: number
  /** Field width divided by height, so clumps are round on any screen. */
  aspect: number
  /**
   * Where the cloud may gather, 0 to 1 at unit height y: lower values make a mote there less
   * likely, so a field whose lower part sits behind text spends its motes in the open part.
   */
  room?: (y: number) => number
  /** How many extra lights gather into the Firefly mark (0 for a field without it). */
  markCount?: number
}

/** How finely the cloud clumps: higher gives more, smaller clumps. */
const CLUMP_SCALE = 1.15
/** How large the drifting currents are. */
const FLOW_SCALE = 1.4
/** Drift speed, in field-heights per second at full current. */
const DRIFT = 0.012
/** The shared beat that the mark's tail keeps and that woken motes fall into (s per flash). */
export const BEAT_SECONDS = 1.6
/** The spring that pulls a pushed light home: stiffness (1/s²) and damping (1/s), a smooth heal. */
const SPRING = 11
const DAMPING = 4.6
/** How long a light stays awake after a hand passes (s, time constant): about two beats. */
const AWAKE_SECONDS = 3.2
/** How strongly an awake light is pulled into step with the beat (Kuramoto coupling, 1/s). */
const SYNC = 9

function mote(x: number, y: number, tone: Tone, phase: number, omega: number, size: number) {
  return {
    x,
    y,
    dx: 0,
    dy: 0,
    vx: 0,
    vy: 0,
    px: 0,
    py: 0,
    tone,
    phase,
    omega,
    size,
    answerAt: Number.NEGATIVE_INFINITY,
    awake: 0,
    slot: null,
  } satisfies Mote
}

/**
 * Scatters `count` motes into clumps and voids: each candidate is kept with a probability set
 * by fractal noise, so dense swirls form with near-empty dark between them. Which tone a mote
 * gets also drifts across the field, so some clumps lean yellow and others violet. Then adds
 * `markCount` lights that will gather into the mark.
 */
export function createCloud({
  seed,
  count,
  aspect,
  room = () => 1,
  markCount = 0,
}: CloudOptions): Cloud {
  const random = createRandom(seed)
  const density = createNoise2D(seed + 1)
  const hue = createNoise2D(seed + 2)
  const flow = createNoise2D(seed + 3)
  // Clumps are sized to the field's shorter side, so a tall phone field gets real clumps and
  // voids across its width instead of an even sprinkle.
  const clump = CLUMP_SCALE / Math.min(1, aspect)
  const motes: Mote[] = []
  while (motes.length < Math.max(0, count)) {
    const x = random()
    const y = random()
    const d = (fractalNoise(density, x * clump * aspect, y * clump, 3) + 1) / 2
    // A floor of 4% keeps a faint scatter in the voids, so the dark never looks cut out.
    const keep = (0.04 + 0.96 * smoothstep((d - 0.47) / 0.2)) * room(y)
    if (random() > keep) continue
    const lean = (hue(x * 1.3 * aspect, y * 1.3) + 1) / 2
    motes.push(
      mote(
        x,
        y,
        pickTone(random(), lean),
        between(random, 0, TAU),
        TAU / between(random, 1.8, 6),
        between(random, 0.7, 1.5),
      ),
    )
  }
  for (const slot of sampleMark(createRandom(seed + 4), markCount)) {
    // They wait scattered in the open upper band, then gather.
    const light = slot.tail
      ? // The tail keeps the beat: every tail light flashes on it, together.
        mote(
          random(),
          between(random, 0.04, 0.3),
          0,
          0,
          TAU / BEAT_SECONDS,
          between(random, 0.8, 1.4),
        )
      : mote(
          random(),
          between(random, 0.04, 0.3),
          random() < 0.72 ? 1 : 2,
          between(random, 0, TAU),
          TAU / between(random, 1.8, 6),
          between(random, 0.7, 1.3),
        )
    motes.push({ ...light, slot })
  }
  return { motes, flow }
}

/** 16% are warm white; of the rest, the violet share grows from 15% to 65% with `lean`. */
export function pickTone(roll: number, lean: number): Tone {
  if (roll < 0.16) return 2
  const violetShare = 0.15 + 0.5 * clamp(lean)
  return roll < 0.16 + 0.84 * violetShare ? 1 : 0
}

/** How many motes a field of this size gets: dense like a swarm, capped so phones keep 60fps. */
export function cloudCountFor(width: number, height: number): number {
  return Math.round(clamp((width * height) / 70, 3000, 11000))
}

/** The shared beat's phase at animation-clock second `time`: 0 is the moment of the flash. */
export function beatPhase(time: number): number {
  return wrapPhase((time * TAU) / BEAT_SECONDS)
}

/**
 * Moves every crowd mote along the flow field's curl (so the cloud swirls without bunching up
 * or thinning out), wraps it round the edges, advances its twinkle, pulls an awake mote into
 * step with the beat, and springs every pushed mote back towards home. `time` slowly shifts the
 * currents so the swirls evolve. Mutates the cloud: it runs every animation frame.
 */
export function advanceCloud(cloud: Cloud, dt: number, time: number, aspect: number): void {
  const step = 0.002
  const shift = time * 0.02
  const potential = (x: number, y: number) =>
    cloud.flow(x * FLOW_SCALE * aspect + shift, y * FLOW_SCALE - shift * 0.6)
  const beat = beatPhase(time)
  const settle = Math.exp(-dt / AWAKE_SECONDS)
  for (const mote of cloud.motes) {
    if (mote.slot === null) {
      const dPdy =
        (potential(mote.x, mote.y + step) - potential(mote.x, mote.y - step)) / (2 * step)
      const dPdx =
        (potential(mote.x + step, mote.y) - potential(mote.x - step, mote.y)) / (2 * step)
      // Curl of the potential, in height units; divide x by aspect to get back to unit width.
      const vx = (dPdy / FLOW_SCALE) * DRIFT
      const vy = (-dPdx / (FLOW_SCALE * aspect)) * DRIFT
      mote.x = wrapUnit(mote.x + (vx * dt) / aspect)
      mote.y = wrapUnit(mote.y + vy * dt)
    }
    // Its own rhythm, plus (while awake) a pull towards the shared beat: Kuramoto coupling to
    // one leader, so everything a hand wakes ends up flashing together, then drifts apart again.
    const pull = mote.awake > 0 ? SYNC * mote.awake * Math.sin(beat - mote.phase) : 0
    mote.phase = wrapPhase(mote.phase + (mote.omega + pull) * dt)
    mote.awake = mote.awake * settle < 0.01 ? 0 : mote.awake * settle
    springHome(mote, dt)
  }
}

/** One step of a damped spring pulling a mote's offset back to zero (semi-implicit Euler). */
function springHome(mote: Mote, dt: number) {
  if (mote.dx === 0 && mote.dy === 0 && mote.vx === 0 && mote.vy === 0) return
  mote.vx += (-SPRING * mote.dx - DAMPING * mote.vx) * dt
  mote.vy += (-SPRING * mote.dy - DAMPING * mote.vy) * dt
  mote.dx += mote.vx * dt
  mote.dy += mote.vy * dt
  // No hard limit on the offset: a clamp would pile lights into a visible ridge. The stir eases
  // towards a bounded speed instead, so how far a light travels is bounded too.
  // Close enough to home and nearly still: rest exactly, so a calm cloud costs nothing here.
  if (Math.hypot(mote.dx, mote.dy) < 0.05 && Math.hypot(mote.vx, mote.vy) < 0.5) {
    mote.dx = 0
    mote.dy = 0
    mote.vx = 0
    mote.vy = 0
  }
}

/** Where the cloud is drawn this frame: the field's size, and the mark (if any) with its gather. */
export interface Placement {
  width: number
  height: number
  mark: MarkLayout | null
  /** How far the mark has gathered, 0 to 1. */
  gather: number
}

/**
 * Sets each mote's drawn pixel position (`px`, `py`): its home plus its offset. A mark mote's
 * home moves from its waiting place in the crowd to its place in the mark as the mark gathers,
 * and, once there, circles its place by about a pixel so the mark shimmers rather than sits.
 */
export function placeCloud(cloud: Cloud, { width, height, mark, gather }: Placement): void {
  for (const mote of cloud.motes) {
    let x = mote.x * width
    let y = mote.y * height
    if (mote.slot !== null && mark !== null) {
      const here = arrival(gather, mote.slot.stagger)
      const slotX = mark.centerX + mote.slot.x * mark.size + Math.cos(mote.phase) * 0.8
      const slotY = mark.centerY + mote.slot.y * mark.size + Math.sin(mote.phase) * 0.8
      x += (slotX - x) * here
      y += (slotY - y) * here
    }
    mote.px = x + mote.dx
    mote.py = y + mote.dy
  }
}

export interface StirOptions {
  /** Reach of the hand on either side of its path, in pixels. */
  radius: number
  /** Share of the hand's speed passed on to the lights it brushes, 0 to 1. */
  drag: number
  /** Speed straight out from the path at full hand speed, in pixels per second, so it parts. */
  push: number
  /** Fastest hand speed that counts (px/s), so a flick can't fling the cloud. */
  maxSpeed: number
}

/** A pixel point. */
export interface Point {
  x: number
  y: number
}

/** Hand speed (px/s) at which the outward push reaches full strength; slower hands push less. */
const FULL_PUSH_SPEED = 600

/** One straight piece of the hand's path, with its direction worked out once per frame. */
interface Segment {
  x: number
  y: number
  /** Unit direction and length. A zero-length segment has direction (0, 0). */
  ux: number
  uy: number
  length: number
}

function segmentsOf(path: readonly Point[], first: Point): Segment[] {
  const segments: Segment[] = []
  let from = first
  for (const to of path.slice(1)) {
    const length = Math.hypot(to.x - from.x, to.y - from.y)
    const ux = length > 0 ? (to.x - from.x) / length : 0
    const uy = length > 0 ? (to.y - from.y) / length : 0
    segments.push({ x: from.x, y: from.y, ux, uy, length })
    from = to
  }
  // A lone point is a hand that has only just arrived.
  if (segments.length === 0) segments.push({ x: first.x, y: first.y, ux: 0, uy: 0, length: 0 })
  return segments
}

/**
 * A hand (pointer or finger) moved along `path` (pixels, oldest first) in the last `dt` seconds.
 * Every light within reach of the whole path, not just its end, eases towards moving with the
 * hand and out of its way, and wakes. Sweeping the path means a fast move leaves one smooth
 * wake instead of a row of holes. The outward push grows with the hand's speed and fades as a
 * light gets further from home, so a slow or circling hand cannot dig a ringed hole; lights
 * right on the path part to alternate sides instead of riding along. The easing is the same
 * at any frame rate. Only offsets change, so the spring brings every light home. Mutates the
 * cloud; returns how many lights it touched.
 */
export function stirCloud(
  cloud: Cloud,
  path: readonly Point[],
  dt: number,
  { radius, drag, push, maxSpeed }: StirOptions,
): number {
  const [first] = path
  if (!first || dt <= 0) return 0
  const segments = segmentsOf(path, first)
  let length = 0
  for (const segment of segments) length += segment.length
  const speed = Math.min(length / dt, maxSpeed)
  const outward = push * Math.min(1, speed / FULL_PUSH_SPEED)
  // The path's bounds, widened by the reach: most of the cloud is outside them and skips the maths.
  const left = Math.min(...path.map((point) => point.x)) - radius
  const right = Math.max(...path.map((point) => point.x)) + radius
  const top = Math.min(...path.map((point) => point.y)) - radius
  const bottom = Math.max(...path.map((point) => point.y)) + radius
  // Frames per 60th of a second, so a blend applied each frame gives the same result at 120Hz.
  const frames = dt * 60
  let touched = 0
  cloud.motes.forEach((mote, index) => {
    if (mote.px < left || mote.px > right || mote.py < top || mote.py > bottom) return
    // The nearest point on the path to this light, and the direction the hand was going there.
    let nearest2 = Number.POSITIVE_INFINITY
    let awayX = 0
    let awayY = 0
    let headingX = 0
    let headingY = 0
    for (const segment of segments) {
      const along = clamp(
        (mote.px - segment.x) * segment.ux + (mote.py - segment.y) * segment.uy,
        0,
        segment.length,
      )
      const offX = mote.px - (segment.x + segment.ux * along)
      const offY = mote.py - (segment.y + segment.uy * along)
      const distance2 = offX * offX + offY * offY
      if (distance2 >= nearest2) continue
      nearest2 = distance2
      awayX = offX
      awayY = offY
      headingX = segment.ux
      headingY = segment.uy
    }
    const distance = Math.sqrt(nearest2)
    if (distance >= radius) return
    const reach = (1 - distance / radius) ** 2
    // Out of the hand's way. A light right on the path has no "out", so it takes a side.
    const side = index % 2 === 0 ? 1 : -1
    const outX = distance > 2 ? awayX / distance : -headingY * side
    const outY = distance > 2 ? awayY / distance : headingX * side
    // Less push the further a light already is from home, so pushed lights can't pile up.
    const room = Math.max(0, 1 - Math.hypot(mote.dx, mote.dy) / radius)
    const targetX = headingX * speed * drag + outX * outward * room
    const targetY = headingY * speed * drag + outY * outward * room
    const blend = 1 - (1 - reach) ** frames
    mote.vx += (targetX - mote.vx) * blend
    mote.vy += (targetY - mote.vy) * blend
    // Awake across most of the reach, not just on the line, so the wake is a band, not a seam.
    mote.awake = Math.max(mote.awake, smoothstep(reach * 4))
    touched++
  })
  return touched
}

export interface CallOptions {
  /** How far the call carries, in pixels. */
  reach: number
  /** How fast the answer spreads outward, in pixels per second. */
  speed: number
}

/**
 * A call into the dark at pixel point (x, y): every mote within reach answers with a flash,
 * nearest first, so the answers ripple outward like real fireflies replying to a signal.
 * `now` is the current animation-clock second; each answering mote records when it answers.
 * Uses where each mote was last drawn. Mutates the cloud and returns how many answered.
 */
export function answerCall(
  cloud: Cloud,
  x: number,
  y: number,
  { reach, speed }: CallOptions,
  now = 0,
): number {
  let answered = 0
  for (const mote of cloud.motes) {
    const distance = Math.hypot(mote.px - x, mote.py - y)
    if (distance > reach) continue
    mote.answerAt = now + distance / speed
    answered++
  }
  return answered
}

/**
 * How brightly to draw the cloud at pixel height y, from 0 to 1 (0.06 behind text). Page text sits in the
 * lower part of the field (the headline and intro on wide screens, everything on phones), and
 * it should read on near-clean black. The fade is soft, so the cloud thins towards the text
 * instead of stopping at a hard edge. On wide screens the text starts lower, so the cloud
 * keeps more of the field.
 */
export function textClearance(y: number, width: number, height: number): number {
  const start = width < NARROW ? 0.34 : 0.5
  const low = smoothstep((y / height - start) / 0.2)
  // The last 8% fades to nothing, so the field's lower edge dissolves instead of ending in a line.
  const edge = smoothstep((1 - y / height) / 0.08)
  return (1 - 0.94 * low) * edge
}

/**
 * How brightly to draw the cloud at distance `distance` from a gathered pod's centre, from 0.08
 * to 1: once the pod has formed (`formed` 1), the cloud clears inside its ring so the five
 * pod-mates and their names sit on clean black, with a soft edge just outside the ring.
 */
export function podClearance(distance: number, ringRadius: number, formed: number): number {
  const inside = 1 - smoothstep((distance - ringRadius) / (ringRadius * 0.3))
  return 1 - 0.92 * clamp(formed) * inside
}

/** Below this width the layout stacks: text runs full width under the field. */
export const NARROW = 720

/** Brightness of a mote's twinkle at `phase`, in [0, 1]: a gentle shimmer plus a brief spark. */
export function twinkle(phase: number): number {
  const shimmer = 0.62 + 0.3 * Math.sin(phase)
  const spark = ((1 + Math.cos(phase)) / 2) ** 24
  return Math.max(shimmer, spark)
}
