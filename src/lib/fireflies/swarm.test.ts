import { describe, expect, it } from 'vitest'
import { orderParameter } from './sync.ts'
import {
  POD_SIZE,
  advanceSwarm,
  ambientCountFor,
  answerCall,
  createSwarm,
  podPoint,
} from './swarm.ts'

const layout = { width: 400, height: 800, centerX: 200, centerY: 300, radius: 50 }

describe('createSwarm', () => {
  it('creates the requested crowd and one pod', () => {
    const swarm = createSwarm({ seed: 1, ambientCount: 120 })
    expect(swarm.ambient).toHaveLength(120)
    expect(swarm.pod).toHaveLength(POD_SIZE)
  })

  it('is deterministic for a seed', () => {
    expect(createSwarm({ seed: 9, ambientCount: 10 })).toEqual(
      createSwarm({ seed: 9, ambientCount: 10 }),
    )
  })

  it('treats a negative count as an empty crowd', () => {
    expect(createSwarm({ seed: 1, ambientCount: -5 }).ambient).toHaveLength(0)
  })

  it('places everyone inside the field', () => {
    const swarm = createSwarm({ seed: 4, ambientCount: 200 })
    for (const firefly of swarm.ambient) {
      expect(firefly.x).toBeGreaterThanOrEqual(0)
      expect(firefly.x).toBeLessThan(1)
      expect(firefly.y).toBeGreaterThanOrEqual(0)
      expect(firefly.y).toBeLessThan(1)
    }
  })

  it('seats the pod in an evenly spaced ring', () => {
    const { pod } = createSwarm({ seed: 8, ambientCount: 0 })
    for (const firefly of pod) expect(Math.hypot(firefly.slotX, firefly.slotY)).toBeCloseTo(1)
    const [first, second] = pod
    if (!first || !second) throw new Error('expected a pod')
    // Neighbours are a fifth of a turn apart: 2·sin(36°) apart on a unit ring.
    expect(Math.hypot(first.slotX - second.slotX, first.slotY - second.slotY)).toBeCloseTo(
      2 * Math.sin(Math.PI / 5),
    )
  })

  it('starts the pod out of step', () => {
    const swarm = createSwarm({ seed: 5, ambientCount: 0 })
    expect(orderParameter(swarm.pod.map((f) => f.phase))).toBeLessThan(0.5)
  })
})

describe('ambientCountFor', () => {
  it('keeps phones light and caps large screens', () => {
    expect(ambientCountFor(360, 640)).toBe(90)
    expect(ambientCountFor(800, 600)).toBe(185)
    expect(ambientCountFor(2560, 1440)).toBe(380)
  })
})

describe('advanceSwarm', () => {
  it('keeps the crowd inside the field as it drifts', () => {
    const swarm = createSwarm({ seed: 2, ambientCount: 100 })
    for (let i = 0; i < 600; i++) advanceSwarm(swarm, 1 / 10, 0)
    for (const firefly of swarm.ambient) {
      expect(firefly.x).toBeGreaterThanOrEqual(0)
      expect(firefly.x).toBeLessThan(1)
      expect(firefly.y).toBeGreaterThanOrEqual(0)
      expect(firefly.y).toBeLessThan(1)
    }
  })

  it('syncs the pod when coupled', () => {
    const swarm = createSwarm({ seed: 3, ambientCount: 0 })
    for (let i = 0; i < 360; i++) advanceSwarm(swarm, 1 / 60, 2.4)
    expect(orderParameter(swarm.pod.map((f) => f.phase))).toBeGreaterThan(0.95)
  })
})

describe('answerCall', () => {
  const size = { width: 400, height: 400 }
  const options = { reach: 100, speed: 200 }

  function crowdAt(points: [number, number][]) {
    const swarm = createSwarm({ seed: 1, ambientCount: points.length })
    swarm.ambient.forEach((firefly, index) => {
      const [x, y] = points[index] ?? [0, 0]
      firefly.x = x / size.width
      firefly.y = y / size.height
      firefly.phase = 2
    })
    return swarm
  }

  it('makes fireflies within reach answer, and leaves the rest alone', () => {
    const swarm = crowdAt([
      [200, 200],
      [250, 200],
      [390, 390],
    ])
    expect(answerCall(swarm, 200, 200, size.width, size.height, options)).toBe(2)
    expect(swarm.ambient[2]?.phase).toBe(2)
  })

  it('flashes the nearest first, so the answer ripples outward', () => {
    const swarm = crowdAt([
      [200, 200],
      [260, 200],
    ])
    answerCall(swarm, 200, 200, size.width, size.height, options)
    const [near, far] = swarm.ambient
    if (!near || !far) throw new Error('expected two fireflies')
    // Seconds until each flash peaks (phase reaches a full cycle).
    const untilFlash = (f: { phase: number; omega: number }) =>
      (f.phase === 0 ? 0 : 2 * Math.PI - f.phase) / f.omega
    expect(untilFlash(near)).toBeCloseTo(0)
    expect(untilFlash(far)).toBeCloseTo(60 / options.speed)
  })

  it('records when each firefly answers, on the caller’s clock', () => {
    const swarm = crowdAt([
      [200, 200],
      [260, 200],
      [390, 390],
    ])
    answerCall(swarm, 200, 200, size.width, size.height, options, 10)
    const [near, far, outside] = swarm.ambient
    expect(near?.answerAt).toBeCloseTo(10)
    expect(far?.answerAt).toBeCloseTo(10 + 60 / options.speed)
    expect(outside?.answerAt).toBe(Number.NEGATIVE_INFINITY)
  })
})

describe('podPoint', () => {
  const swarm = createSwarm({ seed: 6, ambientCount: 0 })
  const firefly = swarm.pod[0]
  if (!firefly) throw new Error('expected a pod')

  it('sits at its crowd position before the pod forms', () => {
    expect(podPoint(firefly, 0, layout, 0)).toEqual({
      x: firefly.startX * layout.width,
      y: firefly.startY * layout.height,
    })
  })

  it('sits near the pod centre once gathered', () => {
    const point = podPoint(firefly, 1, layout, 12.3)
    const distance = Math.hypot(point.x - layout.centerX, point.y - layout.centerY)
    expect(distance).toBeLessThanOrEqual(layout.radius * 1.15)
  })

  it('clamps gather outside 0..1', () => {
    expect(podPoint(firefly, 5, layout, 1)).toEqual(podPoint(firefly, 1, layout, 1))
  })
})
