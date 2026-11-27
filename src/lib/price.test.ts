import { describe, expect, it } from 'vitest'
import { formatPrice } from './price.ts'

describe('formatPrice', () => {
  it('says Free for nothing to pay', () => {
    expect(formatPrice(0, 'CAD', 'en-CA')).toBe('Free')
  })

  it('shows whole amounts without cents and other amounts with them', () => {
    expect(formatPrice(12, 'CAD', 'en-CA')).toBe('$12')
    expect(formatPrice(12.5, 'AUD', 'en-AU')).toBe('$12.50')
  })

  it('uses the city’s currency and locale', () => {
    expect(formatPrice(8, 'EUR', 'de-DE')).toBe('8\u00a0€')
  })
})
