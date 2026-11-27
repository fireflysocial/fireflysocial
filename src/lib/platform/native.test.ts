import { Capacitor } from '@capacitor/core'
import { describe, expect, it, vi } from 'vitest'
import { isNativeApp } from './native.ts'

describe('isNativeApp', () => {
  it('is false in a browser', () => {
    expect(isNativeApp()).toBe(false)
  })

  it('is true inside the native apps', () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true)
    expect(isNativeApp()).toBe(true)
  })
})
