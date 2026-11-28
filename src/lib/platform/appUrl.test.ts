import { describe, expect, it } from 'vitest'
import { appUrl, linkErrorIn } from './appUrl.ts'

describe('appUrl', () => {
  it('builds a full address on this site', () => {
    expect(appUrl('/app/sign-in')).toBe(`${window.location.origin}/app/sign-in`)
  })
})

describe('linkErrorIn', () => {
  it('reads why a sign-in link failed', () => {
    expect(
      linkErrorIn(
        '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid',
      ),
    ).toBe('otp_expired')
    expect(linkErrorIn('#error=access_denied')).toBe('access_denied')
  })

  it('is null for anything else', () => {
    expect(linkErrorIn('')).toBeNull()
    expect(linkErrorIn('#start')).toBeNull()
  })
})
