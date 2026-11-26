import { describe, expect, it } from 'vitest'
import { orderParameter } from './sync.ts'
import { POD_SIZE, advanceSwarm, createSwarm, podPoint } from './swarm.ts'

const layout = { width: 400, height: 800, centerX: 200, centerY: 300, radius: 50 }

describe('createSwarm', () => {
  it('creates one pod of five', () => {
    expect(createSwarm({ seed: 1 }).pod).toHaveLength(POD_SIZE)
  })

  it('is deterministic for a seed', () => {
    expect(createSwarm({ seed: 9 })).toEqual(createSwarm({ seed: 9 }))
  })

  it('seats the pod in an evenly spaced ring', () => {
    const { pod } = createSwarm({ seed: 8 })
    for (const firefly of pod) expect(Math.hypot(firefly.slotX, firefly.slotY)).toBeCloseTo(1)
    const [first, second] = pod
    if (!first || !second) throw new Error('expected a pod')
    // Neighbours are a fifth of a turn apart: 2·sin(36°) apart on a unit ring.
    expect(Math.hypot(first.slotX - second.slotX, first.slotY - second.slotY)).toBeCloseTo(
      2 * Math.sin(Math.PI / 5),
    )
  })

  it('starts the pod out of step', () => {
    const swarm = createSwarm({ seed: 5 })
    expect(orderParameter(swarm.pod.map((f) => f.phase))).toBeLessThan(0.5)
  })
})

describe('advanceSwarm', () => {
  it('syncs the pod when coupled', () => {
    const swarm = createSwarm({ seed: 3 })
    for (let i = 0; i < 360; i++) advanceSwarm(swarm, 1 / 60, 2.4)
    expect(orderParameter(swarm.pod.map((f) => f.phase))).toBeGreaterThan(0.95)
  })
})

describe('podPoint', () => {
  const swarm = createSwarm({ seed: 6 })
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
