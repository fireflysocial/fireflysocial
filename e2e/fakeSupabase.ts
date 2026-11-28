import type { Page, Route } from '@playwright/test'

// A stand-in for Supabase at the HTTP boundary, so the E2E suite needs no database. It answers
// the few calls the app makes (send a sign-in link, check the session the link brings back,
// profile read/upsert, delete account) from memory, per page. What the real database allows is
// covered by the pgTAP tests.

const USER_ID = '11111111-1111-4111-8111-111111111111'

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'access-control-expose-headers': '*',
}

function session(email: string) {
  return {
    access_token: 'e2e-access-token',
    refresh_token: 'e2e-refresh-token',
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
  }
}

async function reply(route: Route, status: number, body?: unknown) {
  await route.fulfill({
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
    body: body === undefined ? '' : JSON.stringify(body),
  })
}

export interface FakeSupabase {
  /** Profile rows by user id, as the database would hold them. */
  rows: Map<string, Record<string, unknown>>
  /** Sign-in links sent: who to, and where the link leads back to. */
  sent: { email: string; redirectTo: string | null }[]
}

/** Where the emailed link takes the person: back to the app, with the session in the hash. */
export function openLink(sent: FakeSupabase['sent'][number]): string {
  const { access_token, refresh_token, expires_in, expires_at } = session(sent.email)
  const hash = new URLSearchParams({
    access_token,
    refresh_token,
    expires_in: String(expires_in),
    expires_at: String(expires_at),
    token_type: 'bearer',
    type: 'magiclink',
  })
  return `${sent.redirectTo ?? '/'}#${hash.toString()}`
}

/** Answers Supabase calls from `page` in memory. Matches any host, so a real URL is never hit. */
export async function fakeSupabase(page: Page): Promise<FakeSupabase> {
  const state: FakeSupabase = { rows: new Map(), sent: [] }

  await page.route('**/auth/v1/**', async (route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS') return reply(route, 204)
    const path = new URL(request.url()).pathname
    const body: unknown = request.postDataJSON()
    const fields = typeof body === 'object' && body !== null ? { ...body } : {}
    const email = 'email' in fields && typeof fields.email === 'string' ? fields.email : ''
    if (path.endsWith('/otp')) {
      state.sent.push({ email, redirectTo: new URL(request.url()).searchParams.get('redirect_to') })
      return reply(route, 200, {})
    }
    if (path.endsWith('/user') && request.method() === 'GET') {
      const last = state.sent.at(-1)
      return reply(route, 200, session(last?.email ?? 'alex@example.com').user)
    }
    if (path.endsWith('/logout')) return reply(route, 204)
    return reply(route, 404, { msg: 'not faked' })
  })

  await page.route('**/rest/v1/**', async (route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS') return reply(route, 204)
    const path = new URL(request.url()).pathname
    if (path.endsWith('/rpc/delete_my_account')) {
      state.rows.delete(USER_ID)
      return reply(route, 204)
    }
    if (path.endsWith('/profiles') && request.method() === 'GET') {
      const row = state.rows.get(USER_ID)
      return reply(route, 200, row ? [row] : [])
    }
    if (path.endsWith('/profiles') && request.method() === 'POST') {
      const row: unknown = request.postDataJSON()
      if (typeof row === 'object' && row !== null) state.rows.set(USER_ID, { ...row })
      return reply(route, 201)
    }
    return reply(route, 404, { message: 'not faked' })
  })

  return state
}

/** Starts the page already signed in, with this profile row saved. */
export async function signedInWith(page: Page, row: Record<string, unknown>) {
  const state = await fakeSupabase(page)
  state.rows.set(USER_ID, { id: USER_ID, ...row })
  const stored = JSON.stringify(session('alex@example.com'))
  await page.addInitScript((value) => {
    if (!localStorage.getItem('firefly.auth')) localStorage.setItem('firefly.auth', value)
  }, stored)
  return state
}
