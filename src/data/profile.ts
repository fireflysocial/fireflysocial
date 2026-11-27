import { parseProfile, type Profile } from '../lib/profile.ts'
import { readStored, removeStored, writeStored } from '../lib/platform/index.ts'

/**
 * The person's onboarding answers. STUB storage: kept on this device only, until accounts and the
 * profiles table exist (phone sign-up, v4 step 2). Nothing is sent anywhere.
 */
const KEY = 'firefly.profile.v1'

export function loadProfile(): Profile | null {
  return parseProfile(readStored(KEY))
}

export function saveProfile(profile: Profile): boolean {
  return writeStored(KEY, profile)
}

export function deleteProfile(): void {
  removeStored(KEY)
}
