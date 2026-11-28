import { isInterestId, MIN_INTERESTS, type InterestId } from './interests.ts'

/*
 * The person's answers from onboarding. Every answer is private to its owner (owner-only RLS on
 * `profiles`) and each one is here because the feed or pod forming uses it. Deliberately never
 * asked: last name, birthday or age, gender, sexuality, religion, ethnicity, workplace, school,
 * socials, photos and location (CLAUDE.md §8). Adding an option means adding it to the matching
 * check constraint in a new migration too.
 */

/** "What brings you to Firefly?" (v4 step 5). Ranks the feed. */
export const INTENTS = [
  { id: 'friends', label: 'New friends', reason: 'new friends' },
  { id: 'network', label: 'A professional network', reason: 'a professional network' },
  { id: 'collaborators', label: 'Collaborators', reason: 'collaborators' },
  { id: 'cofounder', label: 'A co-founder', reason: 'a co-founder' },
  { id: 'events', label: 'Just good events', reason: 'good events' },
] as const
export type IntentId = (typeof INTENTS)[number]['id']

/** What the person spends their days on: ranks career events, and pods for networking intents. */
export const WORK_AREAS = [
  { id: 'studying', label: 'Studying' },
  { id: 'building', label: 'Building my own thing' },
  { id: 'tech', label: 'Tech' },
  { id: 'design', label: 'Design & creative' },
  { id: 'business', label: 'Business & finance' },
  { id: 'health', label: 'Health & care' },
  { id: 'education', label: 'Education' },
  { id: 'arts', label: 'Arts & culture' },
  { id: 'trades', label: 'Trades & hands-on work' },
  { id: 'hospitality', label: 'Hospitality & retail' },
  { id: 'public', label: 'Public sector & non-profit' },
  { id: 'between', label: 'Between things' },
] as const
export type WorkAreaId = (typeof WORK_AREAS)[number]['id']

/** Asked only of people looking for a co-founder or collaborators: what they'd bring. */
export const PROJECT_ROLES = [
  { id: 'engineering', label: 'Engineering' },
  { id: 'product-design', label: 'Product & design' },
  { id: 'sales-growth', label: 'Sales & growth' },
  { id: 'operations', label: 'Operations' },
  { id: 'domain', label: 'Know-how in a field' },
  { id: 'unsure', label: 'Not sure yet' },
] as const
export type ProjectRoleId = (typeof PROJECT_ROLES)[number]['id']

export const PROJECT_STAGES = [
  { id: 'exploring', label: 'Just exploring' },
  { id: 'idea', label: 'I have an idea' },
  { id: 'building', label: 'Building it now' },
  { id: 'launched', label: 'It’s launched' },
] as const
export type ProjectStageId = (typeof PROJECT_STAGES)[number]['id']

/** The shape of event the person enjoys most. Ranks the feed. */
export const EVENT_STYLES = [
  { id: 'activity', label: 'Doing something together', hint: 'Run clubs, pottery, board games' },
  { id: 'talk', label: 'A talk, then chatting', hint: 'Talks, panels, screenings' },
  { id: 'mingle', label: 'Open mingling', hint: 'Mixers, socials, meetups' },
  { id: 'mix', label: 'A bit of everything', hint: 'Surprise me' },
] as const
export type EventStyleId = (typeof EVENT_STYLES)[number]['id']

/** Where the person opens up most. Ranks the feed by event size, and sizes pods. */
export const GROUP_SIZES = [
  { id: 'small', label: 'A small group', hint: '3 to 6 people' },
  { id: 'medium', label: 'A room of 10 to 30', hint: 'Enough to mix, small enough to talk' },
  { id: 'large', label: 'A bigger mixer', hint: '30 or more people' },
  { id: 'any', label: 'No preference', hint: 'Any size works' },
] as const
export type GroupSizeId = (typeof GROUP_SIZES)[number]['id']

/** How walking in feels. Events with a structure, and pods, are favoured for "daunting". */
export const APPROACHES = [
  {
    id: 'easy',
    label: 'Easy. I’ll say hi first',
    reply: 'Great. Pods will need people like you.',
  },
  {
    id: 'warm-up',
    label: 'Fine once someone else starts',
    reply: 'Most people feel that way. We’ll favour events with something to do together.',
  },
  {
    id: 'daunting',
    label: 'Honestly, a bit daunting',
    reply: 'That’s what Firefly is for. You’ll know who to look for before you walk in.',
  },
] as const
export type ApproachId = (typeof APPROACHES)[number]['id']

/** Languages spoken and being learned: ranks language exchanges, and pods share a language. */
export const LANGUAGES = [
  { id: 'english', label: 'English' },
  { id: 'french', label: 'French' },
  { id: 'spanish', label: 'Spanish' },
  { id: 'mandarin', label: 'Mandarin' },
  { id: 'cantonese', label: 'Cantonese' },
  { id: 'punjabi', label: 'Punjabi' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'tagalog', label: 'Tagalog' },
  { id: 'korean', label: 'Korean' },
  { id: 'japanese', label: 'Japanese' },
  { id: 'vietnamese', label: 'Vietnamese' },
  { id: 'farsi', label: 'Farsi' },
  { id: 'arabic', label: 'Arabic' },
  { id: 'portuguese', label: 'Portuguese' },
  { id: 'german', label: 'German' },
  { id: 'italian', label: 'Italian' },
  { id: 'russian', label: 'Russian' },
  { id: 'ukrainian', label: 'Ukrainian' },
] as const
export type LanguageId = (typeof LANGUAGES)[number]['id']

/** "When you're free" (v4 step 7). */
export const FREE_TIMES = [
  { id: 'weekday-evenings', label: 'Weekday evenings' },
  { id: 'weekend-days', label: 'Weekend days' },
  { id: 'weekend-evenings', label: 'Weekend evenings' },
] as const
export type FreeTimeId = (typeof FREE_TIMES)[number]['id']

/** How often the person wants to go out: how many events the feed puts first. No streaks. */
export const PACES = [
  { id: 'monthly', label: 'About once a month' },
  { id: 'fortnightly', label: 'Every couple of weeks' },
  { id: 'weekly', label: 'Once a week' },
  { id: 'often', label: 'More than once a week' },
] as const
export type PaceId = (typeof PACES)[number]['id']

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

/** Everything the person answers in onboarding (the profile minus city and pledge time). */
export interface Answers {
  firstName: string
  intents: IntentId[]
  workArea: WorkAreaId | null
  projectRoles: ProjectRoleId[]
  projectStage: ProjectStageId | null
  interests: InterestId[]
  eventStyle: EventStyleId | null
  groupSize: GroupSizeId | null
  approach: ApproachId | null
  languages: LanguageId[]
  learning: LanguageId[]
  freeTimes: FreeTimeId[]
  pace: PaceId | null
  neighbourhoods: string[]
  budget: BudgetId
  /** "New to the city?": null when skipped. */
  newcomer: boolean | null
  accessNeeds: AccessNeedId[]
}

export interface Profile extends Answers {
  cityId: string
  /** When the person confirmed they're 18+ and took the respect pledge (ISO time). */
  pledgedAt: string
}

export const MAX_FIRST_NAME = 40
/** Neighbourhood names come from the city list; these caps only stop junk reaching the database. */
export const MAX_NEIGHBOURHOODS = 50
export const MAX_NEIGHBOURHOOD_LENGTH = 60

/** Trims a first name and checks it's 1–40 characters. Returns null if it isn't usable. */
export function cleanFirstName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, ' ')
  return name.length > 0 && name.length <= MAX_FIRST_NAME ? name : null
}

/** Just the answers from something that has them (a profile, a draft). */
export function pickAnswers(source: Answers): Answers {
  return {
    firstName: source.firstName,
    intents: source.intents,
    workArea: source.workArea,
    projectRoles: source.projectRoles,
    projectStage: source.projectStage,
    interests: source.interests,
    eventStyle: source.eventStyle,
    groupSize: source.groupSize,
    approach: source.approach,
    languages: source.languages,
    learning: source.learning,
    freeTimes: source.freeTimes,
    pace: source.pace,
    neighbourhoods: source.neighbourhoods,
    budget: source.budget,
    newcomer: source.newcomer,
    accessNeeds: source.accessNeeds,
  }
}

/** Only people looking for a co-founder or collaborators are asked about a project. */
export function wantsProject(intents: readonly IntentId[]): boolean {
  return intents.includes('cofounder') || intents.includes('collaborators')
}

type Guard<T> = (value: unknown) => value is T

function oneOf<T extends string>(list: readonly ({ id: T } | T)[]): Guard<T> {
  const allowed = new Set<unknown>(list.map((x) => (typeof x === 'string' ? x : x.id)))
  return (value: unknown): value is T => allowed.has(value)
}

export const isIntent = oneOf<IntentId>(INTENTS)
export const isWorkArea = oneOf<WorkAreaId>(WORK_AREAS)
export const isProjectRole = oneOf<ProjectRoleId>(PROJECT_ROLES)
export const isProjectStage = oneOf<ProjectStageId>(PROJECT_STAGES)
export const isEventStyle = oneOf<EventStyleId>(EVENT_STYLES)
export const isGroupSize = oneOf<GroupSizeId>(GROUP_SIZES)
export const isApproach = oneOf<ApproachId>(APPROACHES)
export const isLanguage = oneOf<LanguageId>(LANGUAGES)
export const isFreeTime = oneOf<FreeTimeId>(FREE_TIMES)
export const isPace = oneOf<PaceId>(PACES)
export const isBudget = oneOf<BudgetId>(BUDGETS)
export const isAccessNeed = oneOf<AccessNeedId>(ACCESS_NEEDS)

const isNeighbourhood = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0 && v.length <= MAX_NEIGHBOURHOOD_LENGTH

/** A list where every item passes the guard, without duplicates; null if it isn't one. */
function listOf<T>(value: unknown, allowed: Guard<T>, max = Infinity): T[] | null {
  if (!Array.isArray(value)) return null
  const items: unknown[] = value
  const unique = [...new Set(items)]
  return unique.length <= max && unique.every(allowed) ? unique : null
}

/** A single answer that may be skipped: the value, null when skipped, undefined when invalid. */
function optional<T>(value: unknown, allowed: Guard<T>): T | null | undefined {
  if (value === null) return null
  return allowed(value) ? value : undefined
}

/**
 * Validates answers from outside the app's own state: the database or the device. Both are
 * untrusted (an older version, a hand edit), so anything that doesn't match exactly is rejected.
 * The first name may be empty here; onboarding checks it separately.
 */
export function parseAnswers(raw: unknown): Answers | null {
  const r = toRecord(raw)
  return r && answersFrom(r)
}

function toRecord(raw: unknown): Record<string, unknown> | null {
  return typeof raw === 'object' && raw !== null ? { ...raw } : null
}

function answersFrom(r: Record<string, unknown>): Answers | null {
  const intents = listOf(r.intents, isIntent)
  const workArea = optional(r.workArea, isWorkArea)
  const projectRoles = listOf(r.projectRoles, isProjectRole)
  const projectStage = optional(r.projectStage, isProjectStage)
  const interests = listOf(r.interests, isInterestId)
  const eventStyle = optional(r.eventStyle, isEventStyle)
  const groupSize = optional(r.groupSize, isGroupSize)
  const approach = optional(r.approach, isApproach)
  const languages = listOf(r.languages, isLanguage)
  const learning = listOf(r.learning, isLanguage)
  const freeTimes = listOf(r.freeTimes, isFreeTime)
  const pace = optional(r.pace, isPace)
  const neighbourhoods = listOf(r.neighbourhoods, isNeighbourhood, MAX_NEIGHBOURHOODS)
  const accessNeeds = listOf(r.accessNeeds, isAccessNeed)
  const { firstName, budget, newcomer } = r
  if (
    typeof firstName !== 'string' ||
    firstName.length > MAX_FIRST_NAME * 2 ||
    !intents ||
    workArea === undefined ||
    !projectRoles ||
    projectStage === undefined ||
    !interests ||
    eventStyle === undefined ||
    groupSize === undefined ||
    approach === undefined ||
    !languages ||
    !learning ||
    !freeTimes ||
    pace === undefined ||
    !neighbourhoods ||
    !isBudget(budget) ||
    !(newcomer === null || typeof newcomer === 'boolean') ||
    !accessNeeds
  ) {
    return null
  }
  return {
    firstName,
    intents,
    workArea,
    projectRoles,
    projectStage,
    interests,
    eventStyle,
    groupSize,
    approach,
    languages,
    learning,
    freeTimes,
    pace,
    neighbourhoods,
    budget,
    newcomer,
    accessNeeds,
  }
}

/** Validates a full profile: answers plus a usable first name, 3+ interests, city and pledge. */
export function parseProfile(raw: unknown): Profile | null {
  const r = toRecord(raw)
  if (!r) return null
  const answers = answersFrom(r)
  if (!answers) return null
  const firstName = cleanFirstName(answers.firstName)
  if (
    !firstName ||
    answers.interests.length < MIN_INTERESTS ||
    typeof r.cityId !== 'string' ||
    typeof r.pledgedAt !== 'string'
  ) {
    return null
  }
  return { ...answers, firstName, cityId: r.cityId, pledgedAt: r.pledgedAt }
}
