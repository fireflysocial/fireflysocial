import { describe, expect, it } from 'vitest'
import {
  BEAT_SECONDS,
  NARROW,
  TONE_COUNT,
  advanceCloud,
  answerCall,
  beatPhase,
  cloudCountFor,
  createCloud,
  pickTone,
  placeCloud,
  stirCloud,
  podClearance,
  textClearance,
  twinkle,
  type Cloud,
  type Mote,
} from './cloud.ts'
import { orderParameter } from './sync.ts'

const size = { width: 400, height: 400 }

/** A one-off cloud with motes at exact pixel points, for interaction tests. */
function cloudAt(points: [number, number][]): Cloud {
  const cloud = createCloud({ seed: 1, count: points.length, aspect: 1 })
  cloud.motes.forEach((mote, index) => {
    const [x, y] = points[index] ?? [0, 0]
    mote.x = x / size.width
    mote.y = y / size.height
  })
  placeCloud(cloud, { ...size, mark: null, gather: 0 })
  return cloud
}

function only(cloud: Cloud): Mote {
  const [mote] = cloud.motes
  if (!mote) throw new Error('expected a mote')
  return mote
}

/** Runs the cloud for `seconds` in small steps, with no drift (aspect 1, flow still applies). */
function settle(cloud: Cloud, seconds: number, start = 0) {
  for (let t = 0; t < seconds; t += 1 / 60) advanceCloud(cloud, 1 / 60, start + t, 1)
}

describe('createCloud', () => {
  it('makes the requested number of motes, all inside the field', () => {
    const { motes } = createCloud({ seed: 3, count: 800, aspect: 1.6 })
    expect(motes).toHaveLength(800)
    for (const mote of motes) {
      expect(mote.x).toBeGreaterThanOrEqual(0)
      expect(mote.x).toBeLessThan(1)
      expect(mote.y).toBeGreaterThanOrEqual(0)
      expect(mote.y).toBeLessThan(1)
    }
  })

  it('is deterministic for a seed', () => {
    const a = createCloud({ seed: 9, count: 50, aspect: 1 }).motes
    const b = createCloud({ seed: 9, count: 50, aspect: 1 }).motes
    expect(a).toEqual(b)
  })

  it('gathers where there is room, and stays thin where there is not', () => {
    const { motes } = createCloud({
      seed: 12,
      count: 2000,
      aspect: 0.5,
      room: (y) => (y < 0.5 ? 1 : 0.05),
    })
    const upper = motes.filter((mote) => mote.y < 0.5).length
    expect(upper).toBeGreaterThan(motes.length * 0.85)
  })

  it('treats a negative count as an empty cloud', () => {
    expect(createCloud({ seed: 1, count: -4, aspect: 1 }).motes).toHaveLength(0)
  })

  it('clumps: some regions are far denser than others', () => {
    const { motes } = createCloud({ seed: 11, count: 3000, aspect: 1 })
    const cells = new Array<number>(64).fill(0)
    for (const mote of motes) {
      const cell = Math.floor(mote.x * 8) + 8 * Math.floor(mote.y * 8)
      cells[cell] = (cells[cell] ?? 0) + 1
    }
    // An even scatter would put ~47 in every cell; clumps and voids spread that wide.
    expect(Math.max(...cells)).toBeGreaterThan(2 * Math.min(...cells) + 40)
  })

  it('clumps on a tall phone field too, not just a wide one', () => {
    const { motes } = createCloud({ seed: 13, count: 3000, aspect: 0.46 })
    // A 4 x 8 grid over the tall field: an even sprinkle would put ~94 in every cell.
    const cells = new Array<number>(32).fill(0)
    for (const mote of motes) {
      const cell = Math.floor(mote.x * 4) + 4 * Math.floor(mote.y * 8)
      cells[cell] = (cells[cell] ?? 0) + 1
    }
    // Dense cores and near-empty voids, side by side.
    expect(Math.max(...cells)).toBeGreaterThan(5 * Math.min(...cells))
  })

  it('uses all three tones, mostly Glow and Dusk', () => {
    const { motes } = createCloud({ seed: 2, count: 2000, aspect: 1 })
    const counts = new Array<number>(TONE_COUNT).fill(0)
    for (const mote of motes) counts[mote.tone] = (counts[mote.tone] ?? 0) + 1
    const [glow = 0, dusk = 0, ember = 0] = counts
    expect(glow).toBeGreaterThan(ember)
    expect(dusk).toBeGreaterThan(ember)
    expect(ember).toBeGreaterThan(0)
  })
})

describe('pickTone', () => {
  it('makes about a sixth warm white', () => {
    expect(pickTone(0.15, 0.5)).toBe(2)
    expect(pickTone(0.17, 1)).toBe(1)
  })

  it('leans violet where the field leans violet, and yellow where it does not', () => {
    expect(pickTone(0.5, 1)).toBe(1)
    expect(pickTone(0.5, 0)).toBe(0)
  })

  it('clamps the lean', () => {
    expect(pickTone(0.5, 7)).toBe(pickTone(0.5, 1))
    expect(pickTone(0.5, -7)).toBe(pickTone(0.5, 0))
  })
})

describe('cloudCountFor', () => {
  it('keeps phones lighter and caps large screens', () => {
    expect(cloudCountFor(360, 400)).toBe(3000)
    expect(cloudCountFor(700, 450)).toBe(4500)
    expect(cloudCountFor(2560, 1440)).toBe(11000)
  })
})

describe('advanceCloud', () => {
  it('keeps every mote inside the field as the cloud drifts', () => {
    const cloud = createCloud({ seed: 4, count: 300, aspect: 1.5 })
    for (let i = 0; i < 400; i++) advanceCloud(cloud, 1 / 10, i / 10, 1.5)
    for (const mote of cloud.motes) {
      expect(mote.x).toBeGreaterThanOrEqual(0)
      expect(mote.x).toBeLessThan(1)
      expect(mote.y).toBeGreaterThanOrEqual(0)
      expect(mote.y).toBeLessThan(1)
    }
  })

  it('drifts slowly and smoothly, like smoke', () => {
    const cloud = createCloud({ seed: 5, count: 200, aspect: 1 })
    const before = cloud.motes.map((mote) => [mote.x, mote.y] as const)
    advanceCloud(cloud, 1, 0, 1)
    // Distance on a field that wraps at its edges: leaving one side means arriving at the other.
    const wrapped = (d: number) => Math.min(Math.abs(d), 1 - Math.abs(d))
    const moved = cloud.motes.map((mote, index) => {
      const [x = 0, y = 0] = before[index] ?? []
      return Math.hypot(wrapped(mote.x - x), wrapped(mote.y - y))
    })
    expect(Math.max(...moved)).toBeLessThan(0.1)
    expect(moved.some((distance) => distance > 0.001)).toBe(true)
  })

  it('advances each twinkle by its own rhythm', () => {
    const cloud = createCloud({ seed: 6, count: 1, aspect: 1 })
    const [mote] = cloud.motes
    if (!mote) throw new Error('expected a mote')
    mote.phase = 0
    advanceCloud(cloud, 0.1, 0, 1)
    expect(mote.phase).toBeCloseTo(mote.omega * 0.1)
  })
})

describe('stirCloud', () => {
  const options = { radius: 100, drag: 0.5, push: 100, maxSpeed: 1000 }

  it('sweeps nearby lights along with the hand, and leaves far ones alone', () => {
    const cloud = cloudAt([
      [200, 220],
      [390, 390],
    ])
    const path = [
      { x: 180, y: 200 },
      { x: 220, y: 200 },
    ]
    expect(stirCloud(cloud, path, 0.1, options)).toBe(1)
    const [near, far] = cloud.motes
    // Moving right with the hand, and down, out of its way.
    expect(near?.vx).toBeGreaterThan(0)
    expect(near?.vy).toBeGreaterThan(0)
    expect(near?.awake).toBeGreaterThan(0.5)
    expect(far?.vx).toBe(0)
    expect(far?.awake).toBe(0)
  })

  it('reaches every light along the whole path, not just its end', () => {
    // A fast move from one side to the other: the light it passed in the middle is stirred.
    const cloud = cloudAt([[200, 200]])
    const path = [
      { x: 0, y: 205 },
      { x: 400, y: 205 },
    ]
    expect(stirCloud(cloud, path, 1 / 60, options)).toBe(1)
  })

  it('follows a curved path segment by segment', () => {
    const cloud = cloudAt([
      [100, 110],
      [210, 300],
    ])
    const path = [
      { x: 0, y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 300 },
    ]
    expect(stirCloud(cloud, path, 0.1, options)).toBe(2)
    const [first, second] = cloud.motes
    // Each light moves the way the hand was going where it passed: right, then down.
    expect(first?.vx).toBeGreaterThan(Math.abs(first?.vy ?? 0))
    expect(second?.vy).toBeGreaterThan(0)
  })

  it('caps the hand’s speed, so a flick cannot fling the cloud', () => {
    const cloud = cloudAt([[200, 200]])
    stirCloud(
      cloud,
      [
        { x: 190, y: 200 },
        { x: 210, y: 200 },
      ],
      0.0001,
      options,
    )
    expect(only(cloud).vx).toBeLessThanOrEqual(options.maxSpeed * options.drag)
  })

  it('eases towards a bounded speed, so a lingering hand cannot pile lights up', () => {
    const cloud = cloudAt([[210, 200]])
    const path = [
      { x: 200, y: 200 },
      { x: 200.5, y: 200 },
    ]
    for (let i = 0; i < 200; i++) stirCloud(cloud, path, 1 / 60, options)
    expect(Math.hypot(only(cloud).vx, only(cloud).vy)).toBeLessThan(options.push + 20)
  })

  it('wakes a light right under a hand that has only just arrived, without pushing it', () => {
    const cloud = cloudAt([[200, 200]])
    expect(stirCloud(cloud, [{ x: 200, y: 200 }], 0.1, options)).toBe(1)
    expect(only(cloud).vx).toBe(0)
    expect(only(cloud).awake).toBe(1)
  })

  it('parts lights right on the path to alternate sides instead of carrying them along', () => {
    const cloud = cloudAt([
      [200, 200],
      [200, 200],
    ])
    stirCloud(
      cloud,
      [
        { x: 150, y: 200 },
        { x: 250, y: 200 },
      ],
      0.1,
      options,
    )
    const [a, b] = cloud.motes
    expect(Math.sign(a?.vy ?? 0)).toBe(-Math.sign(b?.vy ?? 0))
    expect(Math.abs(a?.vy ?? 0)).toBeGreaterThan(10)
  })

  it('pushes outward less for a slow hand, so lingering cannot dig a hole', () => {
    const outwardAt = (dt: number) => {
      const cloud = cloudAt([[200, 240]])
      stirCloud(
        cloud,
        [
          { x: 190, y: 200 },
          { x: 210, y: 200 },
        ],
        dt,
        { ...options, drag: 0 },
      )
      return only(cloud).vy
    }
    // The same 20px move, over a second (slow) and over a 60th of a second (fast).
    expect(outwardAt(1)).toBeLessThan(outwardAt(1 / 60) / 5)
    expect(outwardAt(1)).toBeGreaterThan(0)
  })

  it('pushes a light that is already far from home less', () => {
    const pushed = (dx: number) => {
      const cloud = cloudAt([[200, 240]])
      only(cloud).dx = dx
      stirCloud(
        cloud,
        [
          { x: 150, y: 200 },
          { x: 250, y: 200 },
        ],
        1 / 60,
        { ...options, drag: 0 },
      )
      return only(cloud).vy
    }
    expect(pushed(80)).toBeLessThan(pushed(0) / 3)
    expect(pushed(200)).toBe(0)
  })

  it('eases the same at any frame rate', () => {
    const after = (frames: number) => {
      const cloud = cloudAt([[200, 230]])
      for (let i = 0; i < frames; i++) {
        stirCloud(
          cloud,
          [
            { x: 200 - 600 / frames / 60, y: 200 },
            { x: 200, y: 200 },
          ],
          1 / 60 / frames,
          options,
        )
      }
      return only(cloud).vx
    }
    // Two 120Hz frames come to the same speed as one 60Hz frame covering the same time.
    expect(after(2)).toBeCloseTo(after(1), 0)
  })

  it('wakes lights across most of its reach, not just on the line', () => {
    const cloud = cloudAt([
      [200, 200],
      [200, 240],
      [200, 280],
    ])
    stirCloud(
      cloud,
      [
        { x: 150, y: 200 },
        { x: 250, y: 200 },
      ],
      0.1,
      options,
    )
    const [on, near, edge] = cloud.motes
    expect(on?.awake).toBe(1)
    expect(near?.awake).toBe(1)
    expect(edge?.awake).toBeGreaterThan(0)
    expect(edge?.awake).toBeLessThan(1)
  })

  it('copes with two events at the same spot in a path', () => {
    const cloud = cloudAt([[200, 230]])
    const path = [
      { x: 150, y: 200 },
      { x: 200, y: 200 },
      { x: 200, y: 200 },
    ]
    expect(stirCloud(cloud, path, 1 / 60, options)).toBe(1)
    expect(Number.isFinite(only(cloud).vx)).toBe(true)
    expect(only(cloud).vx).toBeGreaterThan(0)
  })

  it('does nothing without a path, or without time', () => {
    const cloud = cloudAt([[200, 200]])
    expect(stirCloud(cloud, [], 0.1, options)).toBe(0)
    expect(
      stirCloud(
        cloud,
        [
          { x: 150, y: 200 },
          { x: 250, y: 200 },
        ],
        0,
        options,
      ),
    ).toBe(0)
    expect(only(cloud).vx).toBe(0)
  })
})

describe('the spring home', () => {
  it('brings a pushed light back home, so the cloud heals instead of scarring', () => {
    const cloud = cloudAt([[200, 200]])
    const mote = only(cloud)
    mote.vx = 800
    settle(cloud, 0.15)
    expect(mote.dx).toBeGreaterThan(20)
    settle(cloud, 4, 0.15)
    expect(mote.dx).toBe(0)
    expect(mote.dy).toBe(0)
    expect(mote.vx).toBe(0)
  })

  it('carries a light a bounded distance however fast it was pushed', () => {
    const cloud = cloudAt([[200, 200]])
    const mote = only(cloud)
    mote.vx = 500
    let furthest = 0
    for (let t = 0; t < 2; t += 1 / 60) {
      advanceCloud(cloud, 1 / 60, t, 1)
      furthest = Math.max(furthest, mote.dx)
    }
    expect(furthest).toBeLessThan(150)
  })
})

describe('falling into step', () => {
  it('pulls woken lights into step with the beat, then lets them drift apart', () => {
    const cloud = createCloud({ seed: 21, count: 60, aspect: 1 })
    const beatOffset = (time: number) =>
      orderParameter(cloud.motes.map((mote) => mote.phase - beatPhase(time)))
    const before = beatOffset(0)
    for (const mote of cloud.motes) mote.awake = 1
    // Keep them awake for a while, as a hand lingering would.
    for (let t = 0; t < 2; t += 1 / 60) {
      advanceCloud(cloud, 1 / 60, t, 1)
      for (const mote of cloud.motes) mote.awake = 1
    }
    expect(before).toBeLessThan(0.5)
    expect(beatOffset(2)).toBeGreaterThan(0.95)
    // Left alone, they fall asleep and wander back to their own rhythms.
    settle(cloud, 20, 2)
    expect(cloud.motes.every((mote) => mote.awake === 0)).toBe(true)
    expect(beatOffset(22)).toBeLessThan(0.8)
  })

  it('beats once every BEAT_SECONDS, flashing at the start of each', () => {
    expect(beatPhase(0)).toBe(0)
    expect(beatPhase(BEAT_SECONDS / 2)).toBeCloseTo(Math.PI)
    expect(beatPhase(BEAT_SECONDS * 3)).toBeCloseTo(0)
  })
})

describe('the mark’s lights', () => {
  const mark = { centerX: 200, centerY: 150, size: 200 }

  it('adds the requested lights, each with its place in the mark', () => {
    const { motes } = createCloud({ seed: 5, count: 100, aspect: 1, markCount: 300 })
    const lights = motes.filter((mote) => mote.slot !== null)
    expect(motes).toHaveLength(400)
    expect(lights).toHaveLength(300)
    // They wait in the open upper band before gathering.
    expect(lights.every((mote) => mote.y < 0.31)).toBe(true)
  })

  it('paints the tail in Glow, keeping the beat together, and the wings in Dusk and Ember', () => {
    const { motes } = createCloud({ seed: 5, count: 0, aspect: 1, markCount: 400 })
    const tail = motes.filter((mote) => mote.slot?.tail === true)
    const wings = motes.filter((mote) => mote.slot?.tail === false)
    expect(tail.length).toBeGreaterThan(20)
    expect(tail.every((mote) => mote.tone === 0 && mote.phase === 0)).toBe(true)
    expect(tail.every((mote) => mote.omega === (2 * Math.PI) / BEAT_SECONDS)).toBe(true)
    expect(new Set(wings.map((mote) => mote.tone))).toEqual(new Set([1, 2]))
  })

  it('stays where the mark is instead of drifting with the crowd', () => {
    const cloud = createCloud({ seed: 5, count: 0, aspect: 1, markCount: 20 })
    const homes = cloud.motes.map((mote) => [mote.x, mote.y])
    settle(cloud, 1)
    expect(cloud.motes.map((mote) => [mote.x, mote.y])).toEqual(homes)
  })

  it('moves from the crowd into its place in the mark as the mark gathers', () => {
    const cloud = createCloud({ seed: 5, count: 0, aspect: 1, markCount: 50 })
    placeCloud(cloud, { ...size, mark, gather: 0 })
    for (const mote of cloud.motes) {
      expect(mote.px).toBeCloseTo(mote.x * size.width)
      expect(mote.py).toBeCloseTo(mote.y * size.height)
    }
    placeCloud(cloud, { ...size, mark, gather: 1 })
    for (const mote of cloud.motes) {
      const slot = mote.slot
      if (!slot) throw new Error('expected a mark light')
      // In its place, give or take the one-pixel shimmer.
      expect(Math.abs(mote.px - (mark.centerX + slot.x * mark.size))).toBeLessThanOrEqual(0.81)
      expect(Math.abs(mote.py - (mark.centerY + slot.y * mark.size))).toBeLessThanOrEqual(0.81)
    }
  })

  it('stays in the crowd in a field without the mark', () => {
    const cloud = createCloud({ seed: 5, count: 0, aspect: 1, markCount: 5 })
    placeCloud(cloud, { ...size, mark: null, gather: 1 })
    expect(only(cloud).px).toBeCloseTo(only(cloud).x * size.width)
  })

  it('draws a light at home plus its offset', () => {
    const cloud = cloudAt([[100, 100]])
    only(cloud).dx = 12
    only(cloud).dy = -5
    placeCloud(cloud, { ...size, mark: null, gather: 0 })
    expect(only(cloud).px).toBeCloseTo(112)
    expect(only(cloud).py).toBeCloseTo(95)
  })
})

describe('answerCall', () => {
  const options = { reach: 100, speed: 200 }

  it('makes motes within reach answer, nearest first, on the caller’s clock', () => {
    const cloud = cloudAt([
      [200, 200],
      [260, 200],
      [390, 390],
    ])
    expect(answerCall(cloud, 200, 200, options, 10)).toBe(2)
    const [near, far, outside] = cloud.motes
    expect(near?.answerAt).toBeCloseTo(10)
    expect(far?.answerAt).toBeCloseTo(10 + 60 / options.speed)
    expect(outside?.answerAt).toBe(Number.NEGATIVE_INFINITY)
  })

  it('answers on a clock starting at zero by default', () => {
    const cloud = cloudAt([[200, 200]])
    answerCall(cloud, 200, 200, options)
    expect(cloud.motes[0]?.answerAt).toBeCloseTo(0)
  })
})

describe('textClearance', () => {
  it('is full brightness at the top of the field', () => {
    expect(textClearance(0, 1280, 800)).toBe(1)
  })

  it('thins the cloud behind the text across the lower band', () => {
    expect(textClearance(700, 1280, 800)).toBeCloseTo(0.06)
  })

  it('fades to nothing at the bottom edge, so the field has no hard line', () => {
    expect(textClearance(800, 1280, 800)).toBe(0)
    expect(textClearance(780, 1280, 800)).toBeGreaterThan(0)
  })

  it('starts thinning higher on narrow screens, where text runs taller', () => {
    expect(textClearance(0.46 * 760, NARROW - 1, 760)).toBeLessThan(1)
    expect(textClearance(0.46 * 800, 1280, 800)).toBe(1)
  })
})

describe('twinkle', () => {
  it('stays within [0, 1]', () => {
    for (let phase = -10; phase < 10; phase += 0.13) {
      expect(twinkle(phase)).toBeGreaterThanOrEqual(0)
      expect(twinkle(phase)).toBeLessThanOrEqual(1)
    }
  })

  it('sparks to full brightness once per cycle', () => {
    expect(twinkle(0)).toBeCloseTo(1)
    expect(twinkle(Math.PI)).toBeCloseTo(0.62)
  })
})

describe('podClearance', () => {
  it('leaves the cloud alone before the pod forms', () => {
    expect(podClearance(0, 100, 0)).toBe(1)
  })

  it('clears the cloud inside a formed pod’s ring, with a soft edge outside it', () => {
    expect(podClearance(50, 100, 1)).toBeCloseTo(0.08)
    expect(podClearance(115, 100, 1)).toBeGreaterThan(0.08)
    expect(podClearance(115, 100, 1)).toBeLessThan(1)
    expect(podClearance(200, 100, 1)).toBe(1)
  })

  it('clears in proportion as the pod forms', () => {
    expect(podClearance(50, 100, 0.5)).toBeCloseTo(0.54)
  })
})
