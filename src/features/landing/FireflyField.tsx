import { useEffect, useRef, type RefObject } from 'react'
import {
  advanceCloud,
  answerCall,
  cloudCountFor,
  createCloud,
  fireflyCountFor,
  fireflyGlow,
  NARROW,
  placeCloud,
  podClearance,
  stirCloud,
  textClearance,
  twinkle,
  type Cloud,
  type Point,
} from '../../lib/fireflies/cloud.ts'
import { clamp, lerp } from '../../lib/fireflies/math.ts'
import { storyAt, type StoryFrame } from '../../lib/fireflies/story.ts'
import {
  advanceSwarm,
  createSwarm,
  podPoint,
  type PodLayout,
  type Swarm,
} from '../../lib/fireflies/swarm.ts'
import { flash } from '../../lib/fireflies/sync.ts'
import {
  batchFor,
  dot,
  drawBatches,
  drawHalos,
  EMBER,
  FAINTEST,
  GLOW,
  makeHalos,
  MUTED,
  rgba,
  type Batch,
  type Halos,
  type Rgb,
} from './canvasLights.ts'

const MAX_PIXEL_RATIO = 2
/** Longest step we simulate, so a backgrounded tab doesn't jump on return. */
const MAX_FRAME_SECONDS = 1 / 20
/** How far a tap carries, and how fast the answers spread (px, px/s). */
const CALL = { reach: 220, speed: 340 } as const
/** How long an answer stays visibly bright, either side of its peak (s). */
const ANSWER_SECONDS = 0.5
/**
 * A hand moving through the field sweeps the lights along its path (px, share of its speed,
 * px/s outward at full hand speed, fastest speed that counts). They spring back home afterwards.
 */
const STIR = { radius: 90, drag: 0.2, push: 160, maxSpeed: 1600 } as const
/** How much a woken light brightens on the beat, over its own brightness. */
const WAKE_LIFT = 0.35
/** Most pointer events kept per frame for the path (one frame rarely sees more than a few). */
const PATH_POINTS = 12
/**
 * A firefly's halo: its radius at depth 0 and the extra at depth 1 (px), and the faintest glow
 * worth a halo. Halos are the one soft light on the page; dust stays flat.
 */
const HALO = { radius: 7, depthRadius: 17, faintest: 0.04 } as const
/** A firefly's resting light between glows: just enough to follow it in the dark. */
const EMBERING = 0.1

/** The same synthetic pod as the example names elsewhere on the page. */
const POD_NAMES = ['Maya', 'Jun', 'Priya', 'Sam', 'You'] as const

interface Call {
  x: number
  y: number
  /** Seconds, on the animation clock. */
  start: number
}

interface FireflyFieldProps {
  /** Live scroll progress through the story, 0 to 1. A field with no story keeps it at 0. */
  progress: RefObject<number>
  /** Draw one still frame instead of animating (reduced motion). */
  still: boolean
  /** Story progress the still frame shows: 0 for the crowd alone, 1 for the pod in step. */
  stillProgress?: number
  /** Element whose taps call into the dark, and whose pointer stirs the cloud. */
  callTarget?: RefObject<HTMLElement | null>
  /** Seed for the cloud and pod, so two fields on one page don't look identical. */
  seed?: number
}

/**
 * The story's field of fireflies on black: a swarm in yellow, violet and warm white, distant dust
 * shimmering and nearer fireflies floating on slow loops and glowing softly, and one pod of five
 * that gathers, lights up and falls into step as the story progresses. A hand passing through
 * sweeps the lights aside (they spring back) and wakes them, and woken lights fall into step
 * with one shared beat; a tap makes the lights near it flash back. Decorative (every idea is in the page text), so it is
 * hidden from assistive technology.
 */
export function FireflyField({
  progress,
  still,
  stillProgress = 1,
  callTarget,
  seed = 20261125,
}: FireflyFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let width = 0
    let height = 0
    let frameId = 0
    let lastTime = 0
    let clock = 0
    let visible = true
    // The hand's path since the last frame swept it (oldest first), and where it is now.
    let path: Point[] = []
    let hand: Point | null = null
    const calls: Call[] = []
    const batches = new Map<number, Batch>()

    const measure = () => {
      const box = canvas.getBoundingClientRect()
      width = box.width
      height = box.height
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    // The cloud is sized and shaped for the first measurement and kept as the field resizes.
    measure()
    const aspect = width / Math.max(1, height)
    // Spend the motes where they show: the open band above the text, not behind it.
    const room = (y: number) => textClearance(y * height, width, height)
    const cloud: Cloud = createCloud({
      seed,
      count: cloudCountFor(width, height),
      fireflies: fireflyCountFor(width, height),
      aspect,
      room,
    })
    const swarm: Swarm = createSwarm({ seed })
    const scene: Scene = { context, cloud, swarm, batches, halos: makeHalos(), glows: [] }
    const place = () => {
      placeCloud(cloud, { width, height })
    }

    const drawStill = () => {
      const frame = storyAt(stillProgress)
      // The still frame shows the end of its story: a lit pod flashes together.
      if (frame.lit > 0) for (const firefly of swarm.pod) firefly.phase = 0
      advanceCloud(cloud, 0, 0)
      place()
      draw(scene, frame, width, height, 0, [])
    }

    const resize = () => {
      measure()
      if (still) drawStill()
    }

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick)
      if (!visible) return
      const seconds = lastTime === 0 ? 0 : Math.min((now - lastTime) / 1000, MAX_FRAME_SECONDS)
      lastTime = now
      clock += seconds
      const frame = storyAt(progress.current)
      advanceCloud(cloud, seconds, clock)
      place()
      // Only a hand that moved stirs: a resting pointer leaves a one-point path and digs no hole.
      if (path.length > 1) stirCloud(cloud, path, seconds, STIR)
      path = hand ? [hand] : []
      advanceSwarm(swarm, seconds, frame.coupling)
      draw(scene, frame, width, height, clock, calls)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    if (still) drawStill()

    // Stop drawing while the field is scrolled away or the tab is hidden: phones have batteries.
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      lastTime = 0
    })
    visibility.observe(canvas)
    const onVisibilityChange = () => {
      lastTime = 0
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    const pointAt = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect()
      return { x: event.clientX - box.left, y: event.clientY - box.top }
    }
    // Call and response: a tap on the dark (not on a link or control) makes nearby lights answer.
    const onCall = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('a, button, input, label')) {
        return
      }
      const { x, y } = pointAt(event)
      answerCall(cloud, x, y, CALL, clock)
      calls.push({ x, y, start: clock })
      if (calls.length > 6) calls.shift()
    }
    // A hand moving through the dark stirs the cloud along its path; leaving ends the path, and
    // so does the browser taking over a touch (to scroll), which cancels the pointer.
    const onMove = (event: PointerEvent) => {
      hand = pointAt(event)
      // Every event since the last frame, so a fast curve is swept as a curve, not a chord.
      if (path.length < PATH_POINTS) path.push(hand)
      else path[path.length - 1] = hand
    }
    const onLeave = () => {
      hand = null
      path = []
    }
    // A still field doesn't answer or stir, so it doesn't listen.
    const target = still ? undefined : callTarget?.current
    target?.addEventListener('pointerdown', onCall)
    target?.addEventListener('pointermove', onMove)
    target?.addEventListener('pointerleave', onLeave)
    target?.addEventListener('pointercancel', onLeave)

    if (!still) frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      visibility.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      target?.removeEventListener('pointerdown', onCall)
      target?.removeEventListener('pointermove', onMove)
      target?.removeEventListener('pointerleave', onLeave)
      target?.removeEventListener('pointercancel', onLeave)
    }
  }, [progress, still, stillProgress, callTarget, seed])

  return <canvas ref={canvasRef} className="field" aria-hidden="true" />
}

function podLayout(width: number, height: number): PodLayout {
  const narrow = width < NARROW
  return {
    width,
    height,
    // Phones: centred in the band above the chapter text. Wider: to the right of the text.
    centerX: width * (narrow ? 0.5 : 0.72),
    centerY: height * (narrow ? 0.33 : 0.42),
    radius: narrow ? clamp(width * 0.17, 56, 80) : clamp(Math.min(width, height) * 0.13, 80, 130),
  }
}

interface Scene {
  context: CanvasRenderingContext2D
  cloud: Cloud
  swarm: Swarm
  batches: Map<number, Batch>
  /** The halo sprites, or null where an offscreen canvas can't be drawn (no halos then). */
  halos: Halos | null
  /** This frame's halos as flat x, y, radius, alpha, tone runs, reused every frame. */
  glows: number[]
}

function draw(
  { context, cloud, swarm, batches, halos, glows }: Scene,
  frame: StoryFrame,
  width: number,
  height: number,
  clock: number,
  calls: Call[],
) {
  context.clearRect(0, 0, width, height)

  // Each tap sends out one hairline ring, fading as it reaches the edge of the call.
  for (const call of calls) {
    const radius = (clock - call.start) * CALL.speed
    if (radius > CALL.reach) continue
    // A faint trace of the call; the answering lights are the event, not this ring.
    context.strokeStyle = rgba(EMBER, 0.14 * (1 - radius / CALL.reach))
    context.lineWidth = 1
    context.beginPath()
    context.arc(call.x, call.y, radius, 0, Math.PI * 2)
    context.stroke()
  }

  // The swarm, sorted into batches by tone, shape and brightness. It dims once the pod lights
  // up, so the eye goes to the pod.
  for (const batch of batches.values()) batch.squares.length = 0
  glows.length = 0
  const crowdLevel = 1 - 0.55 * frame.lit
  // Once the pod forms, the cloud clears inside its ring so the names sit on clean black.
  const layout = podLayout(width, height)
  const formed = frame.gather * frame.lit
  const ring = layout.radius * 1.7
  for (const mote of cloud.motes) {
    const x = mote.px
    const y = mote.py
    // How bright this spot of the field may be (1 in the open, near 0 behind text): it limits
    // the resting light, the wake and the answer alike, so nothing ever flashes behind text.
    const room =
      textClearance(y, width, height) *
      podClearance(Math.hypot(x - layout.centerX, y - layout.centerY), ring, formed)
    // A firefly's lantern, 0 to 1 (dust has none).
    const firefly = mote.kind === 'firefly'
    const lantern = firefly ? fireflyGlow(mote.phase) : 0
    const resting = firefly
      ? (EMBERING + (1 - EMBERING) * lantern) * crowdLevel * room
      : // Far dust is dimmer than near dust, so the swarm has depth.
        twinkle(mote.phase) * (0.35 + 0.5 * mote.depth) * crowdLevel * room
    // Woken by a passing hand: brighter than its own resting light on the beat, in step with
    // every other woken light. A lift, not a floor, so a wake shimmers instead of drawing a line.
    const woken = mote.awake * flash(mote.phase, 4)
    // Answering a call: swell and brighten around the moment it answers, then settle.
    const answer = Math.max(0, 1 - Math.abs(clock - mote.answerAt) / ANSWER_SECONDS)
    // A wake lifts lights that are already showing; it never reveals one the clearance hides,
    // which would put a flash behind the text.
    const showing = resting >= FAINTEST
    const lifted = showing ? resting + WAKE_LIFT * woken * room : 0
    const brightness = Math.max(lifted, answer * room)
    // A mote too dim to show isn't drawn, so the ground behind text and at the field's edge
    // stays clean black; the rest are rounded to the nearest brightness step.
    if (brightness < FAINTEST) continue
    const batch = batchFor(batches, mote.tone, firefly, brightness)
    if (firefly) {
      // A firefly's core swells a touch as it glows; its light is mostly in the halo.
      batch.squares.push(x, y, mote.size * (1 + 0.35 * Math.max(lantern, answer, woken)))
      const glow = Math.max(lantern, answer, WAKE_LIFT * woken) * crowdLevel * room
      if (glow > HALO.faintest) {
        const halo = (HALO.radius + HALO.depthRadius * mote.depth) * (0.75 + 0.25 * glow)
        glows.push(x, y, halo, glow, mote.tone)
      }
      continue
    }
    // Brightness carries the answer and the beat; size swells with them a little.
    const side = mote.size * 2 * (1 + 0.4 * answer + 0.25 * woken)
    batch.squares.push(x - side / 2, y - side / 2, side)
  }

  // Halos first, added onto the dark, so overlapping lights pool; the flat cores go on top.
  if (halos) drawHalos(context, halos, glows)
  drawBatches(context, batches)

  // A hairline round the gathered pod: these five are a group now.
  if (formed > 0.01) {
    context.strokeStyle = rgba(MUTED, 0.4 * formed)
    context.lineWidth = 1
    context.beginPath()
    context.arc(layout.centerX, layout.centerY, ring, 0, Math.PI * 2)
    context.stroke()
    context.font = '500 13px "Host Grotesk", system-ui, sans-serif'
    context.textBaseline = 'middle'
  }

  // Lit pod-mates are solid Glow (any dimmer and Glow turns olive); they flash by swelling, so a
  // pod in step swells together.
  const podDot = clamp(layout.radius * 0.075, 5, 10)
  swarm.pod.forEach((firefly, index) => {
    const { x, y } = podPoint(firefly, frame.gather, layout, clock)
    const pulse = flash(firefly.phase, 3)
    const crowdAlpha = 0.12 + 0.82 * flash(firefly.phase, 5)
    // Until it gathers, a pod-mate is one of the crowd, so it dims behind the text like them.
    const inCrowd = lerp(textClearance(y, width, height), 1, frame.gather)
    const alpha = lerp(crowdAlpha * inCrowd, 1, frame.lit)
    const radius = lerp(1.6, podDot * (1 + 0.75 * pulse), frame.gather)
    const colour: Rgb = [
      lerp(EMBER[0], GLOW[0], frame.lit),
      lerp(EMBER[1], GLOW[1], frame.lit),
      lerp(EMBER[2], GLOW[2], frame.lit),
    ]
    dot(context, x, y, radius, colour, alpha)
    if (formed > 0.01) {
      // Labels point away from the pod's centre, so none can run into a neighbour's dot.
      const outward = firefly.slotX < -0.1 ? -1 : 1
      context.textAlign = outward < 0 ? 'right' : 'left'
      context.fillStyle = rgba(MUTED, formed)
      // The pod has POD_SIZE fireflies, one per name; the fallback only satisfies the type checker.
      /* v8 ignore next -- @preserve */
      const name = POD_NAMES[index] ?? ''
      context.fillText(name, x + outward * (podDot * 2 + 6), y)
    }
  })
}
