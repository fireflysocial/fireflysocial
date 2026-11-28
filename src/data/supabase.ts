import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { SupabaseConfig } from '../lib/env.ts'
import { authStorage } from '../lib/platform/index.ts'
import type { Database } from '../types/database.ts'

export type FireflyClient = SupabaseClient<Database>

/** Where supabase-js keeps the session, so signing out and deleting can clear it. */
export const AUTH_STORAGE_KEY = 'firefly.auth'

/**
 * The Supabase client. Only the publishable key ever reaches the app (CLAUDE.md §7). Sign-in is an
 * emailed link that comes back with the session in the URL (the implicit flow, so the link works
 * even when the email app opens it in a different browser from the one that asked for it); the
 * client reads it from the URL, checks it with the server and clears it. The session is kept
 * through the pluggable storage adapter in src/lib/platform (CLAUDE.md §9). `fetch` is injectable
 * so tests can answer at the HTTP boundary without a network.
 */
export function createSupabase(config: SupabaseConfig, fetchImpl?: typeof fetch): FireflyClient {
  return createClient<Database>(config.url, config.key, {
    auth: {
      storage: authStorage,
      storageKey: AUTH_STORAGE_KEY,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
    },
    ...(fetchImpl ? { global: { fetch: fetchImpl } } : {}),
  })
}
