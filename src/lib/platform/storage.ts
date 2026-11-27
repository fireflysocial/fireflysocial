/**
 * Small on-device storage for the person's own answers and plans, until accounts exist. Uses
 * localStorage, which works in the browser and in the iOS and Android web views; it moves to
 * secure native storage when auth lands (CLAUDE.md §9). Every read and write is guarded: storage
 * can be full, blocked (private browsing) or hold damaged data, and the app must still work.
 */
export function readStored(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return parsed
  } catch {
    return null
  }
}

/** Returns false if the value couldn't be stored; the app keeps working from memory. */
export function writeStored(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStored(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Nothing to remove if storage is unavailable.
  }
}
