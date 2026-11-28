import { MIN_INTERESTS } from './interests.ts'
import {
  cleanFirstName,
  parseAnswers,
  pickAnswers,
  wantsProject,
  type Answers,
  type Profile,
} from './profile.ts'

/**
 * Onboarding, after sign-up: one question per screen, grouped into short sections with a progress
 * bar, ending on the feed. Only the pledge, a first name and three interests are required; every
 * other screen can be skipped. Screens that don't apply (the project questions, unless the person
 * wants a co-founder or collaborators) are left out.
 */
export const SECTIONS = ['basics', 'goals', 'into', 'meeting', 'time', 'extras'] as const
export type SectionId = (typeof SECTIONS)[number]

export const SECTION_LABELS: Record<SectionId, string> = {
  basics: 'About you',
  goals: 'What you’re after',
  into: 'What you’re into',
  meeting: 'How you like to meet',
  time: 'Fitting it in',
  extras: 'Last bits',
}

export const STEPS = [
  { id: 'pledge', section: 'basics', required: true },
  { id: 'name', section: 'basics', required: true },
  { id: 'brings', section: 'goals', required: false },
  { id: 'work', section: 'goals', required: false },
  { id: 'project', section: 'goals', required: false },
  { id: 'interests', section: 'into', required: true },
  { id: 'style', section: 'into', required: false },
  { id: 'groups', section: 'meeting', required: false },
  { id: 'approach', section: 'meeting', required: false },
  { id: 'languages', section: 'meeting', required: false },
  { id: 'free', section: 'time', required: false },
  { id: 'pace', section: 'time', required: false },
  { id: 'places', section: 'time', required: false },
  { id: 'budget', section: 'time', required: false },
  { id: 'newcomer', section: 'extras', required: false },
  { id: 'access', section: 'extras', required: false },
] as const satisfies readonly { id: string; section: SectionId; required: boolean }[]

export type Step = (typeof STEPS)[number]
export type StepId = Step['id']

export interface Draft extends Answers {
  adult: boolean
  pledge: boolean
}

export function emptyDraft(): Draft {
  return {
    adult: false,
    pledge: false,
    firstName: '',
    intents: [],
    workArea: null,
    projectRoles: [],
    projectStage: null,
    interests: [],
    eventStyle: null,
    groupSize: null,
    approach: null,
    languages: [],
    learning: [],
    freeTimes: [],
    pace: null,
    neighbourhoods: [],
    // Free or low cost by default (v3 #16).
    budget: 'low',
    newcomer: null,
    accessNeeds: [],
  }
}

/** Someone changing their answers has already confirmed 18+ and the pledge. */
export function draftFromProfile(profile: Profile): Draft {
  // Lists are replaced, never changed in place (see toggle), so a shallow copy is enough.
  return { ...pickAnswers(profile), adult: true, pledge: true }
}

/** Validates a draft kept on the device between screens. Untrusted, like any stored data. */
export function parseDraft(raw: unknown): Draft | null {
  const answers = parseAnswers(raw)
  if (!answers || typeof raw !== 'object' || raw === null) return null
  const { adult, pledge }: Record<string, unknown> = { ...raw }
  if (typeof adult !== 'boolean' || typeof pledge !== 'boolean') return null
  return { ...answers, adult, pledge }
}

export function isStepId(value: unknown): value is StepId {
  return STEPS.some((step) => step.id === value)
}

/** The screens this person sees, in order. */
export function visibleSteps(draft: Draft): Step[] {
  return STEPS.filter((step) => step.id !== 'project' || wantsProject(draft.intents))
}

/** The screen to show for `id`: itself, or the next one that applies if it's been left out. */
export function resolveStep(id: StepId, draft: Draft): Step {
  const from = STEPS.findIndex((step) => step.id === id)
  const visible = visibleSteps(draft)
  const step = STEPS.slice(from).find((s) => visible.includes(s))
  // Only the project step is ever left out, and the steps after it always show.
  /* v8 ignore next -- @preserve */
  return step ?? STEPS[0]
}

/** Whether a step's required answers are in. Optional steps are always complete. */
export function stepComplete(id: StepId, draft: Draft): boolean {
  switch (id) {
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

/** Whether the person has answered an optional step (so its button says Continue, not Skip). */
export function stepAnswered(id: StepId, draft: Draft): boolean {
  switch (id) {
    case 'brings':
      return draft.intents.length > 0
    case 'work':
      return draft.workArea !== null
    case 'project':
      return draft.projectRoles.length > 0 || draft.projectStage !== null
    case 'style':
      return draft.eventStyle !== null
    case 'groups':
      return draft.groupSize !== null
    case 'approach':
      return draft.approach !== null
    case 'languages':
      return draft.languages.length > 0 || draft.learning.length > 0
    case 'free':
      return draft.freeTimes.length > 0
    case 'pace':
      return draft.pace !== null
    case 'places':
      return draft.neighbourhoods.length > 0
    case 'newcomer':
      return draft.newcomer !== null
    case 'access':
      return draft.accessNeeds.length > 0
    default:
      // Required steps, and the budget, which always has an answer (free or low cost).
      return true
  }
}

/** The first step with a missing required answer, or null when the draft is ready. */
export function firstIncompleteStep(draft: Draft): StepId | null {
  return STEPS.find((step) => !stepComplete(step.id, draft))?.id ?? null
}

/** Where a visible step sits: its section, its place among the screens, and what comes next. */
export function stepPosition(step: Step, draft: Draft) {
  const visible = visibleSteps(draft)
  const index = visible.indexOf(step)
  return {
    /** 1-based number of this screen. */
    number: index + 1,
    total: visible.length,
    sectionLabel: SECTION_LABELS[step.section],
    sectionNumber: SECTIONS.indexOf(step.section) + 1,
    next: visible[index + 1]?.id ?? null,
  }
}

/** Builds the profile from a finished draft. Throws if a required answer is missing. */
export function toProfile(draft: Draft, cityId: string, pledgedAt: string): Profile {
  const firstName = cleanFirstName(draft.firstName)
  if (!firstName || firstIncompleteStep(draft) !== null) {
    throw new Error('Onboarding is not finished')
  }
  const answers = pickAnswers(draft)
  const project = wantsProject(draft.intents)
  return {
    ...answers,
    firstName,
    // Project answers only mean something to people looking for a co-founder or collaborators.
    projectRoles: project ? answers.projectRoles : [],
    projectStage: project ? answers.projectStage : null,
    cityId,
    pledgedAt,
  }
}

/** Adds or removes one item from a list of picks. */
export function toggle<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}
