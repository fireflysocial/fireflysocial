import type { Account, AccountService, LinkFailure } from '../data/account.ts'
import type { Profile } from '../lib/profile.ts'

export const TEST_ACCOUNT: Account = { userId: 'user-1', email: 'alex@example.com' }

interface Options {
  account?: Account | null
  profile?: Profile | null
}

/**
 * An in-memory account service for component tests: the module boundary the app talks to (CLAUDE.md
 * §6), so no Supabase internals are mocked. Flip `fail` to simulate a flaky network, and set
 * `holdLoad` to keep a profile load pending.
 */
export function fakeAccount({ account = null, profile = null }: Options = {}) {
  let current = account
  const profiles = new Map<string, Profile>()
  if (account && profile) profiles.set(account.userId, profile)
  const cache = new Map(profiles)
  const listeners = new Set<(account: Account | null) => void>()
  const fail: {
    sendLink: LinkFailure | null
    loadProfile: boolean
    saveProfile: boolean
    deleteAccount: boolean
  } = {
    sendLink: null,
    loadProfile: false,
    saveProfile: false,
    deleteAccount: false,
  }
  const sent: { email: string; redirectTo: string }[] = []
  let releaseLoad: (() => void) | null = null
  const control = { holdLoad: false }

  const setAccount = (next: Account | null) => {
    current = next
    for (const listener of listeners) listener(next)
  }

  const service: AccountService = {
    watch(listener) {
      listeners.add(listener)
      listener(current)
      return () => {
        listeners.delete(listener)
      }
    },
    sendLink(email, redirectTo) {
      sent.push({ email, redirectTo })
      return Promise.resolve(fail.sendLink ? { ok: false, reason: fail.sendLink } : { ok: true })
    },
    signOut() {
      cache.clear()
      setAccount(null)
      return Promise.resolve()
    },
    cachedProfile: (userId) => cache.get(userId) ?? null,
    async loadProfile(userId) {
      if (control.holdLoad) {
        await new Promise<void>((resolve) => {
          releaseLoad = resolve
        })
      }
      if (fail.loadProfile) throw new Error('offline')
      return profiles.get(userId) ?? null
    },
    saveProfile(userId, next) {
      if (fail.saveProfile) return Promise.reject(new Error('offline'))
      profiles.set(userId, next)
      cache.set(userId, next)
      return Promise.resolve()
    },
    deleteAccount() {
      if (fail.deleteAccount) return Promise.reject(new Error('offline'))
      if (current) profiles.delete(current.userId)
      cache.clear()
      setAccount(null)
      return Promise.resolve()
    },
  }

  return {
    service,
    fail,
    control,
    sent,
    profiles,
    cache,
    signIn: setAccount,
    /** What opening the emailed link does: the person comes back signed in. */
    openLink: (email: string) => {
      setAccount({ userId: `user-${email}`, email })
    },
    release: () => releaseLoad?.(),
    current: () => current,
  }
}

export type FakeAccount = ReturnType<typeof fakeAccount>
