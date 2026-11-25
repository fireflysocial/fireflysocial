import { useEffect, useRef, type RefObject } from 'react'
import { clamp, lerp } from '../../lib/fireflies/math.ts'
import { storyAt, type StoryFrame } from '../../lib/fireflies/story.ts'
import {
  advanceSwarm,
  ambientCountFor,
  createSwarm,
  podPoint,
  type PodLayout,
  type Swarm,
} from '../../lib/fireflies/swarm.ts'
import { flash } from '../../lib/fireflies/sync.ts'

/** Same field on every visit. */
const SEED = 20261125
const MAX_PIXEL_RATIO = 2
/** Longest step we simulate, so a backgrounded tab doesn't jump on return. */
const MAX_FRAME_SECONDS = 1 / 20

/** Brand colours as RGB: Wing on light (#C9CFDE) for strangers, Glow (#D9F84A) for the pod. */
const CROWD: Rgb = [201, 207, 222]
const GLOW: Rgb = [217, 248, 74]
/** Muted label colour (#9AA3BF), for names and the pod's hairline. */
const MUTED: Rgb = [154, 163, 191]

/** The same synthetic pod as the phone preview further down the page. */
const POD_NAMES = ['Maya', 'Jun', 'Priya', 'Sam', 'You'] as const

type Rgb = readonly [number, number, number]

interface FireflyFieldProps {
  /** Live scroll progress through the story, 0 to 1. */
  progress: RefObject<number>
  /** Draw one still, already-in-step frame instead of animating. */
  still: boolean
}

/**
 * The landing page's night field: a crowd of faint strangers, and one pod of five that gathers,
 * lights up and falls into step as the visitor scrolls. Purely decorative (the story is told in
 * the page text), so it is hidden from assistive technology.
 */
export function FireflyField({ progress, still }: FireflyFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let width = 0
    let height = 0
    let swarm: Swarm | null = null
    let frameId = 0
    let lastTime = 0
    let visible = true

    const resize = () => {
      const box = canvas.getBoundingClientRect()
      width = box.width
      height = box.height
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      swarm ??= createSwarm({ seed: SEED, ambientCount: ambientCountFor(width, height) })
      if (still) drawStill()
    }

    const drawStill = () => {
      if (!swarm) return
      // Reduced motion: show the end of the story, the pod gathered and flashing together.
      for (const firefly of swarm.pod) firefly.phase = 0
      draw(
        context,
        swarm,
        { chapter: 4, gather: 1, lit: 1, coupling: 0, week: 4 },
        width,
        height,
        0,
      )
    }

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick)
      if (!swarm || !visible) return
      const seconds = lastTime === 0 ? 0 : Math.min((now - lastTime) / 1000, MAX_FRAME_SECONDS)
      lastTime = now
      const frame = storyAt(progress.current)
      advanceSwarm(swarm, seconds, frame.coupling)
      draw(context, swarm, frame, width, height, now / 1000)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

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

    if (!still) frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      visibility.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [progress, still])

  return <canvas ref={canvasRef} className="field" aria-hidden="true" />
}

const NARROW = 720

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

/**
 * How much of the crowd to draw at a point: chapter text sits low (phones) or low-left
 * (wider screens), and body copy should sit on clean Night, not on blinking dots.
 */
function crowdVisibility(x: number, y: number, width: number, height: number): number {
  const narrow = width < NARROW
  const underText = narrow ? y > height * 0.55 : x < width * 0.48 && y > height * 0.52
  return underText ? 0.25 : 1
}

function draw(
  context: CanvasRenderingContext2D,
  swarm: Swarm,
  frame: StoryFrame,
  width: number,
  height: number,
  time: number,
) {
  context.clearRect(0, 0, width, height)

  // The crowd dims a little once the pod lights up, so the eye goes to the pod.
  const crowdLevel = 1 - 0.4 * frame.lit
  for (const firefly of swarm.ambient) {
    const x = firefly.x * width
    const y = firefly.y * height
    const alpha =
      (0.14 + 0.8 * flash(firefly.phase, 5)) * crowdLevel * crowdVisibility(x, y, width, height)
    dot(context, x, y, firefly.size * 1.5, CROWD, alpha)
  }

  const layout = podLayout(width, height)
  const formed = frame.gather * frame.lit

  // A hairline round the gathered pod: these five are a group now.
  if (formed > 0.01) {
    context.strokeStyle = rgba(MUTED, 0.35 * formed)
    context.lineWidth = 1
    context.beginPath()
    context.arc(layout.centerX, layout.centerY, layout.radius * 1.7, 0, Math.PI * 2)
    context.stroke()
    context.font = '500 13px "Host Grotesk", system-ui, sans-serif'
    context.textBaseline = 'middle'
  }

  // Lit pod-mates are solid Glow (any dimmer and Glow over Night turns olive); they flash by
  // swelling, so a pod in step swells together.
  const podDot = clamp(layout.radius * 0.075, 5, 10)
  swarm.pod.forEach((firefly, index) => {
    const { x, y } = podPoint(firefly, frame.gather, layout, time)
    const pulse = flash(firefly.phase, 3)
    const crowdAlpha = 0.14 + 0.8 * flash(firefly.phase, 5)
    // Until it gathers, a pod-mate is one of the crowd, so it dims behind the text like them.
    const inCrowd = lerp(crowdVisibility(x, y, width, height), 1, frame.gather)
    const alpha = lerp(crowdAlpha * inCrowd, 1, frame.lit)
    const radius = lerp(1.6, podDot * (1 + 0.75 * pulse), frame.gather)
    const colour: Rgb = [
      lerp(CROWD[0], GLOW[0], frame.lit),
      lerp(CROWD[1], GLOW[1], frame.lit),
      lerp(CROWD[2], GLOW[2], frame.lit),
    ]
    dot(context, x, y, radius, colour, alpha)
    if (formed > 0.01) {
      // Labels point away from the pod's centre, so none can run into a neighbour's dot.
      const outward = firefly.slotX < -0.1 ? -1 : 1
      context.textAlign = outward < 0 ? 'right' : 'left'
      context.fillStyle = rgba(MUTED, formed)
      context.fillText(POD_NAMES[index] ?? '', x + outward * (podDot * 2 + 6), y)
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
