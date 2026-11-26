import { describe, expect, it } from 'vitest'
import {
  MARK_ASPECT,
  MIN_MARK_SIZE,
  readableMark,
  arrival,
  lensCentres,
  markClearance,
  markCountFor,
  markGather,
  markLayout,
  markPartAt,
  sampleMark,
} from './mark.ts'
import { createRandom } from './random.ts'

describe('lensCentres', () => {
  it('puts both arc centres one radius from each end of the chord', () => {
    const a = { x: 0, y: 0 }
    const b = { x: 6, y: 0 }
    for (const centre of lensCentres(a, b, 5)) {
      expect(Math.hypot(centre.x - a.x, centre.y - a.y)).toBeCloseTo(5)
      expect(Math.hypot(centre.x - b.x, centre.y - b.y)).toBeCloseTo(5)
    }
    expect(lensCentres(a, b, 5).map((centre) => centre.y)).toEqual([4, -4])
  })

  it('treats a radius too short for the chord as meeting at the chord’s middle', () => {
    for (const centre of lensCentres({ x: 0, y: 0 }, { x: 10, y: 0 }, 1)) {
      expect(centre.x).toBe(5)
      expect(Math.abs(centre.y)).toBe(0)
    }
  })
})

describe('markPartAt', () => {
  it('finds the tail, both wings and the gaps, in the mark’s own viewBox', () => {
    expect(markPartAt(256, 348)).toBe('tail')
    // The middle of each wing.
    expect(markPartAt(200, 211)).toBe('wing')
    expect(markPartAt(312, 211)).toBe('wing')
    // Between the wing tips, and outside the mark.
    expect(markPartAt(256, 110)).toBeNull()
    expect(markPartAt(20, 20)).toBeNull()
  })
})

describe('sampleMark', () => {
  it('places every light on the mark, within half a mark height of its centre', () => {
    const slots = sampleMark(createRandom(3), 2000)
    expect(slots).toHaveLength(2000)
    for (const slot of slots) {
      expect(Math.abs(slot.y)).toBeLessThanOrEqual(0.5)
      expect(Math.abs(slot.x)).toBeLessThanOrEqual(MARK_ASPECT / 2)
      expect(markPartAt(256 + slot.x * 324, 258 + slot.y * 324)).toBe(slot.tail ? 'tail' : 'wing')
    }
  })

  it('gives most lights to the wings, so their shape reads', () => {
    const slots = sampleMark(createRandom(4), 2000)
    const tail = slots.filter((slot) => slot.tail).length
    expect(tail).toBeGreaterThan(100)
    expect(tail).toBeLessThan(slots.length / 3)
  })

  it('is deterministic for a seed, and empty for no lights', () => {
    expect(sampleMark(createRandom(5), 30)).toEqual(sampleMark(createRandom(5), 30))
    expect(sampleMark(createRandom(5), -2)).toEqual([])
  })
})

describe('markLayout', () => {
  it('centres the mark in the open band above the text on phones', () => {
    const layout = markLayout(360, 760)
    expect(layout.centerX).toBe(180)
    // Clear of the header (56px) above and the text (from about 48% down) below.
    expect(layout.centerY - layout.size / 2).toBeGreaterThan(56)
    expect(layout.centerY + layout.size / 2).toBeLessThan(760 * 0.45)
    expect(layout.size * MARK_ASPECT).toBeLessThan(360)
  })

  it('sets the mark above the intro column on wide screens, inside the right gutter', () => {
    const layout = markLayout(1470, 800)
    const right = layout.centerX + (layout.size * MARK_ASPECT) / 2
    expect(right).toBeCloseTo(1470 - 32)
    expect(layout.centerX).toBeGreaterThan(1470 * 0.7)
    // Above the intro, which starts about 63% down.
    expect(layout.centerY + layout.size / 2).toBeLessThan(800 * 0.62)
  })
})

describe('markLayout in a measured band', () => {
  it('fits and centres the mark in the open band between the header and the text', () => {
    const band = { top: 96, bottom: 448 }
    const layout = markLayout(1470, 800, band)
    expect(layout.centerY).toBe(272)
    // Clear space above and below it.
    expect(layout.centerY - layout.size / 2).toBeGreaterThan(band.top + 30)
    expect(layout.centerY + layout.size / 2).toBeLessThan(band.bottom - 30)
  })

  it('shrinks on a short wide window instead of running into the text', () => {
    const band = { top: 96, bottom: 300 }
    const layout = markLayout(1470, 660, band)
    expect(layout.centerY + layout.size / 2).toBeLessThan(band.bottom)
  })

  it('never grows past its share of the field in a tall band', () => {
    expect(markLayout(360, 760, { top: 0, bottom: 2000 }).size).toBe(markLayout(360, 760).size)
  })

  it('draws nothing in a band with no room', () => {
    expect(markLayout(360, 760, { top: 300, bottom: 280 }).size).toBe(0)
  })
})

describe('readableMark', () => {
  it('keeps a mark large enough to read, and drops one that would be a blob', () => {
    const layout = { centerX: 100, centerY: 100, size: MIN_MARK_SIZE }
    expect(readableMark(layout)).toBe(layout)
    expect(readableMark({ ...layout, size: MIN_MARK_SIZE - 1 })).toBeNull()
    expect(readableMark({ ...layout, size: 0 })).toBeNull()
  })
})

describe('markCountFor', () => {
  it('scales with the mark, within limits that keep phones smooth', () => {
    expect(markCountFor(100)).toBe(800)
    expect(markCountFor(240)).toBe(1800)
    expect(markCountFor(1000)).toBe(3400)
  })
})

describe('markGather', () => {
  it('waits a moment, then gathers over a few seconds', () => {
    expect(markGather(0)).toBe(0)
    expect(markGather(0.4)).toBe(0)
    expect(markGather(2)).toBeCloseTo(0.5)
    expect(markGather(10)).toBe(1)
  })
})

describe('arrival', () => {
  it('sends the first lights before the last, and lands them all', () => {
    expect(arrival(0, 0)).toBe(0)
    expect(arrival(0.3, 0)).toBeGreaterThan(arrival(0.3, 1))
    expect(arrival(0.3, 1)).toBe(0)
    expect(arrival(1, 0)).toBe(1)
    expect(arrival(1, 1)).toBe(1)
  })

  it('lifts off and lands gently, fastest in the middle of its flight', () => {
    // The first light flies from gather 0 to 1/1.55.
    const flight = 1 / 1.55
    const step = flight / 10
    const start = arrival(step, 0) - arrival(0, 0)
    const middle = arrival(flight / 2 + step / 2, 0) - arrival(flight / 2 - step / 2, 0)
    const end = arrival(flight, 0) - arrival(flight - step, 0)
    expect(start).toBeLessThan(middle / 5)
    expect(end).toBeLessThan(middle / 5)
    // Top speed stays under twice the average (0.1 per step).
    expect(middle).toBeLessThan(0.2)
  })
})

describe('markClearance', () => {
  const layout = { centerX: 200, centerY: 200, size: 200 }

  it('leaves the crowd alone before the mark gathers, and far from it', () => {
    expect(markClearance(200, 200, layout, 0)).toBe(1)
    expect(markClearance(600, 200, layout, 1)).toBe(1)
  })

  it('thins the crowd inside a gathered mark, with a soft edge', () => {
    expect(markClearance(200, 200, layout, 1)).toBeCloseTo(0.2)
    const edge = markClearance(200 + 0.95 * 100, 200, layout, 1)
    expect(edge).toBeGreaterThan(0.2)
    expect(edge).toBeLessThan(1)
  })
})
