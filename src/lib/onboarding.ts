import { MIN_INTERESTS, type InterestId } from './interests.ts'
import {
  cleanFirstName,
  type AccessNeedId,
  type BudgetId,
  type FreeTimeId,
  type IntentId,
  type Profile,
} from './profile.ts'

/**
 * Onboarding (v4 §0): one job per screen, only the essentials required, ending on the feed.
 * Phone sign-up (v4 step 2) comes with the backend; until then answers stay on the device.
 */
export const STEPS = ['welcome', 'pledge', 'name', 'brings', 'interests', 'free', 'extras'] as const
export type StepId = (typeof STEPS)[number]

export interface Draft {
  adult: boolean
  pledge: boolean
  firstName: string
  intents: IntentId[]
  interests: InterestId[]
  freeTimes: FreeTimeId[]
  neighbourhoods: string[]
  budget: BudgetId
  newcomer: boolean | null
  accessNeeds: AccessNeedId[]
}

export function emptyDraft(): Draft {
  return {
    adult: false,
    pledge: false,
    firstName: '',
    intents: [],
    interests: [],
    freeTimes: [],
    neighbourhoods: [],
    // Free or low cost by default (v3 #16).
    budget: 'low',
    newcomer: null,
    accessNeeds: [],
  }
}

/** Someone changing their answers has already confirmed 18+ and the pledge. */
export function draftFromProfile(profile: Profile): Draft {
  return {
    adult: true,
    pledge: true,
    firstName: profile.firstName,
    intents: [...profile.intents],
    interests: [...profile.interests],
    freeTimes: [...profile.freeTimes],
    neighbourhoods: [...profile.neighbourhoods],
    budget: profile.budget,
    newcomer: profile.newcomer,
    accessNeeds: [...profile.accessNeeds],
  }
}

export function isStepId(value: unknown): value is StepId {
  return STEPS.some((step) => step === value)
}

/** Whether a step's required answers are in. Optional steps are always complete. */
export function stepComplete(step: StepId, draft: Draft): boolean {
  switch (step) {
    case 'pledge':
      return draft.adult && draft.pledge
    case 'name':
      return cleanFirstName(draft.firstName) !== null
    case 'interests':
      return draft.interests.length >= MIN_INTERESTS
    default:
      return true
  }
}

/** The first step with a missing required answer, or null when the draft is ready. */
export function firstIncompleteStep(draft: Draft): StepId | null {
  return STEPS.find((step) => !stepComplete(step, draft)) ?? null
}

/** Builds the profile from a finished draft. Throws if a required answer is missing. */
export function toProfile(draft: Draft, cityId: string, pledgedAt: string): Profile {
  const firstName = cleanFirstName(draft.firstName)
  if (!firstName || firstIncompleteStep(draft) !== null) {
    throw new Error('Onboarding is not finished')
  }
  return {
    firstName,
    cityId,
    intents: [...draft.intents],
    interests: [...draft.interests],
    freeTimes: [...draft.freeTimes],
    neighbourhoods: [...draft.neighbourhoods],
    budget: draft.budget,
    newcomer: draft.newcomer,
    accessNeeds: [...draft.accessNeeds],
    pledgedAt,
  }
}

/** Adds or removes one item from a list of picks. */
export function toggle<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}
