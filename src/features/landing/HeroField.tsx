import { useEffect, useRef, type RefObject } from 'react'
import {
  advanceCloud,
  answerCall,
  createCloud,
  fireflyGlow,
  placeCloud,
  stirCloud,
  twinkle,
  type Cloud,
  type Point,
} from '../../lib/fireflies/cloud.ts'
import { smoothstep } from '../../lib/fireflies/math.ts'
import {
  advanceMeadow,
  brushMeadow,
  createMeadow,
  fireflyRoom,
  meadowCounts,
  plantCountFor,
  plantShape,
  samplePath,
  type Plant,
  type Rect,
} from '../../lib/fireflies/meadow.ts'
import { flash } from '../../lib/fireflies/sync.ts'
import {
  batchFor,
  drawBatches,
  drawHalos,
  EMBER,
  FAINTEST,
  makeHalos,
  MUTED,
  rgba,
  type Batch,
  type Halos,
} from './canvasLights.ts'

const MAX_PIXEL_RATIO = 2
/** Longest step we simulate, so a backgrounded tab doesn't jump on return. */
const MAX_FRAME_SECONDS = 1 / 20
/** How far a tap carries in the meadow, and how fast the answers spread (px, px/s). */
const CALL = { reach: 180, speed: 260 } as const
/** How long an answer stays visibly bright, either side of its peak (s). */
const ANSWER_SECONDS = 0.7
/** A hand through the meadow eases the fireflies aside, gently (see stirCloud). */
const STIR = { radius: 80, drag: 0.15, push: 110, maxSpeed: 1400 } as const
/** How much a woken firefly brightens on the beat, over its own light. */
const WAKE_LIFT = 0.3
/** Most pointer events kept per frame for the path. */
const PATH_POINTS = 12
/** A firefly's halo radius at depth 0, the extra at depth 1 (px), and the faintest worth one. */
const HALO = { radius: 9, depthRadius: 19, faintest: 0.04 } as const
/** A firefly's light between glows: low, so the meadow is calm, but enough to follow it. */
const EMBERING = 0.14
/** Fade at the meadow's edges (px), so a firefly wandering out dims instead of being cut off. */
const EDGE_FADE = 28
/** The grass, back to front: muted, clearer as it comes forward, never brighter than a firefly. */
const GRASS_ALPHA = [0.16, 0.24, 0.36] as const
interface Call {
  x: number
  y: number
  start: number
}

interface HeroFieldProps {
  /** Draw one still frame instead of animating (reduced motion). */
  still: boolean
  /** The meadow's frame: the plants grow from its floor and the fireflies live inside it. */
  meadow: RefObject<HTMLElement | null>
  seed?: number
}

/**
 * The hero's night meadow: line-drawn grasses swaying in a slow wind, and yellow fireflies
 * floating above them, each glowing and dimming on its own unhurried rhythm. A hand in the meadow
 * brushes the grass aside and eases the fireflies away (both spring back) and wakes them into
 * step with one shared beat; a tap makes the fireflies near it glow back. Decorative, so hidden
 * from assistive technology.
 */
export function HeroField({ still, meadow, seed = 1126 }: HeroFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let width = 0
    let height = 0
    let area: Rect = { left: 0, top: 0, width: 0, height: 0 }
    let frameId = 0
    let lastTime = 0
    let clock = 0
    let visible = true
    let path: Point[] = []
    let hand: Point | null = null
    const calls: Call[] = []

    const measure = () => {
      const box = canvas.getBoundingClientRect()
      width = box.width
      height = box.height
      // The meadow's frame, relative to the canvas; without one the whole field is the meadow.
      const frame = meadow.current?.getBoundingClientRect()
      area = frame
        ? {
            left: frame.left - box.left,
            top: frame.top - box.top,
            width: frame.width,
            height: frame.height,
          }
        : { left: 0, top: 0, width, height }
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    // The swarm and the meadow are made for the first measurement and kept as the field resizes.
    measure()
    const counts = meadowCounts(area.width, area.height)
    const cloud: Cloud = createCloud({
      seed,
      count: counts.dust,
      fireflies: counts.fireflies,
      aspect: area.width / Math.max(1, area.height),
      room: fireflyRoom,
      tone: 0,
    })
    const plants = createMeadow({ seed: seed + 7, count: plantCountFor(area.width) })
    const scene: Scene = {
      context,
      cloud,
      plants,
      batches: new Map(),
      halos: makeHalos(),
      glows: [],
    }
    const place = () => {
      placeCloud(cloud, area)
    }

    const drawStill = () => {
      advanceCloud(cloud, 0, 0)
      place()
      draw(scene, { width, height, area, clock: 0, calls: [] })
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
      advanceCloud(cloud, seconds, clock)
      place()
      if (path.length > 1) stirCloud(cloud, path, seconds, STIR)
      // The whole path since the last frame brushes the grass; a resting hand still holds it.
      if (path.length > 0) brushMeadow(plants, samplePath(path), seconds, area)
      path = hand ? [hand] : []
      advanceMeadow(plants, seconds)
      draw(scene, { width, height, area, clock, calls })
    }

    // The canvas, and the meadow's frame (which resizes as the text beside or below it rewraps).
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    if (meadow.current) observer.observe(meadow.current)
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
    const onCall = (event: PointerEvent) => {
      const { x, y } = pointAt(event)
      answerCall(cloud, x, y, CALL, clock)
      calls.push({ x, y, start: clock })
      if (calls.length > 6) calls.shift()
    }
    const onMove = (event: PointerEvent) => {
      hand = pointAt(event)
      if (path.length < PATH_POINTS) path.push(hand)
      else path[path.length - 1] = hand
    }
    const onLeave = () => {
      hand = null
      path = []
    }
    // Only the meadow listens: the text beside it stays plain text. A still field doesn't listen.
    const target = still ? undefined : meadow.current
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
  }, [still, meadow, seed])

  return <canvas ref={canvasRef} className="field" aria-hidden="true" />
}

interface Scene {
  context: CanvasRenderingContext2D
  cloud: Cloud
  plants: Plant[]
  batches: Map<number, Batch>
  halos: Halos | null
  glows: number[]
}

interface Frame {
  width: number
  height: number
  area: Rect
  clock: number
  calls: Call[]
}

/** How far inside the meadow a point is, 0 at its edge to 1 a little way in. */
function insideMeadow(x: number, y: number, area: Rect): number {
  const edge = Math.min(
    x - area.left,
    area.left + area.width - x,
    y - area.top,
    area.top + area.height - y,
  )
  return smoothstep(edge / EDGE_FADE)
}

function draw(
  { context, cloud, plants, batches, halos, glows }: Scene,
  { width, height, area, clock, calls }: Frame,
) {
  context.clearRect(0, 0, width, height)
  for (const batch of batches.values()) batch.squares.length = 0
  glows.length = 0
  for (const mote of cloud.motes) {
    const x = mote.px
    const y = mote.py
    const woken = mote.awake * flash(mote.phase, 4)
    const answer = Math.max(0, 1 - Math.abs(clock - mote.answerAt) / ANSWER_SECONDS)
    const room = insideMeadow(x, y, area)
    const firefly = mote.kind === 'firefly'
    const lantern = firefly ? fireflyGlow(mote.phase) : 0
    const resting = firefly
      ? EMBERING + (1 - EMBERING) * lantern
      : // Far specks are faint and barely shimmer: depth, not sparkle.
        (0.18 + 0.32 * mote.depth) * (0.7 + 0.3 * twinkle(mote.phase))
    const brightness = Math.max(resting + WAKE_LIFT * woken, answer) * room
    if (brightness < FAINTEST) continue
    const batch = batchFor(batches, mote.tone, firefly, brightness)
    if (firefly) {
      batch.squares.push(x, y, mote.size * (1 + 0.3 * Math.max(lantern, answer, woken)))
      const glow = Math.max(lantern, answer, WAKE_LIFT * woken) * room
      if (glow > HALO.faintest) {
        const halo = (HALO.radius + HALO.depthRadius * mote.depth) * (0.75 + 0.25 * glow)
        glows.push(x, y, halo, 0.8 * glow, mote.tone)
      }
      continue
    }
    batch.squares.push(x - mote.size / 2, y - mote.size / 2, mote.size)
  }

  // The meadow, kept inside its frame.
  context.save()
  context.beginPath()
  context.rect(area.left, area.top, area.width, area.height)
  context.clip()
  // Back and middle grass, then the fireflies' light, then the front grass over it, so the
  // nearest blades pass in front of the glow.
  drawPlants(context, plants, clock, area, (layer) => layer < 2)
  if (halos) drawHalos(context, halos, glows)
  drawBatches(context, batches)
  drawPlants(context, plants, clock, area, (layer) => layer === 2)
  for (const call of calls) {
    const radius = (clock - call.start) * CALL.speed
    if (radius > CALL.reach) continue
    context.strokeStyle = rgba(EMBER, 0.12 * (1 - radius / CALL.reach))
    context.lineWidth = 1
    context.beginPath()
    context.arc(call.x, call.y, radius, 0, Math.PI * 2)
    context.stroke()
  }
  context.restore()
}

/** Draws the plants whose layer passes `which`, each layer in one fill. */
function drawPlants(
  context: CanvasRenderingContext2D,
  plants: Plant[],
  clock: number,
  area: Rect,
  which: (layer: number) => boolean,
) {
  for (const layer of [0, 1, 2] as const) {
    if (!which(layer)) continue
    context.fillStyle = rgba(MUTED, GRASS_ALPHA[layer])
    context.strokeStyle = rgba(MUTED, GRASS_ALPHA[layer])
    context.lineWidth = 1
    context.beginPath()
    for (const plant of plants) {
      if (plant.layer !== layer) continue
      const shape = plantShape(plant, clock, area)
      if (plant.kind === 'blade') {
        // A tapered blade: two curves from either side of its base meeting at the tip.
        const half = plant.width / 2
        context.moveTo(shape.baseX - half, shape.baseY)
        context.quadraticCurveTo(
          shape.controlX - half * 0.5,
          shape.controlY,
          shape.tipX,
          shape.tipY,
        )
        context.quadraticCurveTo(
          shape.controlX + half * 0.5,
          shape.controlY,
          shape.baseX + half,
          shape.baseY,
        )
        context.closePath()
        continue
      }
      // A seed stem: its seeds, flat dots clustered along the top of the hairline.
      for (const seed of plant.seeds) {
        const t = seed.along
        const sx =
          (1 - t) ** 2 * shape.baseX + 2 * (1 - t) * t * shape.controlX + t * t * shape.tipX
        const sy =
          (1 - t) ** 2 * shape.baseY + 2 * (1 - t) * t * shape.controlY + t * t * shape.tipY
        context.moveTo(sx + seed.side + 1.3, sy)
        context.arc(sx + seed.side, sy, 1.3, 0, Math.PI * 2)
      }
    }
    context.fill()
    // The stems themselves, as hairlines.
    context.beginPath()
    for (const plant of plants) {
      if (plant.layer !== layer || plant.kind !== 'stem') continue
      const shape = plantShape(plant, clock, area)
      context.moveTo(shape.baseX, shape.baseY)
      context.quadraticCurveTo(shape.controlX, shape.controlY, shape.tipX, shape.tipY)
    }
    context.stroke()
  }
}
