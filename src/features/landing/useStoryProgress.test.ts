import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useStoryProgress } from './useStoryProgress.ts'

const VIEWPORT = 800
const SECTION = 4000 // 5 screens of 800px: 3200px of scroll through the story

function sectionAt(top: number) {
  const element = document.createElement('section')
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(
    DOMRect.fromRect({ x: 0, y: top, width: 400, height: SECTION }),
  )
  return element
}

describe('useStoryProgress', () => {
  it('starts at the opening chapter', () => {
    vi.stubGlobal('innerHeight', VIEWPORT)
    const section = { current: sectionAt(0) }
    const { result } = renderHook(() => useStoryProgress(section))
    expect(result.current.chapter).toBe(0)
    expect(result.current.week).toBe(1)
    expect(result.current.progress.current).toBe(0)
  })

  it('follows the visitor as they scroll', () => {
    vi.stubGlobal('innerHeight', VIEWPORT)
    const section = { current: sectionAt(0) }
    const { result } = renderHook(() => useStoryProgress(section))

    section.current = sectionAt(-1600)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.progress.current).toBe(0.5)
    expect(result.current.chapter).toBe(2)

    section.current = sectionAt(-3200)
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.chapter).toBe(4)
    expect(result.current.week).toBe(4)
  })

  it('stops listening when unmounted', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const section = { current: sectionAt(0) }
    renderHook(() => useStoryProgress(section)).unmount()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('does nothing without a section', () => {
    const { result } = renderHook(() => useStoryProgress({ current: null }))
    expect(result.current.chapter).toBe(0)
  })
})
