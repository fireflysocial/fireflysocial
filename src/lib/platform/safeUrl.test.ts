import { describe, expect, it } from 'vitest'
import { toSafeHttpUrl } from './safeUrl.ts'

describe('toSafeHttpUrl', () => {
  it('keeps https and http URLs', () => {
    expect(toSafeHttpUrl('https://example.com/event?id=1')).toBe('https://example.com/event?id=1')
    expect(toSafeHttpUrl('http://example.com')).toBe('http://example.com/')
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,hi',
    'intent://x',
    'mailto:a@example.com',
    'not a url',
    '',
  ])('rejects %s', (raw) => {
    expect(toSafeHttpUrl(raw)).toBeNull()
  })
})
