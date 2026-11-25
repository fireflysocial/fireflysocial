import { describe, expect, it } from 'vitest'
import { CHAPTER_COUNT, MAX_COUPLING, WEEKS_SHOWN, sectionProgress, storyAt } from './story.ts'

describe('storyAt', () => {
  it('starts with a scattered, unlit, uncoupled crowd', () => {
    expect(storyAt(0)).toEqual({ chapter: 0, gather: 0, lit: 0, coupling: 0, week: 1 })
  })

  it('ends with the pod gathered, lit and fully coupled', () => {
    expect(storyAt(1)).toEqual({
      chapter: CHAPTER_COUNT - 1,
      gather: 1,
      lit: 1,
      coupling: MAX_COUPLING,
      week: WEEKS_SHOWN,
    })
  })

  it('moves through the chapters in order, one per screen', () => {
    const chapters = [0, 0.25, 0.5, 0.75, 1].map((p) => storyAt(p).chapter)
    expect(chapters).toEqual([0, 1, 2, 3, 4])
  })

  it('gathers and lights the pod before it starts syncing', () => {
    const formed = storyAt(0.55)
    expect(formed.gather).toBe(1)
    expect(formed.lit).toBe(1)
    expect(formed.coupling).toBe(0)
  })

  it('keeps the pod scattered through the city chapter', () => {
    expect(storyAt(0.25).gather).toBe(0)
  })

  it('counts the weeks up while the pod syncs', () => {
    expect([0.58, 0.65, 0.72, 0.79, 0.86].map((p) => storyAt(p).week)).toEqual([1, 2, 3, 4, 4])
  })

  it('never goes backwards as you scroll down', () => {
    let previous = storyAt(0)
    for (let p = 0; p <= 1; p += 0.01) {
      const frame = storyAt(p)
      expect(frame.gather).toBeGreaterThanOrEqual(previous.gather)
      expect(frame.coupling).toBeGreaterThanOrEqual(previous.coupling)
      expect(frame.chapter).toBeGreaterThanOrEqual(previous.chapter)
      previous = frame
    }
  })

  it('clamps progress outside 0..1 and ignores non-numbers', () => {
    expect(storyAt(-3)).toEqual(storyAt(0))
    expect(storyAt(9)).toEqual(storyAt(1))
    expect(storyAt(Number.NaN)).toEqual(storyAt(0))
  })
})

describe('sectionProgress', () => {
  it('is 0 before the section reaches the top of the viewport', () => {
    expect(sectionProgress(200, 3000, 800)).toBe(0)
  })

  it('tracks how far the section has scrolled past the top', () => {
    expect(sectionProgress(-1100, 3000, 800)).toBe(0.5)
    expect(sectionProgress(-2200, 3000, 800)).toBe(1)
    expect(sectionProgress(-5000, 3000, 800)).toBe(1)
  })

  it('handles a section no taller than the viewport', () => {
    expect(sectionProgress(10, 600, 800)).toBe(0)
    expect(sectionProgress(-10, 600, 800)).toBe(1)
  })
})
