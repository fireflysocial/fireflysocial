import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeProfile } from '../test/fixtures.ts'
import {
  accountFromEnv,
  defaultAccount,
  PROFILE_CACHE_KEY,
  profileFromRow,
  profileToRow,
  supabaseAccount,
  unavailableAccount,
  type Account,
  type AccountService,
} from './account.ts'
import { AUTH_STORAGE_KEY, createSupabase } from './supabase.ts'

// These tests run the real supabase-js client and answer it at the HTTP boundary, so nothing
// inside Supabase is mocked (CLAUDE.md §6). What the database allows is tested in pgTAP.

const URL_BASE = 'http://127.0.0.1:54321'
const USER_ID = '11111111-1111-4111-8111-111111111111'
const profile = makeProfile({ cityId: 'vancouver', intents: ['friends'], languages: ['english'] })

interface Seen {
  method: string
  path: string
  query: URLSearchParams
  body: unknown
}

type Reply = { status: number; body?: unknown } | 'offline'

function json(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/** A fake Supabase: `routes` maps "METHOD /path" to a reply; everything is recorded. */
function fakeServer(routes: Record<string, Reply>) {
  const seen: Seen[] = []
  const fetchImpl = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    const method = init?.method ?? 'GET'
    const body: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : null
    seen.push({ method, path: url.pathname, query: url.searchParams, body })
    const reply = routes[`${method} ${url.pathname}`] ?? { status: 404, body: { message: 'nope' } }
    if (reply === 'offline') return Promise.reject(new TypeError('Failed to fetch'))
    return Promise.resolve(json(reply.status, reply.body))
  })
  const client = createSupabase({ url: URL_BASE, key: 'sb_publishable_test' }, fetchImpl)
  return { account: supabaseAccount(client), seen, client }
}

const session = (email: string) => ({
  access_token: 'access',
  refresh_token: 'refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: {
    id: USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email,
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-11-28T00:00:00Z',
  },
})

const row = { ...profileToRow(USER_ID, profile), created_at: 'x', updated_at: 'y' }

/** Waits for the `skip`-th account the service reports, or with `signedInOnly` the first one. */
function nextAccount(account: AccountService, skip = 0, signedInOnly = false) {
  return new Promise<Account | null>((resolve) => {
    let calls = 0
    const stop = account.watch((value) => {
      if (signedInOnly ? value !== null : calls++ === skip) {
        resolve(value)
        queueMicrotask(stop)
      }
    })
  })
}

afterEach(() => {
  localStorage.clear()
})

describe('profile rows', () => {
  it('round-trips a profile through a database row', () => {
    expect(row).toMatchObject({
      id: USER_ID,
      first_name: 'Alex',
      city_id: 'vancouver',
      languages: ['english'],
    })
    expect(profileFromRow({ ...row, ...requiredDefaults(row) })).toEqual(profile)
  })

  it('treats a row this version can’t read as no profile', () => {
    expect(profileFromRow({ ...row, ...requiredDefaults(row), work_area: 'astronaut' })).toBeNull()
  })
})

/** profileToRow fills every column; this just satisfies the Row type's non-optional fields. */
function requiredDefaults(r: typeof row) {
  return {
    intents: r.intents ?? [],
    project_roles: r.project_roles ?? [],
    languages: r.languages ?? [],
    learning: r.learning ?? [],
    free_times: r.free_times ?? [],
    neighbourhoods: r.neighbourhoods ?? [],
    budget: r.budget ?? 'low',
    access_needs: r.access_needs ?? [],
    work_area: r.work_area ?? null,
    project_stage: r.project_stage ?? null,
    event_style: r.event_style ?? null,
    group_size: r.group_size ?? null,
    approach: r.approach ?? null,
    pace: r.pace ?? null,
    newcomer: r.newcomer ?? null,
  }
}

describe('sign-in links', () => {
  const back = 'http://localhost:5173/app/sign-in'

  it('emails a link back to the app, creating the account if it’s new', async () => {
    const { account, seen } = fakeServer({ 'POST /auth/v1/otp': { status: 200, body: {} } })
    expect(await account.sendLink('sam@example.com', back)).toEqual({ ok: true })
    expect(seen[0]).toMatchObject({
      path: '/auth/v1/otp',
      body: { email: 'sam@example.com', create_user: true },
    })
    expect(seen[0]?.query.get('redirect_to')).toBe(back)
  })

  it('says when sending is rate-limited, offline, or failed', async () => {
    const limited = fakeServer({
      'POST /auth/v1/otp': {
        status: 429,
        body: { code: 'over_email_send_rate_limit', msg: 'slow down' },
      },
    })
    expect(await limited.account.sendLink('a@example.com', back)).toEqual({
      ok: false,
      reason: 'rate-limited',
    })
    const offline = fakeServer({ 'POST /auth/v1/otp': 'offline' })
    expect(await offline.account.sendLink('a@example.com', back)).toEqual({
      ok: false,
      reason: 'network',
    })
    const broken = fakeServer({ 'POST /auth/v1/otp': { status: 400, body: { msg: 'bad' } } })
    expect(await broken.account.sendLink('a@example.com', back)).toEqual({
      ok: false,
      reason: 'unavailable',
    })
  })

  it('signs in when the person comes back from the link, and clears it from the address', async () => {
    const { account, seen } = backFromLink(session('sam@example.com').user)
    expect(await nextAccount(account, 0, true)).toEqual({
      userId: USER_ID,
      email: 'sam@example.com',
    })
    expect(seen.some((s) => s.path === '/auth/v1/user')).toBe(true)
    expect(window.location.hash).toBe('')
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).not.toBeNull()
  })

  it('reports an account without an email as null', async () => {
    const { account } = backFromLink({ ...session('x').user, email: undefined })
    expect(await nextAccount(account, 0, true)).toEqual({ userId: USER_ID, email: null })
  })
})

/** The browser as the emailed link leaves it: back on the app with the session in the hash. */
function backFromLink(user: unknown, routes: Record<string, Reply> = {}) {
  const { access_token, refresh_token, expires_in, expires_at } = session('x')
  window.location.hash = new URLSearchParams({
    access_token,
    refresh_token,
    expires_in: String(expires_in),
    expires_at: String(expires_at),
    token_type: 'bearer',
    type: 'magiclink',
  }).toString()
  return fakeServer({ 'GET /auth/v1/user': { status: 200, body: user }, ...routes })
}

describe('profiles', () => {
  async function signedIn(routes: Record<string, Reply>) {
    const server = backFromLink(session('sam@example.com').user, {
      'POST /auth/v1/logout': { status: 204 },
      ...routes,
    })
    await nextAccount(server.account, 0, true)
    return server
  }

  it('loads the profile and keeps a copy on this device', async () => {
    const { account, seen } = await signedIn({
      'GET /rest/v1/profiles': { status: 200, body: [row] },
    })
    expect(account.cachedProfile(USER_ID)).toBeNull()
    expect(await account.loadProfile(USER_ID)).toEqual(profile)
    expect(seen.at(-1)?.path).toBe('/rest/v1/profiles')
    expect(account.cachedProfile(USER_ID)).toEqual(profile)
    expect(account.cachedProfile('someone-else')).toBeNull()
  })

  it('returns null, and clears the copy, when there’s no profile yet', async () => {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ userId: USER_ID, profile }))
    const { account } = await signedIn({ 'GET /rest/v1/profiles': { status: 200, body: [] } })
    expect(await account.loadProfile(USER_ID)).toBeNull()
    expect(account.cachedProfile(USER_ID)).toBeNull()
  })

  it('throws when loading fails, keeping the device copy', async () => {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ userId: USER_ID, profile }))
    const { account } = await signedIn({
      'GET /rest/v1/profiles': { status: 500, body: { message: 'down' } },
    })
    await expect(account.loadProfile(USER_ID)).rejects.toThrow('Could not load')
    expect(account.cachedProfile(USER_ID)).toEqual(profile)
  })

  it('ignores a damaged device copy', async () => {
    const { account } = await signedIn({})
    localStorage.setItem(PROFILE_CACHE_KEY, '"profile"')
    expect(account.cachedProfile(USER_ID)).toBeNull()
  })

  it('saves with an upsert, so retrying is safe', async () => {
    const { account, seen } = await signedIn({ 'POST /rest/v1/profiles': { status: 201 } })
    await account.saveProfile(USER_ID, profile)
    expect(seen.at(-1)).toMatchObject({
      method: 'POST',
      path: '/rest/v1/profiles',
      body: profileToRow(USER_ID, profile),
    })
    expect(account.cachedProfile(USER_ID)).toEqual(profile)
  })

  it('throws when saving fails', async () => {
    const { account } = await signedIn({
      'POST /rest/v1/profiles': { status: 403, body: { code: '42501', message: 'denied' } },
    })
    await expect(account.saveProfile(USER_ID, profile)).rejects.toThrow('Could not save')
    expect(account.cachedProfile(USER_ID)).toBeNull()
  })

  it('signs out of this device, clearing the session and the copy', async () => {
    const { account } = await signedIn({ 'POST /rest/v1/profiles': { status: 201 } })
    await account.saveProfile(USER_ID, profile)
    const signedOut = nextAccount(account, 1)
    await account.signOut()
    expect(await signedOut).toBeNull()
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(PROFILE_CACHE_KEY)).toBeNull()
  })

  it('deletes the account through delete_my_account, then signs out', async () => {
    const { account, seen } = await signedIn({
      'POST /rest/v1/profiles': { status: 201 },
      'POST /rest/v1/rpc/delete_my_account': { status: 204 },
    })
    await account.saveProfile(USER_ID, profile)
    await account.deleteAccount()
    expect(seen.map((s) => s.path)).toContain('/rest/v1/rpc/delete_my_account')
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(PROFILE_CACHE_KEY)).toBeNull()
  })

  it('throws, and stays signed in, when deleting fails', async () => {
    const { account } = await signedIn({ 'POST /rest/v1/rpc/delete_my_account': 'offline' })
    await expect(account.deleteAccount()).rejects.toThrow('Could not delete')
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).not.toBeNull()
  })
})

describe('without Supabase settings', () => {
  it('nobody is signed in, codes fail honestly, and profile calls reject', async () => {
    const seen: (Account | null)[] = []
    const stop = unavailableAccount.watch((a) => seen.push(a))
    stop()
    expect(seen).toEqual([null])
    expect(await unavailableAccount.sendLink('a@example.com', 'http://localhost/')).toEqual({
      ok: false,
      reason: 'unavailable',
    })
    await expect(unavailableAccount.signOut()).resolves.toBeUndefined()
    expect(unavailableAccount.cachedProfile('x')).toBeNull()
    await expect(unavailableAccount.loadProfile('x')).rejects.toThrow('not configured')
    await expect(unavailableAccount.saveProfile('x', profile)).rejects.toThrow('not configured')
    await expect(unavailableAccount.deleteAccount()).rejects.toThrow('not configured')
  })

  it('is what the app uses when the environment has no settings', () => {
    expect(accountFromEnv({})).toBe(unavailableAccount)
    expect(
      accountFromEnv({ VITE_SUPABASE_URL: URL_BASE, VITE_SUPABASE_PUBLISHABLE_KEY: 'k' }),
    ).not.toBe(unavailableAccount)
  })

  it('builds the app’s account service once', () => {
    expect(defaultAccount()).toBe(defaultAccount())
  })
})
