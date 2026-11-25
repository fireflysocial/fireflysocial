import { describe, expect, it } from 'vitest'
import { checkEmail } from './email.ts'

describe('checkEmail', () => {
  it('accepts a normal address and trims it', () => {
    expect(checkEmail('  sam@example.ca ')).toEqual({ ok: true, email: 'sam@example.ca' })
  })

  it('lower-cases the domain but keeps the name as typed', () => {
    expect(checkEmail('Sam.Lee@Example.CA')).toEqual({ ok: true, email: 'Sam.Lee@example.ca' })
  })

  it('asks for an address when the field is empty', () => {
    expect(checkEmail('   ')).toEqual({ ok: false, error: 'Enter your email address.' })
  })

  it.each(['sam', 'sam@', '@example.ca', 'sam@example', 'sam @example.ca', 'sam@example..ca'])(
    'rejects %s',
    (input) => {
      expect(checkEmail(input).ok).toBe(false)
    },
  )

  it('rejects addresses longer than 254 characters', () => {
    expect(checkEmail(`${'a'.repeat(250)}@example.ca`).ok).toBe(false)
  })
})
