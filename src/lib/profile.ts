import { isInterestId, MIN_INTERESTS, type InterestId } from './interests.ts'

/** "What brings you to Firefly?" (v4 step 5). Private; ranks the feed. */
export const INTENTS = [
  { id: 'friends', label: 'New friends', reason: 'new friends' },
  { id: 'network', label: 'A professional network', reason: 'a professional network' },
  { id: 'collaborators', label: 'Collaborators', reason: 'collaborators' },
  { id: 'cofounder', label: 'A co-founder', reason: 'a co-founder' },
  { id: 'events', label: 'Just good events', reason: 'good events' },
] as const
export type IntentId = (typeof INTENTS)[number]['id']

/** "When you're free" (v4 step 7). */
export const FREE_TIMES = [
  { id: 'weekday-evenings', label: 'Weekday evenings' },
  { id: 'weekend-days', label: 'Weekend days' },
  { id: 'weekend-evenings', label: 'Weekend evenings' },
] as const
export type FreeTimeId = (typeof FREE_TIMES)[number]['id']

/** Budget, defaulting to free or low cost (v3 #16). The cap comes from the city. */
export const BUDGETS = ['free', 'low', 'any'] as const
export type BudgetId = (typeof BUDGETS)[number]

/** Private accessibility needs, used only to rank and filter events (v3 #42). */
export const ACCESS_NEEDS = [
  { id: 'step-free', label: 'Step-free access', confirmed: 'Step-free, per the organiser' },
  { id: 'quieter', label: 'Quieter venues', confirmed: 'Quieter venue, per the organiser' },
  {
    id: 'captions',
    label: 'Captions or hearing support',
    confirmed: 'Captions or hearing support, per the organiser',
  },
] as const
export type AccessNeedId = (typeof ACCESS_NEEDS)[number]['id']

export interface Profile {
  firstName: string
  cityId: string
  intents: IntentId[]
  interests: InterestId[]
  freeTimes: FreeTimeId[]
  neighbourhoods: string[]
  budget: BudgetId
  /** "New to the city?": null when skipped. */
  newcomer: boolean | null
  accessNeeds: AccessNeedId[]
  /** When the person confirmed they're 18+ and took the respect pledge (ISO time). */
  pledgedAt: string
}

export const MAX_FIRST_NAME = 40

/** Trims a first name and checks it's 1–40 characters. Returns null if it isn't usable. */
export function cleanFirstName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, ' ')
  return name.length > 0 && name.length <= MAX_FIRST_NAME ? name : null
}

const ids = (list: readonly { id: string }[]) => new Set<string>(list.map((x) => x.id))
const INTENT_IDS = ids(INTENTS)
const FREE_TIME_IDS = ids(FREE_TIMES)
const ACCESS_IDS = ids(ACCESS_NEEDS)

function stringsIn<T extends string>(value: unknown, allowed: (v: unknown) => v is T): T[] | null {
  if (!Array.isArray(value)) return null
  const items: unknown[] = value
  return items.every(allowed) ? [...new Set(items)] : null
}

const isIntent = (v: unknown): v is IntentId => typeof v === 'string' && INTENT_IDS.has(v)
const isFreeTime = (v: unknown): v is FreeTimeId => typeof v === 'string' && FREE_TIME_IDS.has(v)
const isAccessNeed = (v: unknown): v is AccessNeedId => typeof v === 'string' && ACCESS_IDS.has(v)
const isString = (v: unknown): v is string => typeof v === 'string'
const isBudget = (v: unknown): v is BudgetId => BUDGETS.some((b) => b === v)

/**
 * Validates a stored profile. Anything stored on the device is untrusted input (it may be from an
 * older version or edited by hand), so a profile that doesn't match exactly is treated as missing.
 */
export function parseProfile(raw: unknown): Profile | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r: Record<string, unknown> = { ...raw }
  const firstName = typeof r.firstName === 'string' ? cleanFirstName(r.firstName) : null
  const intents = stringsIn(r.intents, isIntent)
  const interests = stringsIn(r.interests, isInterestId)
  const freeTimes = stringsIn(r.freeTimes, isFreeTime)
  const neighbourhoods = stringsIn(r.neighbourhoods, isString)
  const accessNeeds = stringsIn(r.accessNeeds, isAccessNeed)
  const newcomer = r.newcomer
  if (
    !firstName ||
    typeof r.cityId !== 'string' ||
    !intents ||
    !interests ||
    interests.length < MIN_INTERESTS ||
    !freeTimes ||
    !neighbourhoods ||
    !accessNeeds ||
    !isBudget(r.budget) ||
    !(newcomer === null || typeof newcomer === 'boolean') ||
    typeof r.pledgedAt !== 'string'
  ) {
    return null
  }
  return {
    firstName,
    cityId: r.cityId,
    intents,
    interests,
    freeTimes,
    neighbourhoods,
    budget: r.budget,
    newcomer,
    accessNeeds,
    pledgedAt: r.pledgedAt,
  }
}
