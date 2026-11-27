import { afterEach, describe, expect, it, vi } from 'vitest'
import { readStored, removeStored, writeStored } from './storage.ts'

afterEach(() => {
  localStorage.clear()
})

describe('device storage', () => {
  it('writes, reads and removes JSON', () => {
    expect(writeStored('k', { a: 1 })).toBe(true)
    expect(readStored('k')).toEqual({ a: 1 })
    removeStored('k')
    expect(readStored('k')).toBeNull()
  })

  it('reads damaged data as nothing', () => {
    localStorage.setItem('k', '{not json')
    expect(readStored('k')).toBeNull()
  })

  it('keeps working when storage is blocked or full', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    expect(writeStored('k', 1)).toBe(false)
    expect(readStored('k')).toBeNull()
    expect(() => {
      removeStored('k')
    }).not.toThrow()
  })
})
