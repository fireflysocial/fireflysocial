import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, onTestFinished, vi } from 'vitest'
import { FireflyField } from './FireflyField.tsx'

class FakeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
}

/** Remembers the latest resize callback, so a test can resize the field. */
class FakeResizeObserver extends FakeObserver {
  static latest: (() => void) | undefined
  constructor(callback: () => void) {
    super()
    FakeResizeObserver.latest = callback
  }
}

/** Remembers the latest visibility callback, so a test can scroll the field in and out of view. */
class FakeIntersectionObserver extends FakeObserver {
  static latest: ((entries: { isIntersecting: boolean }[]) => void) | undefined
  constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
    super()
    FakeIntersectionObserver.latest = callback
  }
}

/** Just enough of a 2D context to record what gets drawn. */
function fakeContext() {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn<(x: number, y: number, radius: number, start: number, end: number) => void>(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn<(text: string, x: number, y: number) => void>(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textBaseline: 'alphabetic',
  }
}

function withCanvas(size: { width: number; height: number } = { width: 360, height: 760 }) {
  const context = fakeContext()
  // Test double: jsdom has no canvas, and a real CanvasRenderingContext2D can't be constructed,
  // so a partial fake that records draw calls stands in for it. The component only uses these.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  )
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
  return { context, requestFrame, cancelFrame, frame, measure }
}

/** The radius of the hairline ring drawn around a tap at (x, y) in the latest frame, if any. */
function ringAt(context: ReturnType<typeof fakeContext>, x: number, y: number) {
  const rings = context.arc.mock.calls.filter(([cx, cy]) => cx === x && cy === y)
  return rings.at(-1)?.[2]
}

/** Renders a moving field with a call target, returning the target and the canvas controls. */
function fieldWithTarget() {
  const canvas = withCanvas()
  const target = document.createElement('section')
  const button = document.createElement('button')
  button.textContent = 'Get an invite'
  target.append(button, document.createTextNode('the dark'))
  document.body.append(target)
  onTestFinished(() => {
    target.remove()
  })
  render(<FireflyField progress={{ current: 0 }} still={false} callTarget={{ current: target }} />)
  return { ...canvas, target, button }
}

describe('FireflyField', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(<FireflyField progress={{ current: 0 }} still={false} />)
    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders nothing extra and does not crash without canvas support', () => {
    const requestFrame = vi.fn()
    vi.stubGlobal('requestAnimationFrame', requestFrame)
    render(<FireflyField progress={{ current: 0 }} still={false} />)
    expect(requestFrame).not.toHaveBeenCalled()
  })

  it('animates when motion is allowed, and stops when removed', () => {
    const { requestFrame, cancelFrame } = withCanvas()
    const { unmount } = render(<FireflyField progress={{ current: 0 }} still={false} />)
    expect(requestFrame).toHaveBeenCalled()
    unmount()
    expect(cancelFrame).toHaveBeenCalled()
  })

  it('listens for taps on its call target, and stops when removed', () => {
    withCanvas()
    const target = document.createElement('section')
    const add = vi.spyOn(target, 'addEventListener')
    const remove = vi.spyOn(target, 'removeEventListener')
    const { unmount } = render(
      <FireflyField progress={{ current: 0 }} still={false} callTarget={{ current: target }} />,
    )
    expect(add).toHaveBeenCalledWith('pointerdown', expect.any(Function))
    unmount()
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function))
  })

  it('draws only the crowd as a still frame when its story is at the start', () => {
    const { context } = withCanvas()
    render(<FireflyField progress={{ current: 0 }} still stillProgress={0} />)
    expect(context.arc).toHaveBeenCalled()
    expect(context.fillText).not.toHaveBeenCalled()
  })

  it('draws one still frame, with the pod named and gathered, for reduced motion', () => {
    const { context, requestFrame } = withCanvas()
    render(<FireflyField progress={{ current: 0 }} still />)
    expect(requestFrame).not.toHaveBeenCalled()
    expect(context.arc).toHaveBeenCalled()
    expect(context.fillText.mock.calls.map(([name]) => name)).toEqual([
      'Maya',
      'Jun',
      'Priya',
      'Sam',
      'You',
    ])
  })

  it('advances and redraws the field every animation frame', () => {
    const { context, requestFrame, frame } = withCanvas()
    render(<FireflyField progress={{ current: 0.5 }} still={false} />)
    frame(1000)
    frame(1016)
    expect(requestFrame).toHaveBeenCalledTimes(3)
    expect(context.clearRect).toHaveBeenCalledTimes(2)
  })

  it('stops drawing while scrolled out of view, and resumes when back', () => {
    const { context, frame } = withCanvas()
    render(<FireflyField progress={{ current: 0 }} still={false} />)
    FakeIntersectionObserver.latest?.([{ isIntersecting: false }])
    frame(1000)
    expect(context.clearRect).not.toHaveBeenCalled()
    // An empty report (no entry) counts as visible.
    FakeIntersectionObserver.latest?.([])
    frame(1016)
    expect(context.clearRect).toHaveBeenCalledTimes(1)
  })

  it('answers a tap on the dark with a ring that spreads, then fades out', async () => {
    const { context, target, frame } = fieldWithTarget()
    frame(1000)
    await userEvent.pointer({
      keys: '[MouseLeft>]',
      target,
      coords: { clientX: 100, clientY: 200 },
    })
    frame(1040)
    expect(ringAt(context, 100, 200)).toBeCloseTo(0.04 * 320)
    // Well past the reach of a call (200 px at 320 px/s), the ring is gone.
    for (let now = 1090; now < 2500; now += 50) frame(now)
    context.arc.mockClear()
    frame(2550)
    expect(ringAt(context, 100, 200)).toBeUndefined()
  })

  it('does not jump ahead after the tab was hidden', async () => {
    const { context, target, frame } = fieldWithTarget()
    frame(1000)
    await userEvent.pointer({
      keys: '[MouseLeft>]',
      target,
      coords: { clientX: 100, clientY: 200 },
    })
    frame(1040)
    const before = ringAt(context, 100, 200)
    document.dispatchEvent(new Event('visibilitychange'))
    frame(9000)
    expect(ringAt(context, 100, 200)).toBe(before)
  })

  it('ignores taps on links and controls', async () => {
    const { context, button, frame } = fieldWithTarget()
    frame(1000)
    await userEvent.pointer({
      keys: '[MouseLeft>]',
      target: button,
      coords: { clientX: 100, clientY: 200 },
    })
    frame(1040)
    expect(ringAt(context, 100, 200)).toBeUndefined()
  })

  it('answers a tap that lands on bare text in the dark', () => {
    const { context, target, frame } = fieldWithTarget()
    frame(1000)
    // Some browsers target the text node itself; user-event can't, so dispatch directly.
    const text = target.lastChild
    text?.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, clientX: 100, clientY: 200 }),
    )
    frame(1040)
    expect(ringAt(context, 100, 200)).toBeCloseTo(0.04 * 320)
  })

  it('keeps only the latest six calls', async () => {
    const { context, target, frame } = fieldWithTarget()
    frame(1000)
    for (let i = 0; i < 7; i++) {
      await userEvent.pointer({
        keys: '[MouseLeft>]',
        target,
        coords: { clientX: 10 + i, clientY: 200 },
      })
    }
    frame(1040)
    expect(ringAt(context, 10, 200)).toBeUndefined()
    expect(ringAt(context, 16, 200)).toBeDefined()
  })

  it('does not listen for taps when still', () => {
    withCanvas()
    const target = document.createElement('section')
    const add = vi.spyOn(target, 'addEventListener')
    render(<FireflyField progress={{ current: 0 }} still callTarget={{ current: target }} />)
    expect(add).not.toHaveBeenCalled()
  })

  it('lays the pod out beside the text on wide screens', () => {
    const { context } = withCanvas({ width: 1280, height: 800 })
    render(<FireflyField progress={{ current: 0 }} still />)
    const x = context.fillText.mock.calls[0]?.[1]
    // Right of centre: the text column takes the left half.
    expect(x).toBeGreaterThan(640)
  })

  it('caps the pixel ratio at 2x, and treats a missing one as 1x', () => {
    withCanvas()
    vi.stubGlobal('devicePixelRatio', 3)
    const { container, unmount } = render(<FireflyField progress={{ current: 0 }} still />)
    expect(container.querySelector('canvas')?.width).toBe(720)
    unmount()
    vi.stubGlobal('devicePixelRatio', 0)
    const again = render(<FireflyField progress={{ current: 0 }} still />)
    expect(again.container.querySelector('canvas')?.width).toBe(360)
  })

  it('redraws a still frame at the new size when resized', () => {
    const { context, measure } = withCanvas()
    const { container } = render(<FireflyField progress={{ current: 0 }} still />)
    measure.mockReturnValue(DOMRect.fromRect({ width: 402, height: 874 }))
    FakeResizeObserver.latest?.()
    expect(container.querySelector('canvas')?.height).toBe(874)
    expect(context.clearRect).toHaveBeenLastCalledWith(0, 0, 402, 874)
  })

  it('only measures a moving field on resize; the next frame draws it', () => {
    const { context } = withCanvas()
    render(<FireflyField progress={{ current: 0 }} still={false} />)
    FakeResizeObserver.latest?.()
    expect(context.clearRect).not.toHaveBeenCalled()
  })
})
