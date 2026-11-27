import { parsePlans, type Plans } from '../lib/plans.ts'
import { readStored, removeStored, writeStored } from '../lib/platform/index.ts'

/**
 * Saved events, feedback and the going list. STUB storage: on this device only, until the
 * owner-only tables (with RLS and expiry) exist. The going list is sensitive (CLAUDE.md §8.14).
 */
const KEY = 'firefly.plans.v1'

export function loadPlans(): Plans {
  return parsePlans(readStored(KEY))
}

export function savePlans(plans: Plans): boolean {
  return writeStored(KEY, plans)
}

export function deletePlans(): void {
  removeStored(KEY)
}
