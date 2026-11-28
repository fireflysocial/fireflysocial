import { isAuthApiError, isAuthRetryableFetchError, type User } from '@supabase/supabase-js'
import { parseSupabaseConfig } from '../lib/env.ts'
import { readStored, removeStored, writeStored } from '../lib/platform/index.ts'
import { parseProfile, type Profile } from '../lib/profile.ts'
import type { Tables, TablesInsert } from '../types/database.ts'
import { createSupabase, type FireflyClient } from './supabase.ts'

/** The signed-in person, as the app needs it. The email is shown back to them, nowhere else. */
export interface Account {
  userId: string
  email: string | null
}

export type LinkFailure = 'rate-limited' | 'network' | 'unavailable'
export type LinkResult = { ok: true } | { ok: false; reason: LinkFailure }

/**
 * Accounts and profiles. The app talks to this interface, never to Supabase directly, so screens
 * and tests can swap in a fake. Profile calls throw when they fail (offline, server error): the
 * caller shows a retry, and saving is an upsert, so retrying is always safe.
 */
export interface AccountService {
  /** Calls `listener` with the current account straight away, then on every change. */
  watch(listener: (account: Account | null) => void): () => void
  /**
   * Emails a sign-in link that comes back to `redirectTo`, where the client picks the session up
   * from the URL and `watch` reports the account. Signing up and logging in are the same step, so
   * nobody can use this to find out whether an email address has an account.
   */
  sendLink(email: string, redirectTo: string): Promise<LinkResult>
  signOut(): Promise<void>
  /** The profile last loaded or saved on this device for this account, read synchronously so
   *  the app opens straight away, and works offline at an event. */
  cachedProfile(userId: string): Profile | null
  /** The person's profile from the server, or null if they haven't finished onboarding. */
  loadProfile(userId: string): Promise<Profile | null>
  saveProfile(userId: string, profile: Profile): Promise<void>
  /** Deletes the account and everything stored with it, then signs out. */
  deleteAccount(): Promise<void>
}

type ProfileRow = Tables<'profiles'>

export function profileToRow(userId: string, p: Profile): TablesInsert<'profiles'> {
  return {
    id: userId,
    first_name: p.firstName,
    city_id: p.cityId,
    intents: p.intents,
    work_area: p.workArea,
    project_roles: p.projectRoles,
    project_stage: p.projectStage,
    interests: p.interests,
    event_style: p.eventStyle,
    group_size: p.groupSize,
    approach: p.approach,
    languages: p.languages,
    learning: p.learning,
    free_times: p.freeTimes,
    pace: p.pace,
    neighbourhoods: p.neighbourhoods,
    budget: p.budget,
    newcomer: p.newcomer,
    access_needs: p.accessNeeds,
    pledged_at: p.pledgedAt,
  }
}

/**
 * Reads a row back into a profile. A row this version of the app can't read (an option added by
 * a newer version, say) counts as no profile, so the person answers again rather than seeing a
 * broken screen.
 */
export function profileFromRow(row: ProfileRow): Profile | null {
  return parseProfile({
    firstName: row.first_name,
    cityId: row.city_id,
    intents: row.intents,
    workArea: row.work_area,
    projectRoles: row.project_roles,
    projectStage: row.project_stage,
    interests: row.interests,
    eventStyle: row.event_style,
    groupSize: row.group_size,
    approach: row.approach,
    languages: row.languages,
    learning: row.learning,
    freeTimes: row.free_times,
    pace: row.pace,
    neighbourhoods: row.neighbourhoods,
    budget: row.budget,
    newcomer: row.newcomer,
    accessNeeds: row.access_needs,
    pledgedAt: row.pledged_at,
  })
}

/** The device copy of the person's own profile. Cleared on signing out and deleting. */
export const PROFILE_CACHE_KEY = 'firefly.profile.v2'

function readCache(userId: string): Profile | null {
  const raw = readStored(PROFILE_CACHE_KEY)
  if (typeof raw !== 'object' || raw === null) return null
  const { userId: owner, profile }: Record<string, unknown> = { ...raw }
  return owner === userId ? parseProfile(profile) : null
}

function writeCache(userId: string, profile: Profile | null): void {
  if (profile) writeStored(PROFILE_CACHE_KEY, { userId, profile })
  else removeStored(PROFILE_CACHE_KEY)
}

const toAccount = (user: User): Account => ({ userId: user.id, email: user.email ?? null })

function linkFailure(error: unknown): LinkFailure {
  if (isAuthRetryableFetchError(error)) return 'network'
  if (isAuthApiError(error) && error.status === 429) return 'rate-limited'
  return 'unavailable'
}

export function supabaseAccount(client: FireflyClient): AccountService {
  return {
    watch(listener) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        listener(session ? toAccount(session.user) : null)
      })
      return () => {
        data.subscription.unsubscribe()
      }
    },

    async sendLink(email, redirectTo) {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
      })
      return error ? { ok: false, reason: linkFailure(error) } : { ok: true }
    },

    async signOut() {
      removeStored(PROFILE_CACHE_KEY)
      // Local scope: this device signs out even when offline.
      await client.auth.signOut({ scope: 'local' })
    },

    cachedProfile: readCache,

    async loadProfile(userId) {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      if (error) throw new Error('Could not load the profile')
      const profile = data && profileFromRow(data)
      writeCache(userId, profile)
      return profile
    },

    async saveProfile(userId, profile) {
      const { error } = await client.from('profiles').upsert(profileToRow(userId, profile))
      if (error) throw new Error('Could not save the profile')
      writeCache(userId, profile)
    },

    async deleteAccount() {
      const { error } = await client.rpc('delete_my_account')
      if (error) throw new Error('Could not delete the account')
      removeStored(PROFILE_CACHE_KEY)
      await client.auth.signOut({ scope: 'local' })
    },
  }
}

/** When Supabase isn't configured (no .env.local): nobody is signed in and links can't be sent. */
export const unavailableAccount: AccountService = {
  watch(listener) {
    listener(null)
    return () => undefined
  },
  sendLink: () => Promise.resolve({ ok: false, reason: 'unavailable' }),
  signOut: () => Promise.resolve(),
  cachedProfile: () => null,
  loadProfile: () => Promise.reject(new Error('Accounts are not configured')),
  saveProfile: () => Promise.reject(new Error('Accounts are not configured')),
  deleteAccount: () => Promise.reject(new Error('Accounts are not configured')),
}

export function accountFromEnv(env: Record<string, unknown>): AccountService {
  const config = parseSupabaseConfig(env)
  return config ? supabaseAccount(createSupabase(config)) : unavailableAccount
}

let shared: AccountService | null = null

/** The app's one account service, built from the environment on first use. */
export function defaultAccount(): AccountService {
  shared ??= accountFromEnv(import.meta.env)
  return shared
}
