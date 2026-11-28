export interface SupabaseConfig {
  url: string
  /** The publishable (anon) key. Public by design: RLS is the security boundary (CLAUDE.md §7). */
  key: string
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

/**
 * Reads the Supabase settings from the build's environment (VITE_SUPABASE_URL and
 * VITE_SUPABASE_PUBLISHABLE_KEY in .env.local). Returns null when they're missing or wrong, so the
 * app can say that accounts aren't available instead of failing somewhere deeper. Plain http is
 * only accepted for a local Supabase on this machine.
 */
export function parseSupabaseConfig(env: Record<string, unknown>): SupabaseConfig | null {
  const { VITE_SUPABASE_URL: rawUrl, VITE_SUPABASE_PUBLISHABLE_KEY: rawKey } = env
  if (typeof rawUrl !== 'string' || typeof rawKey !== 'string') return null
  const key = rawKey.trim()
  let url: URL
  try {
    url = new URL(rawUrl.trim())
  } catch {
    return null
  }
  const secure = url.protocol === 'https:'
  const local = url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname)
  if (key === '' || !(secure || local)) return null
  return { url: url.origin, key }
}
