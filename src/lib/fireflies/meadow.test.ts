import { describe, expect, it } from 'vitest'
import {
  advanceMeadow,
  brushMeadow,
  createMeadow,
  fireflyRoom,
  meadowCounts,
  plantCountFor,
  plantShape,
  samplePath,
  windBend,
  type Plant,
} from './meadow.ts'

const rect = { left: 100, top: 50, width: 400, height: 300 }

/** One plant, upright and still, at the given place and height, for exact geometry. */
function plant(overrides: Partial<Plant> = {}): Plant {
  return {
    x: 0.5,
    height: 0.5,
    width: 2,
    lean: 0,
    sway: 0,
    phase: 0,
    layer: 1,
    kind: 'blade',
    seeds: [],
    push: 0,
    pushVelocity: 0,
    ...overrides,
  }
}

describe('createMeadow', () => {
  it('grows the plants asked for, back layer first', () => {
    const plants = createMeadow({ seed: 3, count: 200 })
    expect(plants).toHaveLength(200)
    const layers = plants.map((one) => one.layer)
    expect(layers).toEqual([...layers].sort((a, b) => a - b))
    expect(new Set(layers)).toEqual(new Set([0, 1, 2]))
  })

  it('is mostly grass, with a few taller seed stems carrying seeds', () => {
    const plants = createMeadow({ seed: 3, count: 400 })
    const stems = plants.filter((one) => one.kind === 'stem')
    expect(stems.length / plants.length).toBeGreaterThan(0.05)
    expect(stems.length / plants.length).toBeLessThan(0.25)
    expect(stems.every((stem) => stem.seeds.length >= 5)).toBe(true)
    expect(
      plants.filter((one) => one.kind === 'blade').every((one) => one.seeds.length === 0),
    ).toBe(true)
  })

  it('grows the front taller than the back, so the meadow recedes', () => {
    const plants = createMeadow({ seed: 3, count: 600 })
    const tallest = (layer: number) =>
      Math.max(...plants.filter((one) => one.layer === layer).map((one) => one.height))
    expect(tallest(2)).toBeGreaterThan(tallest(0))
    expect(Math.max(...plants.map((one) => one.height))).toBeLessThanOrEqual(0.72)
  })

  it('is deterministic for a seed, and empty for no plants', () => {
    expect(createMeadow({ seed: 9, count: 20 })).toEqual(createMeadow({ seed: 9, count: 20 }))
    expect(createMeadow({ seed: 9, count: -1 })).toEqual([])
  })
})

describe('plantCountFor', () => {
  it('fills a phone and caps a wide screen', () => {
    expect(plantCountFor(200)).toBe(80)
    expect(plantCountFor(700)).toBe(200)
    expect(plantCountFor(3000)).toBe(320)
  })
})

describe('windBend', () => {
  it('sways a plant round its lean, a little more one way, as a breeze would', () => {
    const one = plant({ lean: 0.1, sway: 0.05 })
    const bends = Array.from({ length: 90 }, (_, i) => windBend(one, i / 10))
    expect(Math.min(...bends)).toBeCloseTo(0.1 + 0.05 * -0.65, 2)
    expect(Math.max(...bends)).toBeCloseTo(0.1 + 0.05 * 1.35, 2)
  })

  it('travels across the meadow: neighbours far apart sway at different moments', () => {
    const left = plant({ x: 0, sway: 0.05 })
    const right = plant({ x: 0.35, sway: 0.05 })
    expect(windBend(left, 1)).not.toBeCloseTo(windBend(right, 1), 3)
  })
})

describe('plantShape', () => {
  it('grows from the meadow floor, straight up when still', () => {
    const shape = plantShape(plant(), 0, rect)
    // A still plant still has the breeze's resting share of sway: none here (sway 0).
    expect(shape.baseX).toBe(300)
    expect(shape.baseY).toBe(350)
    expect(shape.tipX).toBeCloseTo(300)
    expect(shape.tipY).toBeCloseTo(200)
    expect(shape.controlY).toBeCloseTo(260)
  })

  it('dips its tip as it bends, keeping roughly its length', () => {
    const upright = plantShape(plant(), 0, rect)
    const pushed = plantShape(plant({ push: 60 }), 0, rect)
    expect(pushed.tipX).toBeCloseTo(360)
    expect(pushed.tipY).toBeGreaterThan(upright.tipY)
    expect(plantShape(plant({ push: 1000 }), 0, rect).tipY).toBe(350)
  })
})

describe('brushMeadow', () => {
  it('bends plants away from a hand passing their upper part, nearest most', () => {
    const near = plant({ x: 0.5 })
    const further = plant({ x: 0.6 })
    const far = plant({ x: 0.95 })
    // A hand just left of the first plant, two-thirds of the way up it.
    const touched = brushMeadow([near, further, far], [{ x: 290, y: 250 }], 1 / 60, rect)
    expect(touched).toBe(2)
    expect(near.push).toBeGreaterThan(further.push)
    expect(further.push).toBeGreaterThan(0)
    expect(far.push).toBe(0)
  })

  it('bends a plant left when the hand is to its right', () => {
    const one = plant()
    brushMeadow([one], [{ x: 320, y: 250 }], 1 / 60, rect)
    expect(one.push).toBeLessThan(0)
  })

  it('leaves the roots and the air above alone', () => {
    const one = plant()
    expect(brushMeadow([one], [{ x: 300, y: 340 }], 1 / 60, rect)).toBe(0)
    expect(brushMeadow([one], [{ x: 300, y: 60 }], 1 / 60, rect)).toBe(0)
    expect(brushMeadow([one], [{ x: 300, y: 250 }], 0, rect)).toBe(0)
    expect(one.push).toBe(0)
  })

  it('never pulls a plant bent further the same way back towards the hand', () => {
    const one = plant({ push: 80 })
    brushMeadow([one], [{ x: 290, y: 250 }], 1 / 60, rect)
    expect(one.push).toBe(80)
  })

  it('bends a plant the hand crosses over to its other side', () => {
    const one = plant({ push: 20 })
    brushMeadow([one], [{ x: 310, y: 250 }], 1 / 60, rect)
    expect(one.push).toBeLessThan(20)
  })
})

describe('a sweep across the meadow', () => {
  it('samples a path finely, so no plant it crossed is skipped', () => {
    const points = samplePath([
      { x: 0, y: 0 },
      { x: 120, y: 0 },
    ])
    expect(points[0]).toEqual({ x: 0, y: 0 })
    expect(points.at(-1)).toEqual({ x: 120, y: 0 })
    expect(points).toHaveLength(11)
    expect(samplePath([{ x: 5, y: 5 }])).toEqual([{ x: 5, y: 5 }])
    expect(samplePath([])).toEqual([])
  })

  it('bends every plant along a fast sweep, each away from the nearest point', () => {
    const plants = [0.2, 0.4, 0.6, 0.8].map((x) => plant({ x }))
    // From left of the first plant to right of the last, in one frame.
    const sweep = samplePath([
      { x: 150, y: 250 },
      { x: 450, y: 250 },
    ])
    expect(brushMeadow(plants, sweep, 1 / 60, rect)).toBe(4)
    expect(plants.every((one) => one.push !== 0)).toBe(true)
  })
})

describe('advanceMeadow', () => {
  it('springs a brushed plant back upright, and rests it exactly', () => {
    const one = plant({ push: 40 })
    const still = plant()
    let crossed = false
    for (let t = 0; t < 4; t += 1 / 60) {
      advanceMeadow([one, still], 1 / 60)
      if (one.push < 0) crossed = true
    }
    // A little sway past upright as it settles, then rest.
    expect(crossed).toBe(true)
    expect(one.push).toBe(0)
    expect(one.pushVelocity).toBe(0)
    expect(still.push).toBe(0)
  })
})

describe('fireflyRoom', () => {
  it('keeps fireflies out of the very top and the roots, most around the grass tips', () => {
    expect(fireflyRoom(0.02)).toBe(0)
    expect(fireflyRoom(0.6)).toBe(1)
    expect(fireflyRoom(0.99)).toBe(0)
    expect(fireflyRoom(0.2)).toBeGreaterThan(0)
    expect(fireflyRoom(0.2)).toBeLessThan(1)
  })
})

describe('meadowCounts', () => {
  it('keeps the meadow calm: few fireflies, a little distant dust', () => {
    expect(meadowCounts(360, 300)).toEqual({ fireflies: 30, dust: 72 })
    expect(meadowCounts(760, 830)).toEqual({ fireflies: 90, dust: 380 })
  })
})
