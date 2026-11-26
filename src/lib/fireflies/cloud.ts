import { TAU, clamp, smoothstep, wrapPhase } from './math.ts'
import { createNoise2D, fractalNoise } from './noise.ts'
import { between, createRandom, type Random } from './random.ts'

/**
 * The firefly swarm: a summer night of lights over the city, in three tones.
 *
 * Two kinds of light share the dark. Fine **dust**, distant fireflies too small to make out,
 * shimmers softly; it gives the night its depth. **Fireflies**, closer, glow and dim slowly,
 * each on its own unhurried rhythm (revised 2026-11-26: quick flashes read as "constant
 * flashing"; the user asked for something subtle).
 *
 * Nothing follows a shared current. Every light has a fixed home and wanders a slow, looping
 * path of its own around it (revised 2026-11-26: the earlier curl-noise drift slowly combed the
 * cloud into long filaments, the "weird patterns" the user reported). Because homes never move,
 * the swarm keeps its shape for as long as the page is open: denser groves, open dark, and clean
 * black behind the text.
 *
 * A hand passing through pushes lights aside and a spring brings them home, so the swarm parts
 * and heals. Lights a hand passes wake and fall into step with one shared beat.
 */

/** Tones, painted by the renderer: 0 Glow (yellow-green), 1 Dusk (violet), 2 Ember (warm white). */
export type Tone = 0 | 1 | 2
export const TONE_COUNT = 3

/** Dust shimmers far off; a firefly flashes close by, with a halo. */
export type Kind = 'dust' | 'firefly'

/** A slow looping path: two sine terms per axis, each with its own rate and phase. */
export interface Wander {
  /** Reach of the loop either side of home, in pixels. */
  reachX: number
  reachY: number
  /** Angular rates (radians per second) and phases for x, x's overtone, y, y's overtone. */
  rates: readonly [number, number, number, number]
  phases: readonly [number, number, number, number]
}

/** One light in the swarm. */
export interface Mote {
  /** Home, in unit space (0 to 1 across the field). */
  x: number
  y: number
  kind: Kind
  /** How near it is, 0 (far) to 1 (near): nearer lights are larger, brighter and roam further. */
  depth: number
  wander: Wander
  /** Where its wander has taken it from home, in pixels. Set by `advanceCloud`. */
  wx: number
  wy: number
  /** Offset from home in pixels, and its velocity (px/s): a hand's push, springing back. */
  dx: number
  dy: number
  vx: number
  vy: number
  /** Where it was drawn last frame, in pixels. Set by `placeCloud`. */
  px: number
  py: number
  tone: Tone
  /** Flash or twinkle phase and rhythm (radians, radians per second). 0 is the flash. */
  phase: number
  omega: number
  /** Relative size, around 1. */
  size: number
  /** Animation-clock second at which this mote answers a call; -Infinity if it hasn't. */
  answerAt: number
  /** How awake a passing hand has left it, 0 to 1. Awake motes fall into step with the beat. */
  awake: number
}

export interface Cloud {
  motes: Mote[]
}

export interface CloudOptions {
  seed: number
  /** How many dust lights. */
  count: number
  /** How many fireflies (the flashing, haloed lights). */
  fireflies?: number
  /** Field width divided by height, so groves are round on any screen. */
  aspect: number
  /**
   * Where the swarm may gather, 0 to 1 at unit height y: lower values make a light there less
   * likely, so a field whose lower part sits behind text spends its lights in the open part.
   */
  room?: (y: number) => number
  /** Paint every dust light and firefly in this one tone (the hero's meadow is all Glow). */
  tone?: Tone
}

/** How finely the swarm groups: higher gives more, smaller groves. */
const GROVE_SCALE = 1.1
/** Most candidates tried per light asked for, before `createCloud` settles for fewer. */
const MAX_ATTEMPTS_PER_MOTE = 100
/** The shared beat that woken lights fall into (s per flash). */
export const BEAT_SECONDS = 2.6
/** The spring that pulls a pushed light home: stiffness (1/s²) and damping (1/s), a smooth heal. */
const SPRING = 11
const DAMPING = 4.6
/** How long a light stays awake after a hand passes (s, time constant): about two beats. */
const AWAKE_SECONDS = 4
/** How strongly an awake light is pulled into step with the beat (Kuramoto coupling, 1/s). */
const SYNC = 9

/**
 * A light of the given kind and depth: its size, tone-independent rhythm and wandering loop.
 * Nearer lights are larger and roam further; dust loops slowly over a few pixels, a firefly
 * over tens of pixels, so the near swarm visibly floats and the far one barely stirs.
 */
function mote(random: Random, x: number, y: number, kind: Kind, depth: number, tone: Tone): Mote {
  const firefly = kind === 'firefly'
  const reach = firefly ? 16 + 46 * depth : 4 + 12 * depth
  // Slow: a firefly takes 16 to 40 s round its main loop, dust longer still.
  const [slowest, fastest] = firefly ? ([40, 16] as const) : ([60, 28] as const)
  return {
    x,
    y,
    kind,
    depth,
    wander: {
      reachX: reach * between(random, 0.7, 1.2),
      reachY: reach * between(random, 0.5, 0.9),
      rates: [
        (TAU / between(random, fastest, slowest)) * sign(random),
        TAU / between(random, 7, 14),
        (TAU / between(random, fastest, slowest)) * sign(random),
        TAU / between(random, 6, 12),
      ],
      phases: [
        between(random, 0, TAU),
        between(random, 0, TAU),
        between(random, 0, TAU),
        between(random, 0, TAU),
      ],
    },
    wx: 0,
    wy: 0,
    dx: 0,
    dy: 0,
    vx: 0,
    vy: 0,
    px: 0,
    py: 0,
    tone,
    phase: between(random, 0, TAU),
    // A firefly glows every 6 to 11 s, slowly; dust shimmers every 3 to 7 s.
    omega: firefly ? TAU / between(random, 6, 11) : TAU / between(random, 3, 7),
    size: firefly ? 0.8 + 0.9 * depth : between(random, 0.55, 1.05) * (0.8 + 0.4 * depth),
    answerAt: Number.NEGATIVE_INFINITY,
    awake: 0,
  }
}

function sign(random: Random): number {
  return random() < 0.5 ? -1 : 1
}

/**
 * Places `count` dust lights and `fireflies` fireflies. Each candidate is kept with a
 * probability set by fractal noise, so the swarm gathers into soft groves with open dark
 * between them (never an even sprinkle, never filaments). Dust leans yellow in some groves and
 * violet in others; fireflies are mostly Glow, like real ones.
 */
export function createCloud({
  seed,
  count,
  fireflies = 0,
  aspect,
  room = () => 1,
  tone,
}: CloudOptions): Cloud {
  const random = createRandom(seed)
  const density = createNoise2D(seed + 1)
  const hue = createNoise2D(seed + 2)
  // Groves are sized to the field's shorter side, so a tall phone field gets real groves.
  const grove = GROVE_SCALE / Math.min(1, aspect)
  const motes: Mote[] = []

  /**
   * Rejection sampling, with a bound: a `room` that leaves (almost) nowhere to gather would
   * otherwise never fill the count. `floor` is the chance a light lands in open dark, so the
   * voids keep a faint scatter instead of looking cut out.
   */
  const scatter = (wanted: number, floor: number, make: (x: number, y: number) => Mote) => {
    const target = motes.length + Math.max(0, wanted)
    const attempts = Math.max(0, wanted) * MAX_ATTEMPTS_PER_MOTE
    for (let attempt = 0; attempt < attempts && motes.length < target; attempt++) {
      const x = random()
      const y = random()
      const d = (fractalNoise(density, x * grove * aspect, y * grove, 3) + 1) / 2
      const keep = (floor + (1 - floor) * smoothstep((d - 0.42) / 0.26)) * room(y)
      if (random() > keep) continue
      motes.push(make(x, y))
    }
  }

  scatter(count, 0.12, (x, y) => {
    const lean = (hue(x * 1.3 * aspect, y * 1.3) + 1) / 2
    // Mostly far: dust is the distant swarm.
    return mote(random, x, y, 'dust', random() ** 1.6, tone ?? pickTone(random(), lean))
  })
  scatter(fireflies, 0.3, (x, y) =>
    mote(random, x, y, 'firefly', random(), tone ?? pickFireflyTone(random())),
  )

  return { motes }
}

/** 16% are warm white; of the rest, the violet share grows from 15% to 65% with `lean`. */
export function pickTone(roll: number, lean: number): Tone {
  if (roll < 0.16) return 2
  const violetShare = 0.15 + 0.5 * clamp(lean)
  return roll < 0.16 + 0.84 * violetShare ? 1 : 0
}

/** Fireflies are mostly Glow, like real ones: 70% Glow, 20% Ember, 10% Dusk. */
export function pickFireflyTone(roll: number): Tone {
  if (roll < 0.7) return 0
  return roll < 0.9 ? 2 : 1
}

/** How much dust a field of this size gets: a deep night, capped so phones keep 60fps. */
export function cloudCountFor(width: number, height: number): number {
  return Math.round(clamp((width * height) / 240, 1200, 5200))
}

/** How many fireflies a field of this size gets: few enough that each one reads as a light. */
export function fireflyCountFor(width: number, height: number): number {
  return Math.round(clamp((width * height) / 1700, 140, 560))
}

/** The shared beat's phase at animation-clock second `time`: 0 is the moment of the flash. */
export function beatPhase(time: number): number {
  return wrapPhase((time * TAU) / BEAT_SECONDS)
}

/** Where a light's wander has taken it from home at animation-clock second `time`, in pixels. */
export function wanderAt({ reachX, reachY, rates, phases }: Wander, time: number) {
  const [rx, ox, ry, oy] = rates
  const [px, qx, py, qy] = phases
  // The overtone adds a lazy wobble to the loop, so no two paths look like the same ellipse.
  return {
    x: (reachX * (Math.sin(rx * time + px) + 0.35 * Math.sin(ox * time + qx))) / 1.35,
    y: (reachY * (Math.sin(ry * time + py) + 0.35 * Math.sin(oy * time + qy))) / 1.35,
  }
}

/**
 * Advances every light by `dt` seconds: moves it along its wandering loop, advances its glow,
 * pulls an awake light into step with the beat, and springs every pushed light back towards
 * home. Mutates the cloud: it runs every animation frame.
 */
export function advanceCloud(cloud: Cloud, dt: number, time: number): void {
  const beat = beatPhase(time)
  const settle = Math.exp(-dt / AWAKE_SECONDS)
  for (const mote of cloud.motes) {
    const { x, y } = wanderAt(mote.wander, time)
    mote.wx = x
    mote.wy = y
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
  // Close enough to home and nearly still: rest exactly, so a calm swarm costs nothing here.
  if (Math.hypot(mote.dx, mote.dy) < 0.05 && Math.hypot(mote.vx, mote.vy) < 0.5) {
    mote.dx = 0
    mote.dy = 0
    mote.vx = 0
    mote.vy = 0
  }
}

/** Where the cloud is drawn this frame: its area in the canvas, in pixels. */
export interface Placement {
  /** Where the swarm's own area starts in the canvas (px); 0 when it fills the canvas. */
  left?: number
  top?: number
  width: number
  height: number
}

/**
 * Sets each light's drawn pixel position (`px`, `py`): home, plus its wander, plus a hand's
 * offset.
 */
export function placeCloud(cloud: Cloud, { left = 0, top = 0, width, height }: Placement): void {
  for (const mote of cloud.motes) {
    mote.px = left + mote.x * width + mote.wx + mote.dx
    mote.py = top + mote.y * height + mote.wy + mote.dy
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

/**
 * Adds a pointer sample to a hand's path since the last frame (mutating `path`). Every sample is
 * kept until the frame consumes it, so a fast curve is swept as the curve it was. Only past `max`
 * samples (when frames stall) is the path thinned to every other point, always keeping its first
 * and newest, so it still covers the whole sweep at a coarser grain rather than cutting a chord.
 */
export function extendPath(path: Point[], point: Point, max: number): void {
  path.push(point)
  if (path.length <= max) return
  const last = path.length - 1
  const thinned = path.filter((_, index) => index % 2 === 0 || index === last)
  path.splice(0, path.length, ...thinned)
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

/** Brightness of a dust light's twinkle at `phase`, in [0, 1]: a gentle shimmer plus a spark. */
export function twinkle(phase: number): number {
  const shimmer = 0.62 + 0.3 * Math.sin(phase)
  const spark = ((1 + Math.cos(phase)) / 2) ** 24
  return Math.max(shimmer, spark)
}

/** Share of a firefly's cycle spent rising to its glow, and the time constant of its fade. */
const FLASH_RISE = 0.16
const FLASH_FADE = 0.15

/**
 * Brightness of a firefly at `phase`, in [0, 1]: dim most of the cycle, then a slow swell to
 * full at phase 0 (about a second and a half) and a slower fade, a lantern breathing rather than
 * a blink.
 */
export function fireflyGlow(phase: number): number {
  const u = wrapPhase(phase + FLASH_RISE * TAU) / TAU
  if (u < FLASH_RISE) return smoothstep(u / FLASH_RISE)
  return Math.exp(-(u - FLASH_RISE) / FLASH_FADE)
}
