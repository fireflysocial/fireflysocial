import { describe, expect, it } from 'vitest'
import { checkHandle, checkPromptAnswer, isPrompt, isSocialNetwork, PROMPTS } from './answers.ts'

describe('prompt answers', () => {
  it('accepts a short answer, tidying spaces', () => {
    expect(checkPromptAnswer('  variable   fonts ')).toEqual({ ok: true, value: 'variable fonts' })
  })

  it('needs something, under 80 characters', () => {
    expect(checkPromptAnswer('   ')).toEqual({ ok: false, error: 'Write a short answer.' })
    expect(checkPromptAnswer('x'.repeat(81))).toEqual({
      ok: false,
      error: 'Keep it under 80 characters.',
    })
  })

  it.each([
    'find me @sam',
    'sam@example.com',
    'see example.com',
    'https://x.y',
    'www.site',
    'call 604 555 0199',
  ])('refuses contact details: %s', (raw) => {
    expect(checkPromptAnswer(raw).ok).toBe(false)
  })

  it('knows its prompts', () => {
    expect(PROMPTS.every(isPrompt)).toBe(true)
    expect(isPrompt('Your star sign')).toBe(false)
  })
})

describe('social handles', () => {
  it('normalises Instagram names', () => {
    expect(checkHandle('instagram', ' @sam.makes ')).toEqual({ ok: true, value: '@sam.makes' })
    expect(checkHandle('instagram', 'sam_makes')).toEqual({ ok: true, value: '@sam_makes' })
    expect(checkHandle('instagram', 'not valid!').ok).toBe(false)
  })

  it('normalises LinkedIn profiles', () => {
    expect(checkHandle('linkedin', 'https://www.linkedin.com/in/sam-lee/')).toEqual({
      ok: true,
      value: 'linkedin.com/in/sam-lee',
    })
    expect(checkHandle('linkedin', 'sam-lee')).toEqual({
      ok: true,
      value: 'linkedin.com/in/sam-lee',
    })
    expect(checkHandle('linkedin', 'x').ok).toBe(false)
  })

  it('knows its networks', () => {
    expect(isSocialNetwork('linkedin')).toBe(true)
    expect(isSocialNetwork('myspace')).toBe(false)
  })
})
