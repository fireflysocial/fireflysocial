import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, onTestFinished, vi } from 'vitest'
import {
  FakeIntersectionObserver,
  FakeResizeObserver,
  withCanvas,
  type FakeContext,
} from '../../test/fakeCanvas.ts'
import { FireflyField } from './FireflyField.tsx'

/** The radius of the hairline ring drawn around a tap at (x, y) in the latest frame, if any. */
function ringAt(context: FakeContext, x: number, y: number) {
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
    expect(add).toHaveBeenCalledWith('pointermove', expect.any(Function))
    unmount()
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('pointerleave', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('pointercancel', expect.any(Function))
  })

  it('ends the stir when the browser takes a touch over to scroll', () => {
    /** The squares drawn a while after a short drag, optionally cancelled by the browser. */
    const afterDrag = (cancel: boolean) => {
      const { context, target, frame } = fieldWithTarget()
      frame(1000)
      target.dispatchEvent(new PointerEvent('pointermove', { clientX: 120, clientY: 300 }))
      if (cancel) target.dispatchEvent(new PointerEvent('pointercancel'))
      target.dispatchEvent(new PointerEvent('pointermove', { clientX: 180, clientY: 300 }))
      frame(1040)
      context.fillRect.mockClear()
      frame(1080)
      return context.fillRect.mock.calls
    }
    const dragged = afterDrag(false)
    cleanup()
    // Cancelled after the first point, the second is a fresh arrival: no path, no stir.
    expect(afterDrag(true)).not.toEqual(dragged)
  })

  it('still stirs with a move that leaves the field before the next frame', () => {
    /** The squares drawn in the frame after a quick move, optionally leaving straight after. */
    const afterMove = (move: boolean, leave: boolean) => {
      const { context, target, frame } = fieldWithTarget()
      frame(1000)
      if (move) {
        target.dispatchEvent(new PointerEvent('pointermove', { clientX: 120, clientY: 300 }))
        target.dispatchEvent(new PointerEvent('pointermove', { clientX: 180, clientY: 300 }))
      }
      if (leave) target.dispatchEvent(new PointerEvent('pointerleave'))
      context.fillRect.mockClear()
      frame(1040)
      const squares = context.fillRect.mock.calls
      cleanup()
      return squares
    }
    expect(afterMove(true, true)).not.toEqual(afterMove(false, false))
  })

  it('never lights the ground behind the text, even where a hand passes', () => {
    const { context, target, frame } = fieldWithTarget()
    frame(1000)
    // Sweep back and forth across the lowest part of a 360x760 field, behind the text.
    for (let i = 0; i < 20; i++) {
      target.dispatchEvent(
        new PointerEvent('pointermove', { clientX: i % 2 === 0 ? 20 : 340, clientY: 700 }),
      )
      frame(1000 + (i + 1) * 40)
    }
    expect(context.fillRect.mock.calls.every(([, y]) => y < 760 * 0.8)).toBe(true)
  })

  it('lights fireflies with soft halos under their cores, added onto the dark', () => {
    const { context } = withCanvas()
    const modes: string[] = []
    context.drawImage.mockImplementation(() => {
      modes.push(context.globalCompositeOperation)
    })
    render(<FireflyField progress={{ current: 0 }} still stillProgress={0} />)
    expect(modes.length).toBeGreaterThan(5)
    expect(modes.every((mode) => mode === 'lighter')).toBe(true)
    // Back to normal painting for the cores and the mark, at full opacity.
    expect(context.globalCompositeOperation).toBe('source-over')
    expect(context.globalAlpha).toBe(1)
    // Round cores, one path per batch.
    expect(context.moveTo).toHaveBeenCalled()
  })

  it('draws the lights without halos where an offscreen canvas can’t be drawn', () => {
    const { context, getContext } = withCanvas()
    // The field's own canvas has a context; the first halo sprite's doesn't.
    getContext
      .mockReturnValueOnce(context as unknown as CanvasRenderingContext2D)
      .mockReturnValueOnce(null)
    render(<FireflyField progress={{ current: 0 }} still stillProgress={0} />)
    expect(context.drawImage).not.toHaveBeenCalled()
    expect(context.fillRect.mock.calls.length).toBeGreaterThan(500)
  })

  it('draws only the crowd as a still frame when its story is at the start', () => {
    const { context } = withCanvas()
    render(<FireflyField progress={{ current: 0 }} still stillProgress={0} />)
    // Hundreds of tiny lights, and no named pod yet.
    expect(context.fillRect.mock.calls.length).toBeGreaterThan(500)
    expect(context.fillText).not.toHaveBeenCalled()
  })

  it('keeps the ground behind the text and at the bottom edge clean', () => {
    const { context } = withCanvas()
    render(<FireflyField progress={{ current: 0 }} still stillProgress={0} />)
    const squares = context.fillRect.mock.calls
    expect(squares.length).toBeGreaterThan(500)
    // On a 360x760 field the text runs from about 55% down; nothing is drawn in the lower third.
    expect(squares.every(([, y]) => y < 760 * 0.67)).toBe(true)
  })

  it('paints the cloud in yellow, violet and warm white', () => {
    const { context } = withCanvas()
    const styles: string[] = []
    context.fillRect.mockImplementation(() => {
      styles.push(context.fillStyle)
    })
    render(<FireflyField progress={{ current: 0 }} still stillProgress={0} />)
    // The halo sprites share this fake context and fill with a gradient; only the lights count.
    const lights = styles.filter((style) => typeof style === 'string')
    expect(lights.some((style) => style.startsWith('rgba(217, 248, 74'))).toBe(true)
    expect(lights.some((style) => style.startsWith('rgba(195, 160, 255'))).toBe(true)
    expect(lights.some((style) => style.startsWith('rgba(242, 236, 206'))).toBe(true)
  })

  it('stirs the cloud along a moving pointer’s path', () => {
    /** The squares drawn in a later frame of a fresh field, optionally after a pointer moves. */
    const laterFrame = (move: boolean) => {
      const { context, target, frame } = fieldWithTarget()
      frame(1000)
      if (move) {
        target.dispatchEvent(new PointerEvent('pointermove', { clientX: 120, clientY: 300 }))
        target.dispatchEvent(new PointerEvent('pointermove', { clientX: 180, clientY: 300 }))
      }
      frame(1040)
      context.fillRect.mockClear()
      frame(1080)
      return context.fillRect.mock.calls
    }
    const calm = laterFrame(false)
    cleanup()
    const stirred = laterFrame(true)
    expect(stirred).not.toEqual(calm)
  })

  it('does not stir under a pointer that has stopped, or one that has left', () => {
    /** The squares drawn a while after the pointer arrives, optionally leaving straight after. */
    const settled = (leave: boolean) => {
      const { context, target, frame } = fieldWithTarget()
      frame(1000)
      // One event is a pointer arriving, not moving: no path, so no stir.
      target.dispatchEvent(new PointerEvent('pointermove', { clientX: 180, clientY: 300 }))
      if (leave) target.dispatchEvent(new PointerEvent('pointerleave'))
      for (let now = 1040; now <= 1400; now += 40) frame(now)
      context.fillRect.mockClear()
      frame(1440)
      return context.fillRect.mock.calls
    }
    const resting = settled(false)
    cleanup()
    const left = settled(true)
    expect(resting).toEqual(left)
  })

  it('keeps a frame’s path short however many events arrive', () => {
    const { context, target, frame } = fieldWithTarget()
    frame(1000)
    for (let i = 0; i < 30; i++) {
      target.dispatchEvent(new PointerEvent('pointermove', { clientX: 10 * i, clientY: 300 }))
    }
    context.clearRect.mockClear()
    frame(1040)
    expect(context.clearRect).toHaveBeenCalledTimes(1)
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
    expect(ringAt(context, 100, 200)).toBeCloseTo(0.04 * 340)
    // Well past the reach of a call (220 px at 340 px/s), the ring is gone.
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
    expect(ringAt(context, 100, 200)).toBeCloseTo(0.04 * 340)
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
