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
  extendPath,
  fireflyCountFor,
  fireflyGlow,
  pickFireflyTone,
  pickTone,
  placeCloud,
  stirCloud,
  podClearance,
  textClearance,
  twinkle,
  wanderAt,
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
  placeCloud(cloud, size)
  return cloud
}

function only(cloud: Cloud): Mote {
  const [mote] = cloud.motes
  if (!mote) throw new Error('expected a mote')
  return mote
}

/** Runs the cloud for `seconds` in small steps, with no drift (aspect 1, flow still applies). */
function settle(cloud: Cloud, seconds: number, start = 0) {
  for (let t = 0; t < seconds; t += 1 / 60) advanceCloud(cloud, 1 / 60, start + t)
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

  it('gives up after a bounded number of tries when the room leaves nowhere to gather', () => {
    expect(createCloud({ seed: 1, count: 500, aspect: 1, room: () => 0 }).motes).toHaveLength(0)
  })

  it('settles for fewer motes when the room is too tight to fill', () => {
    const { motes } = createCloud({ seed: 1, count: 300, aspect: 1, room: () => 0.001 })
    expect(motes.length).toBeLessThan(300)
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
    expect(cloudCountFor(360, 400)).toBe(1200)
    expect(cloudCountFor(700, 450)).toBe(1313)
    expect(cloudCountFor(2560, 1440)).toBe(5200)
  })
})

describe('fireflyCountFor', () => {
  it('gives every screen enough fireflies to read as a swarm, and caps large ones', () => {
    expect(fireflyCountFor(360, 400)).toBe(140)
    expect(fireflyCountFor(1000, 800)).toBe(471)
    expect(fireflyCountFor(2560, 1440)).toBe(560)
  })
})

describe('advanceCloud', () => {
  it('keeps every mote inside the field as the cloud drifts', () => {
    const cloud = createCloud({ seed: 4, count: 300, aspect: 1.5 })
    for (let i = 0; i < 400; i++) advanceCloud(cloud, 1 / 10, i / 10)
    for (const mote of cloud.motes) {
      expect(mote.x).toBeGreaterThanOrEqual(0)
      expect(mote.x).toBeLessThan(1)
      expect(mote.y).toBeGreaterThanOrEqual(0)
      expect(mote.y).toBeLessThan(1)
    }
  })

  it('wanders each light round its own home, which never moves, so no streaks can form', () => {
    const cloud = createCloud({ seed: 5, count: 200, fireflies: 50, aspect: 1 })
    const homes = cloud.motes.map((mote) => [mote.x, mote.y])
    const wanders: number[] = []
    for (let t = 0; t < 60; t += 0.5) {
      advanceCloud(cloud, 0.5, t)
      for (const mote of cloud.motes) wanders.push(Math.hypot(mote.wx, mote.wy))
    }
    expect(cloud.motes.map((mote) => [mote.x, mote.y])).toEqual(homes)
    // Dust strays a few pixels, a near firefly a few tens; nothing ever leaves for good.
    expect(Math.max(...wanders)).toBeLessThan(80)
    expect(wanders.some((distance) => distance > 20)).toBe(true)
  })

  it('moves slowly and smoothly along the loop', () => {
    const cloud = createCloud({ seed: 5, count: 0, fireflies: 80, aspect: 1 })
    advanceCloud(cloud, 0, 10)
    const before = cloud.motes.map((mote) => [mote.wx, mote.wy] as const)
    advanceCloud(cloud, 1 / 60, 10 + 1 / 60)
    const steps = cloud.motes.map((mote, index) => {
      const [x = 0, y = 0] = before[index] ?? []
      return Math.hypot(mote.wx - x, mote.wy - y)
    })
    // Under 30 px/s at most: a firefly floats, it doesn't dart.
    expect(Math.max(...steps)).toBeLessThan(0.5)
  })

  it('advances each twinkle by its own rhythm', () => {
    const cloud = createCloud({ seed: 6, count: 1, aspect: 1 })
    const [mote] = cloud.motes
    if (!mote) throw new Error('expected a mote')
    mote.phase = 0
    advanceCloud(cloud, 0.1, 0)
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
      advanceCloud(cloud, 1 / 60, t)
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
      advanceCloud(cloud, 1 / 60, t)
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

describe('placeCloud', () => {
  it('draws a light at home plus its offset', () => {
    const cloud = cloudAt([[100, 100]])
    only(cloud).dx = 12
    only(cloud).dy = -5
    placeCloud(cloud, size)
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

describe('fireflies', () => {
  it('adds the requested fireflies after the dust, mostly in Glow', () => {
    const { motes } = createCloud({ seed: 8, count: 100, fireflies: 200, aspect: 1 })
    const fireflies = motes.filter((mote) => mote.kind === 'firefly')
    expect(motes.slice(0, 100).every((mote) => mote.kind === 'dust')).toBe(true)
    expect(fireflies).toHaveLength(200)
    const glow = fireflies.filter((mote) => mote.tone === 0).length
    expect(glow / fireflies.length).toBeGreaterThan(0.55)
  })

  it('treats a negative firefly count as none', () => {
    expect(createCloud({ seed: 8, count: 0, fireflies: -3, aspect: 1 }).motes).toHaveLength(0)
  })
})

describe('pickFireflyTone', () => {
  it('makes seven in ten Glow, two Ember and one Dusk', () => {
    expect(pickFireflyTone(0.1)).toBe(0)
    expect(pickFireflyTone(0.69)).toBe(0)
    expect(pickFireflyTone(0.8)).toBe(2)
    expect(pickFireflyTone(0.95)).toBe(1)
  })
})

describe('fireflyGlow', () => {
  it('glows to full at phase 0 and is dim for most of the cycle', () => {
    expect(fireflyGlow(0)).toBeCloseTo(1)
    const samples = Array.from({ length: 200 }, (_, i) => fireflyGlow((i / 200) * 2 * Math.PI))
    expect(samples.every((value) => value >= 0 && value <= 1)).toBe(true)
    expect(samples.filter((value) => value < 0.1).length / samples.length).toBeGreaterThan(0.5)
  })

  it('swells slowly and fades slower still, a lantern breathing rather than a blink', () => {
    // Half a radian before its peak it is already well lit; it takes longer to fade the same.
    expect(fireflyGlow(-0.5)).toBeGreaterThan(0.3)
    expect(fireflyGlow(0.5)).toBeGreaterThan(0.5)
    expect(fireflyGlow(1.2)).toBeGreaterThan(fireflyGlow(-1.2))
  })
})

describe('one tone and an offset area', () => {
  it('paints every light in one tone when asked', () => {
    const { motes } = createCloud({ seed: 4, count: 80, fireflies: 40, aspect: 1, tone: 0 })
    expect(motes.every((mote) => mote.tone === 0)).toBe(true)
  })

  it('places the swarm inside an area that starts away from the canvas corner', () => {
    const cloud = cloudAt([[100, 100]])
    placeCloud(cloud, { left: 500, top: 40, ...size })
    expect(only(cloud).px).toBeCloseTo(600)
    expect(only(cloud).py).toBeCloseTo(140)
  })
})

describe('wanderAt', () => {
  it('stays within its reach', () => {
    const wander = {
      reachX: 10,
      reachY: 5,
      rates: [1, 2, 3, 4] as const,
      phases: [0, 1, 2, 3] as const,
    }
    for (let t = 0; t < 30; t += 0.1) {
      const { x, y } = wanderAt(wander, t)
      expect(Math.abs(x)).toBeLessThanOrEqual(10)
      expect(Math.abs(y)).toBeLessThanOrEqual(5)
    }
  })
})

describe('extendPath', () => {
  const at = (x: number) => ({ x, y: 0 })

  it('keeps every sample until the frame consumes it', () => {
    const path = [at(0)]
    for (let x = 1; x <= 9; x++) extendPath(path, at(x), 10)
    expect(path.map((point) => point.x)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('thins a stalled path to every other point, keeping the first and the newest', () => {
    const path = [at(0)]
    for (let x = 1; x <= 10; x++) extendPath(path, at(x), 10)
    // Eleven samples over a limit of ten: halved, but still the whole sweep, end to end.
    expect(path.map((point) => point.x)).toEqual([0, 2, 4, 6, 8, 10])
    extendPath(path, at(11), 10)
    expect(path.at(0)?.x).toBe(0)
    expect(path.at(-1)?.x).toBe(11)
  })

  it('keeps the newest point when thinning would otherwise drop it', () => {
    const path = [at(0)]
    // Twelve samples over a limit of eleven: the newest sits at an odd index, and is kept.
    for (let x = 1; x <= 11; x++) extendPath(path, at(x), 11)
    expect(path.map((point) => point.x)).toEqual([0, 2, 4, 6, 8, 10, 11])
    extendPath(path, at(12), 6)
    expect(path.map((point) => point.x)).toEqual([0, 4, 8, 11, 12])
  })
})
