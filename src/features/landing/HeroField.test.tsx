import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, onTestFinished, vi } from 'vitest'
import { FakeIntersectionObserver, FakeResizeObserver, withCanvas } from '../../test/fakeCanvas.ts'
import { HeroField } from './HeroField.tsx'

/** An element whose box (relative to the 360x760 canvas at the origin) is `box`. */
function boxed(box: { x: number; y: number; width: number; height: number }) {
  const element = document.createElement('div')
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect(box))
  document.body.append(element)
  onTestFinished(() => {
    element.remove()
  })
  return element
}

/** A phone hero: the meadow over the top 300px, below the header. */
function phone({ still = false } = {}) {
  const canvas = withCanvas()
  const meadow = boxed({ x: 0, y: 56, width: 360, height: 300 })
  const view = render(<HeroField still={still} meadow={{ current: meadow }} />)
  return { ...canvas, meadow, view }
}

/** A pointer move over the meadow at (x, y). */
function move(meadow: HTMLElement, x: number, y: number) {
  meadow.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y }))
}

/**
 * The grass's tip positions in the frame after `act` runs on a fresh moving meadow, before that
 * frame: what the meadow looks like once the frame has consumed whatever `act` did.
 */
function tipsAfter(act: (meadow: HTMLElement) => void) {
  const { context, meadow, frame, view } = phone()
  frame(1000)
  act(meadow)
  context.quadraticCurveTo.mockClear()
  frame(1040)
  const tips = context.quadraticCurveTo.mock.calls.map(([, , x, y]) => [x, y])
  view.unmount()
  return tips
}

describe('HeroField', () => {
  it('is hidden from assistive technology, and safe without canvas support', () => {
    const requestFrame = vi.fn()
    vi.stubGlobal('requestAnimationFrame', requestFrame)
    const { container } = render(<HeroField still={false} meadow={{ current: null }} />)
    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true')
    expect(requestFrame).not.toHaveBeenCalled()
  })

  it('draws one still meadow, for reduced motion', () => {
    const { context, requestFrame } = phone({ still: true })
    expect(requestFrame).not.toHaveBeenCalled()
    // Grass, drawn as curves, kept inside the meadow's frame, and fireflies with halos.
    expect(context.quadraticCurveTo).toHaveBeenCalled()
    expect(context.rect).toHaveBeenCalledWith(0, 56, 360, 300)
    expect(context.clip).toHaveBeenCalled()
    expect(context.drawImage).toHaveBeenCalled()
  })

  it('keeps every firefly and speck inside the meadow', () => {
    const { context } = phone({ still: true })
    const squares: [number, number][] = []
    context.fillRect.mockImplementation((x, y) => {
      squares.push([x, y])
    })
    const dots: [number, number][] = []
    context.arc.mockImplementation((x, y) => {
      dots.push([x, y])
    })
    FakeResizeObserver.latest?.()
    const inMeadow = ([, y]: [number, number]) => y >= 56 - 30 && y <= 356 + 30
    expect(squares.length).toBeGreaterThan(40)
    // The halo sprites share this fake context: their fills are 64px squares at the origin.
    const lights = squares.filter(([x, y]) => !(x === 0 && y === 0))
    expect(lights.every(inMeadow)).toBe(true)
    expect(dots.every(inMeadow)).toBe(true)
  })

  it('treats the whole field as the meadow without a frame', () => {
    const { context } = withCanvas()
    render(<HeroField still meadow={{ current: null }} />)
    expect(context.rect).toHaveBeenCalledWith(0, 0, 360, 760)
  })

  it('answers a tap in the meadow with a ring that spreads and fades', async () => {
    const { context, meadow, frame } = phone()
    frame(1000)
    await userEvent.pointer({ keys: '[MouseLeft>]', target: meadow, coords: { x: 100, y: 200 } })
    frame(1040)
    const rings = () => context.arc.mock.calls.filter(([x, y]) => x === 100 && y === 200)
    expect(rings().at(-1)?.[2]).toBeCloseTo(0.04 * 260)
    for (let now = 1090; now < 2500; now += 50) frame(now)
    context.arc.mockClear()
    frame(2550)
    expect(rings()).toHaveLength(0)
  })

  it('keeps only the latest six taps', async () => {
    const { context, meadow, frame } = phone()
    frame(1000)
    for (let i = 0; i < 7; i++) {
      await userEvent.pointer({
        keys: '[MouseLeft>]',
        target: meadow,
        coords: { x: 10 + i, y: 200 },
      })
    }
    frame(1040)
    const ringAt = (x: number) => context.arc.mock.calls.some(([cx, cy]) => cx === x && cy === 200)
    expect(ringAt(10)).toBe(false)
    expect(ringAt(16)).toBe(true)
  })

  it('brushes the grass and stirs the fireflies under a moving hand, and both heal', () => {
    /** The grass's tip positions in a frame a while after an optional brush. */
    const tips = (brush: boolean, settle: number) => {
      const { context, meadow, frame, view } = phone()
      frame(1000)
      if (brush) {
        meadow.dispatchEvent(new PointerEvent('pointermove', { clientX: 60, clientY: 250 }))
        meadow.dispatchEvent(new PointerEvent('pointermove', { clientX: 200, clientY: 250 }))
        frame(1040)
        meadow.dispatchEvent(new PointerEvent('pointerleave'))
      } else {
        frame(1040)
      }
      for (let now = 1080; now <= 1040 + settle; now += 40) frame(now)
      context.quadraticCurveTo.mockClear()
      frame(1040 + settle + 40)
      const calls = context.quadraticCurveTo.mock.calls.map(([, , x, y]) => [x, y])
      view.unmount()
      return calls
    }
    expect(tips(true, 80)).not.toEqual(tips(false, 80))
    // Long after, both have sprung back: the meadow looks just as it would untouched.
    expect(tips(true, 6000)).toEqual(tips(false, 6000))
  })

  it('still brushes with a swipe that leaves the meadow before the next frame', () => {
    const swipe = (meadow: HTMLElement) => {
      move(meadow, 60, 250)
      move(meadow, 200, 250)
      meadow.dispatchEvent(new PointerEvent('pointerleave'))
    }
    expect(tipsAfter(swipe)).not.toEqual(tipsAfter(() => undefined))
  })

  it('drops the movement when the browser takes the touch over to scroll', () => {
    const scroll = (meadow: HTMLElement) => {
      move(meadow, 60, 250)
      move(meadow, 200, 250)
      meadow.dispatchEvent(new PointerEvent('pointercancel'))
    }
    expect(tipsAfter(scroll)).toEqual(tipsAfter(() => undefined))
  })

  it('sweeps every sample of a long move made within one frame, to its far end', () => {
    /** Out to the right and back, in 10px steps: 61 samples before the next frame. */
    const outAndBack = (meadow: HTMLElement) => {
      for (let x = 0; x <= 300; x += 10) move(meadow, x, 250)
      for (let x = 290; x >= 0; x -= 10) move(meadow, x, 250)
    }
    /** Only the start of that sweep: what a path that kept just its first samples would brush. */
    const start = (meadow: HTMLElement) => {
      for (let x = 0; x <= 100; x += 10) move(meadow, x, 250)
      move(meadow, 0, 250)
    }
    expect(tipsAfter(outAndBack)).not.toEqual(tipsAfter(start))
  })

  it('pauses while scrolled out of view or the tab is hidden, and stops when removed', () => {
    const { context, frame, view, cancelFrame, meadow } = phone()
    const remove = vi.spyOn(meadow, 'removeEventListener')
    FakeIntersectionObserver.latest?.([{ isIntersecting: false }])
    frame(1000)
    expect(context.clearRect).not.toHaveBeenCalled()
    FakeIntersectionObserver.latest?.([])
    document.dispatchEvent(new Event('visibilitychange'))
    frame(1016)
    expect(context.clearRect).toHaveBeenCalledTimes(1)
    view.unmount()
    expect(cancelFrame).toHaveBeenCalled()
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function))
  })

  it('does not listen when still, and redraws the still frame on resize', () => {
    const { context, measure } = withCanvas()
    const meadow = boxed({ x: 0, y: 56, width: 360, height: 300 })
    // Watched from before it mounts, so a listener added while mounting would be caught.
    const add = vi.spyOn(meadow, 'addEventListener')
    render(<HeroField still meadow={{ current: meadow }} />)
    expect(add).not.toHaveBeenCalled()
    measure.mockReturnValue(DOMRect.fromRect({ width: 402, height: 874 }))
    FakeResizeObserver.latest?.()
    expect(context.clearRect).toHaveBeenLastCalledWith(0, 0, 402, 874)
  })

  it('only measures a moving field on resize; the next frame draws it', () => {
    const { context } = phone()
    FakeResizeObserver.latest?.()
    expect(context.clearRect).not.toHaveBeenCalled()
  })

  it('caps the pixel ratio at 2x, and treats a missing one as 1x', () => {
    withCanvas()
    vi.stubGlobal('devicePixelRatio', 3)
    const props = { meadow: { current: null } }
    const { container, unmount } = render(<HeroField still {...props} />)
    expect(container.querySelector('canvas')?.width).toBe(720)
    unmount()
    vi.stubGlobal('devicePixelRatio', 0)
    const again = render(<HeroField still {...props} />)
    expect(again.container.querySelector('canvas')?.width).toBe(360)
  })

  it('draws without halos where an offscreen canvas can’t be drawn', () => {
    const { context, getContext } = withCanvas()
    getContext
      .mockReturnValueOnce(context as unknown as CanvasRenderingContext2D)
      .mockReturnValueOnce(null)
    render(<HeroField still meadow={{ current: null }} />)
    expect(context.drawImage).not.toHaveBeenCalled()
    expect(context.fill).toHaveBeenCalled()
  })
})
