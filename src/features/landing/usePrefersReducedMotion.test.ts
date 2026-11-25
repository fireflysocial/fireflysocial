import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.ts'

function stubMatchMedia(initial: boolean) {
  let matches = initial
  const listeners = new Set<() => void>()
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      get matches() {
        return matches
      },
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    })),
  )
  return (next: boolean) => {
    matches = next
    for (const listener of listeners) listener()
  }
}

describe('usePrefersReducedMotion', () => {
  it('is false when the browser has no matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(false)
  })

  it('reflects the visitor’s setting', () => {
    stubMatchMedia(true)
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(true)
  })

  it('updates when the setting changes', () => {
    const change = stubMatchMedia(false)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
    act(() => {
      change(true)
    })
    expect(result.current).toBe(true)
  })
})
