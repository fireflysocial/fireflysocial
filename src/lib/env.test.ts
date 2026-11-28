import { describe, expect, it } from 'vitest'
import { parseSupabaseConfig } from './env.ts'

describe('parseSupabaseConfig', () => {
  it('accepts an https project URL and a key, trimmed', () => {
    expect(
      parseSupabaseConfig({
        VITE_SUPABASE_URL: ' https://abc.supabase.co/ ',
        VITE_SUPABASE_PUBLISHABLE_KEY: ' sb_publishable_x ',
      }),
    ).toEqual({ url: 'https://abc.supabase.co', key: 'sb_publishable_x' })
  })

  it('accepts plain http only for a local Supabase', () => {
    const key = { VITE_SUPABASE_PUBLISHABLE_KEY: 'k' }
    expect(parseSupabaseConfig({ ...key, VITE_SUPABASE_URL: 'http://127.0.0.1:54321' })).toEqual({
      url: 'http://127.0.0.1:54321',
      key: 'k',
    })
    expect(
      parseSupabaseConfig({ ...key, VITE_SUPABASE_URL: 'http://localhost:54321' }),
    ).not.toBeNull()
    expect(parseSupabaseConfig({ ...key, VITE_SUPABASE_URL: 'http://abc.supabase.co' })).toBeNull()
    expect(parseSupabaseConfig({ ...key, VITE_SUPABASE_URL: 'ftp://abc.supabase.co' })).toBeNull()
  })

  it.each([
    ['nothing', {}],
    ['no key', { VITE_SUPABASE_URL: 'https://abc.supabase.co' }],
    [
      'an empty key',
      { VITE_SUPABASE_URL: 'https://abc.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: ' ' },
    ],
    ['a broken URL', { VITE_SUPABASE_URL: 'not a url', VITE_SUPABASE_PUBLISHABLE_KEY: 'k' }],
  ])('rejects %s', (_label, env) => {
    expect(parseSupabaseConfig(env)).toBeNull()
  })
})
