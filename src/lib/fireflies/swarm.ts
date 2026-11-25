import { TAU, clamp, lerp, wrapPhase } from './math.ts'
import { between, createRandom } from './random.ts'
import { kuramotoStep } from './sync.ts'

/** A pod is five people: four plus one spare, so a no-show never leaves a pair. */
export const POD_SIZE = 5

/** A stranger in the crowd: drifts slowly and blinks on its own rhythm. */
export interface AmbientFirefly {
  /** Position in unit space, 0 to 1 across the field. */
  x: number
  y: number
  /** Heading in radians, and how fast it turns. */
  heading: number
  turn: number
  /** Speed in field-widths per second. */
  speed: number
  phase: number
  /** Natural flashing rhythm, radians per second. */
  omega: number
  /** Relative dot size, around 1. */
  size: number
  /** Animation-clock second at which this firefly answers a call; -Infinity if it hasn't. */
  answerAt: number
}

/** One of the five pod-mates. */
export interface PodFirefly {
  /** Where it waits in the crowd before the pod forms, in unit space. */
  startX: number
  startY: number
  /** Its place in the gathered pod, relative to the pod's centre, in pod radii. */
  slotX: number
  slotY: number
  phase: number
  omega: number
}

export interface Swarm {
  ambient: AmbientFirefly[]
  pod: PodFirefly[]
}

export interface SwarmOptions {
  seed: number
  ambientCount: number
}

export function createSwarm({ seed, ambientCount }: SwarmOptions): Swarm {
  const random = createRandom(seed)
  const ambient: AmbientFirefly[] = Array.from({ length: Math.max(0, ambientCount) }, () => ({
    x: random(),
    y: random(),
    heading: between(random, 0, TAU),
    turn: between(random, -0.35, 0.35),
    speed: between(random, 0.003, 0.011),
    phase: between(random, 0, TAU),
    omega: TAU / between(random, 2.6, 6.5),
    size: between(random, 0.7, 1.4),
    answerAt: Number.NEGATIVE_INFINITY,
  }))
  const pod: PodFirefly[] = Array.from({ length: POD_SIZE }, (_, index) => {
    // A fixed pentagon, point up: every pod-mate has its own side, so name labels never collide.
    const angle = (index / POD_SIZE) * TAU - Math.PI / 2
    const distance = 1
    return {
      startX: between(random, 0.08, 0.92),
      startY: between(random, 0.12, 0.88),
      slotX: Math.cos(angle) * distance,
      slotY: Math.sin(angle) * distance,
      // Spread evenly round the cycle so the pod starts visibly out of step.
      phase: wrapPhase((index / POD_SIZE) * TAU + between(random, -0.3, 0.3)),
      // Close but different rhythms: they drift apart alone, and lock together when coupled.
      omega: TAU / between(random, 1.7, 2.1),
    }
  })
  return { ambient, pod }
}

/** How many strangers to draw for a field of this size: denser on big screens, capped for phones. */
export function ambientCountFor(width: number, height: number): number {
  return Math.round(clamp((width * height) / 2600, 90, 380))
}

/**
 * Moves the crowd and advances every rhythm by `dt` seconds. The pod's rhythms are coupled
 * with strength `coupling`. Mutates the swarm in place: it runs every animation frame.
 */
export function advanceSwarm(swarm: Swarm, dt: number, coupling: number): void {
  for (const firefly of swarm.ambient) {
    firefly.heading += firefly.turn * dt
    firefly.x = wrapUnit(firefly.x + Math.cos(firefly.heading) * firefly.speed * dt)
    firefly.y = wrapUnit(firefly.y + Math.sin(firefly.heading) * firefly.speed * dt)
    firefly.phase = wrapPhase(firefly.phase + firefly.omega * dt)
  }
  const phases = kuramotoStep(
    swarm.pod.map((firefly) => firefly.phase),
    swarm.pod.map((firefly) => firefly.omega),
    coupling,
    dt,
  )
  swarm.pod.forEach((firefly, index) => {
    // kuramotoStep returns one phase per input, so the fallback only satisfies the type checker.
    /* v8 ignore next -- @preserve */
    firefly.phase = phases[index] ?? firefly.phase
  })
}

export interface CallOptions {
  /** How far the call carries, in pixels. */
  reach: number
  /** How fast the answer spreads outward, in pixels per second. */
  speed: number
}

/**
 * A call into the dark at pixel point (x, y): every stranger within reach answers with a flash,
 * nearest first, so the answers ripple outward like real fireflies replying to a signal.
 * `now` is the current animation-clock second; each answering firefly records when it answers
 * (`answerAt`) so the renderer can make the answer stand out. Mutates the crowd and returns
 * how many answered.
 */
export function answerCall(
  swarm: Swarm,
  x: number,
  y: number,
  width: number,
  height: number,
  { reach, speed }: CallOptions,
  now = 0,
): number {
  let answered = 0
  for (const firefly of swarm.ambient) {
    const distance = Math.hypot(firefly.x * width - x, firefly.y * height - y)
    if (distance > reach) continue
    // A flash peaks at phase 0, so set each phase that far behind 0: it flashes after `delay`.
    const delay = distance / speed
    firefly.phase = wrapPhase(-firefly.omega * delay)
    firefly.answerAt = now + delay
    answered++
  }
  return answered
}

export interface PodLayout {
  width: number
  height: number
  centerX: number
  centerY: number
  /** Radius of the gathered pod, in pixels. */
  radius: number
}

/**
 * Pixel position of a pod-mate: in the crowd when `gather` is 0, in its pod slot when 1.
 * `time` (seconds) adds a gentle hover so the gathered pod never looks frozen.
 */
export function podPoint(
  firefly: PodFirefly,
  gather: number,
  layout: PodLayout,
  time: number,
): { x: number; y: number } {
  const amount = clamp(gather)
  const hover = layout.radius * 0.08
  const seed = firefly.slotX * 7 + firefly.slotY * 13
  const slotX = layout.centerX + firefly.slotX * layout.radius + Math.sin(time * 0.9 + seed) * hover
  const slotY = layout.centerY + firefly.slotY * layout.radius + Math.cos(time * 0.7 + seed) * hover
  return {
    x: lerp(firefly.startX * layout.width, slotX, amount),
    y: lerp(firefly.startY * layout.height, slotY, amount),
  }
}

function wrapUnit(value: number): number {
  const wrapped = value % 1
  return wrapped < 0 ? wrapped + 1 : wrapped
}
