import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useClock } from './clock.ts'

describe('useClock', () => {
  it('reads the real time when no clock is provided', () => {
    vi.useFakeTimers({ now: new Date('2026-12-03T17:00:00Z') })
    const { result } = renderHook(() => useClock())
    expect(result.current().toISOString()).toBe('2026-12-03T17:00:00.000Z')
    vi.useRealTimers()
  })
})
