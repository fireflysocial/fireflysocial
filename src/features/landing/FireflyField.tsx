import { useEffect, useRef, type RefObject } from 'react'
import {
  advanceCloud,
  answerCall,
  cloudCountFor,
  createCloud,
  NARROW,
  placeCloud,
  podClearance,
  stirCloud,
  textClearance,
  twinkle,
  type Cloud,
  type Point,
  type Tone,
} from '../../lib/fireflies/cloud.ts'
import {
  arrival,
  markClearance,
  markCountFor,
  markGather,
  markLayout,
  readableMark,
  type MarkBand,
  type MarkLayout,
} from '../../lib/fireflies/mark.ts'
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
/** Largest size a light of the mark swells to, so a stirred tail never clumps into blotches. */
const MARK_SWELL_MAX = 1.4
/** Most pointer events kept per frame for the path (one frame rarely sees more than a few). */
const PATH_POINTS = 12
/** Brightness steps the cloud is drawn in, so a frame sets a few dozen fill styles, not thousands. */
const LEVELS = 8

type Rgb = readonly [number, number, number]

/** The cloud's tones: Glow (#D9F84A), Dusk (#C3A0FF) and Ember (#F2ECCE). */
const GLOW: Rgb = [217, 248, 74]
const DUSK: Rgb = [195, 160, 255]
const EMBER: Rgb = [242, 236, 206]
const TONES: Record<Tone, Rgb> = { 0: GLOW, 1: DUSK, 2: EMBER }
/** Muted label colour (#9A9A92), for names and hairlines. */
const MUTED: Rgb = [154, 154, 146]

/** The same synthetic pod as the example names elsewhere on the page. */
const POD_NAMES = ['Maya', 'Jun', 'Priya', 'Sam', 'You'] as const

interface Call {
  x: number
  y: number
  /** Seconds, on the animation clock. */
  start: number
}

/** All the motes drawn with one fill style in a frame. */
interface Batch {
  style: string
  /** Flat x, y, side triples, reused every frame so drawing allocates nothing per mote. */
  squares: number[]
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
  /** Gather part of the cloud into the Firefly mark, in the open band above the text. */
  mark?: boolean
  /**
   * The open band the mark sits in (an empty element between the header and the text). The
   * mark is sized and centred to it, so it never crowds the header or runs into the text.
   */
  markStage?: RefObject<HTMLElement | null>
}

/**
 * A field of fireflies on black: a cloud of thousands of tiny lights in yellow, violet and warm
 * white, drifting in clumps like smoke, and one pod of five that gathers, lights up and falls
 * into step as the story progresses. With `mark`, part of the cloud gathers into the Firefly
 * mark, whose tail keeps a steady beat. A hand passing through sweeps the lights aside (they
 * spring back) and wakes them, and woken lights fall into step with the mark's beat; a tap
 * makes the lights near it flash back. Decorative (every idea is in the page text), so it is
 * hidden from assistive technology.
 */
export function FireflyField({
  progress,
  still,
  stillProgress = 1,
  callTarget,
  seed = 20261125,
  mark = false,
  markStage,
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
    let band: MarkBand | undefined

    const measure = () => {
      const box = canvas.getBoundingClientRect()
      width = box.width
      height = box.height
      const stage = markStage?.current?.getBoundingClientRect()
      band = stage ? { top: stage.top - box.top, bottom: stage.bottom - box.top } : undefined
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
    const markCount = mark ? markCountFor(markLayout(width, height, band).size) : 0
    const cloud: Cloud = createCloud({
      seed,
      count: cloudCountFor(width, height),
      aspect,
      room,
      markCount,
    })
    const swarm: Swarm = createSwarm({ seed })
    const scene = { context, cloud, swarm, batches }
    // Placement is recomputed every frame (and on resize), so a band that shrinks too small for
    // a readable mark drops it then, and one that grows back brings it back.
    const place = (gather: number) => {
      const layout = mark ? readableMark(markLayout(width, height, band)) : null
      placeCloud(cloud, { width, height, mark: layout, gather })
      return layout
    }

    const drawStill = () => {
      const frame = storyAt(stillProgress)
      // The still frame shows the end of its story: a lit pod flashes together.
      if (frame.lit > 0) for (const firefly of swarm.pod) firefly.phase = 0
      // And a gathered mark.
      draw(scene, frame, width, height, 0, [], place(1), 1)
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
      advanceCloud(cloud, seconds, clock, aspect)
      const gather = markGather(clock)
      const layout = place(gather)
      // Only a hand that moved stirs: a resting pointer leaves a one-point path and digs no hole.
      if (path.length > 1) stirCloud(cloud, path, seconds, STIR)
      path = hand ? [hand] : []
      advanceSwarm(swarm, seconds, frame.coupling)
      draw(scene, frame, width, height, clock, calls, layout, gather)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    // The band changes size with the text (fonts loading, wrapping), not only with the field.
    const stage = markStage?.current
    if (stage) observer.observe(stage)
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
  }, [progress, still, stillProgress, callTarget, seed, mark, markStage])

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
}

function draw(
  { context, cloud, swarm, batches }: Scene,
  frame: StoryFrame,
  width: number,
  height: number,
  clock: number,
  calls: Call[],
  mark: MarkLayout | null,
  gather: number,
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

  // The cloud, sorted into batches by tone and brightness. It dims once the pod lights up, so
  // the eye goes to the pod.
  for (const batch of batches.values()) batch.squares.length = 0
  const crowdLevel = 1 - 0.55 * frame.lit
  // Once the pod forms, the cloud clears inside its ring so the names sit on clean black.
  const layout = podLayout(width, height)
  const formed = frame.gather * frame.lit
  const ring = layout.radius * 1.7
  for (const mote of cloud.motes) {
    const x = mote.px
    const y = mote.py
    // How bright this spot of the field may be (1 in the open, near 0 behind text): it limits
    // the resting twinkle, the wake and the answer alike, so nothing ever flashes behind text.
    let room = 1
    let resting: number
    let swell = 0
    // With no mark this frame (none asked for, or no room for one), the mark's lights are just
    // more of the crowd and obey the crowd's clearances.
    if (mote.slot === null || mark === null) {
      const aroundPod = podClearance(
        Math.hypot(x - layout.centerX, y - layout.centerY),
        ring,
        formed,
      )
      const aroundMark = mark ? markClearance(x, y, mark, gather) : 1
      room = textClearance(y, width, height) * aroundPod * aroundMark
      resting = twinkle(mote.phase) * crowdLevel * room
    } else {
      // A light of the mark: once in place, the tail is solid Glow (any dimmer turns olive) and
      // flashes on the beat by swelling; the wings twinkle on their own.
      const here = arrival(gather, mote.slot.stagger)
      const lit = mote.slot.tail ? 1 : Math.max(0.72, twinkle(mote.phase))
      resting = lerp(twinkle(mote.phase) * 0.8, lit, here)
      if (mote.slot.tail) swell = 0.3 * here * flash(mote.phase, 3)
    }
    // Woken by a passing hand: brighter than its own resting light on the beat, in step with
    // every other woken light. A lift, not a floor, so a wake shimmers instead of drawing a line.
    const woken = mote.awake * flash(mote.phase, 4)
    // Answering a call: swell and brighten around the moment it answers, then settle.
    const answer = Math.max(0, 1 - Math.abs(clock - mote.answerAt) / ANSWER_SECONDS)
    // A wake lifts lights that are already showing; it never reveals one the clearance hides,
    // which would put a flash behind the text.
    const showing = Math.round(clamp(resting) * LEVELS) > 0
    const lifted = showing ? resting + WAKE_LIFT * woken * room : 0
    const brightness = Math.max(lifted, answer * room)
    // Rounded to the nearest brightness step; a mote too dim for the first step isn't drawn,
    // so the ground behind text and at the field's edge stays clean black.
    const level = Math.round(clamp(brightness) * LEVELS)
    if (level === 0) continue
    const key = mote.tone * (LEVELS + 1) + level
    let batch = batches.get(key)
    if (!batch) {
      batch = { style: rgba(TONES[mote.tone], level / LEVELS), squares: [] }
      batches.set(key, batch)
    }
    // Brightness carries the answer and the beat; size swells with them a little. The mark's
    // lights take the larger swell rather than the sum, so a stirred tail keeps its grain.
    const grow =
      mote.slot === null
        ? 1 + 0.4 * answer + 0.25 * woken
        : Math.min(MARK_SWELL_MAX, 1 + Math.max(swell, 0.4 * answer, 0.25 * woken))
    const side = mote.size * 2 * grow
    batch.squares.push(x - side / 2, y - side / 2, side)
  }
  for (const batch of batches.values()) {
    context.fillStyle = batch.style
    const { squares } = batch
    for (let i = 0; i < squares.length; i += 3) {
      // Squares are pushed as whole x, y, side triples, so every index here is in range; each
      // fallback only satisfies the type checker under noUncheckedIndexedAccess. Separate reads,
      // not a destructured array, so drawing allocates nothing per square.
      /* v8 ignore next -- @preserve */
      const left = squares[i] ?? 0
      /* v8 ignore next -- @preserve */
      const top = squares[i + 1] ?? 0
      /* v8 ignore next -- @preserve */
      const side = squares[i + 2] ?? 0
      context.fillRect(left, top, side, side)
    }
  }

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

function rgba([r, g, b]: Rgb, alpha: number): string {
  return `rgba(${String(Math.round(r))}, ${String(Math.round(g))}, ${String(Math.round(b))}, ${String(clamp(alpha))})`
}

/** A flat dot. No blur or bloom: per the brand, the flat dot is the light. */
function dot(
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
