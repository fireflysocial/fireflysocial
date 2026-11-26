import { vi } from 'vitest'

/**
 * Test doubles for the landing's canvas components: jsdom has no canvas, and a real
 * CanvasRenderingContext2D can't be constructed, so a partial fake that records draw calls
 * stands in for it, with fake observers and a hand-cranked animation frame.
 */

class FakeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
}

/** Remembers the latest resize callback, so a test can resize the field. */
export class FakeResizeObserver extends FakeObserver {
  static latest: (() => void) | undefined
  constructor(callback: () => void) {
    super()
    FakeResizeObserver.latest = callback
  }
}

/** Remembers the latest visibility callback, so a test can scroll the field in and out of view. */
export class FakeIntersectionObserver extends FakeObserver {
  static latest: ((entries: { isIntersecting: boolean }[]) => void) | undefined
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    super()
    FakeIntersectionObserver.latest = callback
  }
}

/** Just enough of a 2D context to record what gets drawn. */
export function fakeContext() {
  return {
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    closePath: vi.fn(),
    quadraticCurveTo: vi.fn<(cx: number, cy: number, x: number, y: number) => void>(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn<(x: number, y: number, radius: number, start: number, end: number) => void>(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    drawImage:
      vi.fn<(image: unknown, x: number, y: number, width: number, height: number) => void>(),
    fillRect: vi.fn<(x: number, y: number, width: number, height: number) => void>(),
    stroke: vi.fn(),
    fillText: vi.fn<(text: string, x: number, y: number) => void>(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
  }
}

export function withCanvas(size: { width: number; height: number } = { width: 360, height: 760 }) {
  const context = fakeContext()
  // Test double: jsdom has no canvas, and a real CanvasRenderingContext2D can't be constructed,
  // so a partial fake that records draw calls stands in for it. The component only uses these.
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(context as unknown as CanvasRenderingContext2D)
  const measure = vi
    .spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect')
    .mockReturnValue(DOMRect.fromRect(size))
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  const requestFrame = vi.fn<(callback: FrameRequestCallback) => number>(() => 1)
  const cancelFrame = vi.fn()
  vi.stubGlobal('requestAnimationFrame', requestFrame)
  vi.stubGlobal('cancelAnimationFrame', cancelFrame)
  /** Runs the most recently requested animation frame at `now` (ms). */
  const frame = (now: number) => {
    const callback = requestFrame.mock.calls.at(-1)?.[0]
    if (!callback) throw new Error('No animation frame was requested')
    callback(now)
  }
  return { context, requestFrame, cancelFrame, frame, measure, getContext }
}

export type FakeContext = ReturnType<typeof fakeContext>
