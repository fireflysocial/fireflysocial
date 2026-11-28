import { afterEach, describe, expect, it, vi } from 'vitest'
import { authStorage } from './authStorage.ts'

describe('authStorage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('stores, reads and removes raw strings', () => {
    authStorage.setItem('k', '{"a":1}')
    expect(authStorage.getItem('k')).toBe('{"a":1}')
    authStorage.removeItem('k')
    expect(authStorage.getItem('k')).toBeNull()
  })

  it('keeps working when storage is blocked', () => {
    const fail = () => {
      throw new Error('blocked')
    }
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(fail)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(fail)
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(fail)
    expect(() => {
      authStorage.setItem('k', 'v')
      authStorage.removeItem('k')
    }).not.toThrow()
    expect(authStorage.getItem('k')).toBeNull()
  })
})
