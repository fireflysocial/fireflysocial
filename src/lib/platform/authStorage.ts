/**
 * Where the sign-in session lives: the storage adapter handed to supabase-js (CLAUDE.md §9). It
 * uses localStorage for now, which works in the browser and in the iOS and Android web views; it
 * can move to secure native storage (Keychain / Keystore) by swapping this one object. Every call
 * is guarded: storage can be full or blocked, and signing in must still work for the session.
 */
export const authStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch {
      // The session stays in memory; the person signs in again next time.
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // Nothing to remove if storage is unavailable.
    }
  },
}
