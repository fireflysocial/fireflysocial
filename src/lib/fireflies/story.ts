import { progressBetween, smoothstep } from './math.ts'

/**
 * The landing page's scroll story, as a pure function of scroll progress through the story
 * section (0 at its top, 1 at its end). The section holds one full-screen text block per
 * chapter, so chapter i is centred on screen at progress i / (CHAPTER_COUNT - 1):
 *
 * 0. Opening: the headline over a crowd of strangers, each blinking on their own.
 * 1. The city: people you've almost met.
 * 2. A pod forms: five of them gather at one event and light up.
 * 3. Week after week: the pod's flashes drift closer together.
 * 4. In step: the pod flashes as one.
 */
export const CHAPTER_COUNT = 5
export const WEEKS_SHOWN = 4

/** Coupling strong enough that five fireflies sync within a couple of seconds. */
export const MAX_COUPLING = 2.4

export interface StoryFrame {
  /** Current chapter, 0 to CHAPTER_COUNT - 1. */
  chapter: number
  /** 0 = pod members scattered in the crowd, 1 = gathered into their pod. */
  gather: number
  /** 0 = pod looks like everyone else, 1 = pod is lit in Glow. */
  lit: number
  /** Kuramoto coupling strength for the pod. */
  coupling: number
  /** Which week of meeting the story is on, 1 to WEEKS_SHOWN. */
  week: number
}

export function storyAt(progress: number): StoryFrame {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0
  const chapter = Math.round(p * (CHAPTER_COUNT - 1))
  const gather = smoothstep(progressBetween(p, 0.32, 0.5))
  const lit = smoothstep(progressBetween(p, 0.4, 0.52))
  const weeks = progressBetween(p, 0.58, 0.86)
  const coupling = MAX_COUPLING * smoothstep(weeks)
  const week = Math.min(WEEKS_SHOWN, 1 + Math.floor(weeks * WEEKS_SHOWN))
  return { chapter, gather, lit, coupling, week }
}

/** Scroll progress through a section, from its bounding box and the viewport height. */
export function sectionProgress(top: number, height: number, viewportHeight: number): number {
  const scrollable = height - viewportHeight
  if (scrollable <= 0) return top <= 0 ? 1 : 0
  return progressBetween(-top, 0, scrollable)
}
