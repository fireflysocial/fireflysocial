import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FireflyField } from './FireflyField.tsx'

class FakeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
}

/** Just enough of a 2D context to record what gets drawn. */
function fakeContext() {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
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

function withCanvas() {
  const context = fakeContext()
  // Test double: jsdom has no canvas, and a real CanvasRenderingContext2D can't be constructed,
  // so a partial fake that records draw calls stands in for it. The component only uses these.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue(
    DOMRect.fromRect({ width: 360, height: 760 }),
  )
  vi.stubGlobal('ResizeObserver', FakeObserver)
  vi.stubGlobal('IntersectionObserver', FakeObserver)
  const requestFrame = vi.fn(() => 1)
  const cancelFrame = vi.fn()
  vi.stubGlobal('requestAnimationFrame', requestFrame)
  vi.stubGlobal('cancelAnimationFrame', cancelFrame)
  return { context, requestFrame, cancelFrame }
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
})
