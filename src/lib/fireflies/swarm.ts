import { TAU, clamp, lerp, wrapPhase } from './math.ts'
import { between, createRandom } from './random.ts'
import { kuramotoStep } from './sync.ts'

/** A pod is five people: four plus one spare, so a no-show never leaves a pair. */
export const POD_SIZE = 5

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

/** The pod of five. The crowd around them is the firefly cloud (cloud.ts). */
export interface Swarm {
  pod: PodFirefly[]
}

export interface SwarmOptions {
  seed: number
}

export function createSwarm({ seed }: SwarmOptions): Swarm {
  const random = createRandom(seed)
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
  return { pod }
}

/**
 * Advances the pod's rhythms by `dt` seconds, coupled with strength `coupling` (Kuramoto), so a
 * strongly coupled pod falls into step. Mutates the swarm in place: it runs every animation frame.
 */
export function advanceSwarm(swarm: Swarm, dt: number, coupling: number): void {
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
