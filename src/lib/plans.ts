import { hasEnded, hasStarted, type CityEvent } from './events.ts'

/**
 * The person's own plans: saved events, feedback, and the going list. The going list says where
 * someone will be and when, so it's owner-only, never shown to anyone else, and pruned after the
 * event (CLAUDE.md §8.14).
 */

/** Answer to "Did you register?" (v4 §2). Only 'going' counts as going. */
export type GoingAnswer = 'going' | 'remind' | 'not-going'
export type NotForMeReason = 'too-far' | 'too-expensive' | 'not-my-thing'
export type AfterEventAnswer = 'good' | 'not-for-me' | 'didnt-go'

export type Feedback = { kind: 'more' } | { kind: 'not-for-me'; reason: NotForMeReason | null }

export interface Plans {
  saved: string[]
  feedback: Record<string, Feedback>
  /** Events whose "Register ↗" was tapped: interest only, not going. */
  clicked: string[]
  going: Record<string, GoingAnswer>
  /** The event whose page is open in the browser, so Firefly can ask on return. */
  awaitingReturn: string | null
  /** Wrong or dead listings the person flagged. */
  flagged: string[]
  afterEvent: Record<string, AfterEventAnswer>
}

export const EMPTY_PLANS: Plans = {
  saved: [],
  feedback: {},
  clicked: [],
  going: {},
  awaitingReturn: null,
  flagged: [],
  afterEvent: {},
}

/** Placeholder until the privacy review sets retention (v4 open decisions). */
export const KEEP_AFTER_EVENT_DAYS = 7

export type PlansAction =
  | { type: 'toggle-save'; eventId: string }
  | { type: 'more-like-this'; eventId: string }
  | { type: 'not-for-me'; eventId: string; reason: NotForMeReason | null }
  | { type: 'undo-feedback'; eventId: string }
  | { type: 'open-registration'; eventId: string }
  | { type: 'answer-going'; eventId: string; answer: GoingAnswer }
  | { type: 'dismiss-return' }
  | { type: 'flag'; eventId: string }
  | { type: 'after-event'; eventId: string; answer: AfterEventAnswer }

const without = <T>(record: Record<string, T>, key: string): Record<string, T> =>
  Object.fromEntries(Object.entries(record).filter(([k]) => k !== key))

const addOnce = (list: readonly string[], id: string) =>
  list.includes(id) ? [...list] : [...list, id]

export function plansReducer(plans: Plans, action: PlansAction): Plans {
  switch (action.type) {
    case 'toggle-save':
      return {
        ...plans,
        saved: plans.saved.includes(action.eventId)
          ? plans.saved.filter((id) => id !== action.eventId)
          : [...plans.saved, action.eventId],
      }
    case 'more-like-this':
      return { ...plans, feedback: { ...plans.feedback, [action.eventId]: { kind: 'more' } } }
    case 'not-for-me':
      return {
        ...plans,
        feedback: {
          ...plans.feedback,
          [action.eventId]: { kind: 'not-for-me', reason: action.reason },
        },
      }
    case 'undo-feedback':
      return { ...plans, feedback: without(plans.feedback, action.eventId) }
    case 'open-registration':
      return {
        ...plans,
        clicked: addOnce(plans.clicked, action.eventId),
        awaitingReturn: action.eventId,
      }
    case 'answer-going':
      return {
        ...plans,
        going: { ...plans.going, [action.eventId]: action.answer },
        awaitingReturn: plans.awaitingReturn === action.eventId ? null : plans.awaitingReturn,
      }
    case 'dismiss-return':
      return { ...plans, awaitingReturn: null }
    case 'flag':
      return { ...plans, flagged: addOnce(plans.flagged, action.eventId) }
    case 'after-event':
      return { ...plans, afterEvent: { ...plans.afterEvent, [action.eventId]: action.answer } }
  }
}

/** Why the person said "Not for me" to an event, if they said so and gave a reason. */
export function notForMeReason(plans: Plans, eventId: string): NotForMeReason | null {
  const feedback = plans.feedback[eventId]
  return feedback?.kind === 'not-for-me' ? feedback.reason : null
}

export function isGoing(plans: Plans, eventId: string): boolean {
  return plans.going[eventId] === 'going'
}

/**
 * Quiet feed cards asking "Did you register?" for events whose page was opened but not answered,
 * or answered "remind me". A dismissed prompt becomes one of these, never a repeat pop-up, and it
 * expires when the event starts (v4 §2).
 */
export function registrationReminders(
  plans: Plans,
  events: readonly CityEvent[],
  now: Date,
): CityEvent[] {
  return events.filter((event) => {
    if (hasStarted(event, now) || plans.awaitingReturn === event.id) return false
    const answer = plans.going[event.id]
    return answer === 'remind' || (answer === undefined && plans.clicked.includes(event.id))
  })
}

/** Events the person said they were going to that have ended and haven't been asked about yet. */
export function afterEventQuestions(
  plans: Plans,
  events: readonly CityEvent[],
  now: Date,
): CityEvent[] {
  return events.filter(
    (event) =>
      isGoing(plans, event.id) && hasEnded(event, now) && plans.afterEvent[event.id] === undefined,
  )
}

/**
 * Drops everything about events that ended more than KEEP_AFTER_EVENT_DAYS ago, or that are no
 * longer listed. Runs whenever plans load, so the going list doesn't outlive its events.
 */
export function prunePlans(plans: Plans, events: readonly CityEvent[], now: Date): Plans {
  const cutoff = now.getTime() - KEEP_AFTER_EVENT_DAYS * 24 * 60 * 60 * 1000
  const live = new Set(events.filter((e) => Date.parse(e.endsAt) > cutoff).map((e) => e.id))
  const keep = (id: string) => live.has(id)
  const keepKeys = <T>(record: Record<string, T>) =>
    Object.fromEntries(Object.entries(record).filter(([id]) => keep(id)))
  return {
    saved: plans.saved.filter(keep),
    feedback: keepKeys(plans.feedback),
    clicked: plans.clicked.filter(keep),
    going: keepKeys(plans.going),
    awaitingReturn:
      plans.awaitingReturn !== null && keep(plans.awaitingReturn) ? plans.awaitingReturn : null,
    flagged: plans.flagged.filter(keep),
    afterEvent: keepKeys(plans.afterEvent),
  }
}

/** Returns the option equal to `value`, typed, or null: a cast-free way to check stored strings. */
const oneOf =
  <T extends string>(options: readonly T[]) =>
  (value: unknown): T | null =>
    options.find((option) => option === value) ?? null

const goingAnswer = oneOf<GoingAnswer>(['going', 'remind', 'not-going'])
const afterAnswer = oneOf<AfterEventAnswer>(['good', 'not-for-me', 'didnt-go'])
const notReason = oneOf<NotForMeReason>(['too-far', 'too-expensive', 'not-my-thing'])

const stringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []

function recordOf<T>(value: unknown, parse: (v: unknown) => T | null): Record<string, T> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}
  const out: Record<string, T> = {}
  for (const [key, raw] of Object.entries(value)) {
    const parsed = parse(raw)
    if (parsed !== null) out[key] = parsed
  }
  return out
}

function parseFeedback(raw: unknown): Feedback | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r: Record<string, unknown> = { ...raw }
  if (r.kind === 'more') return { kind: 'more' }
  if (r.kind !== 'not-for-me') return null
  const reason = notReason(r.reason)
  if (reason === null && r.reason !== null && r.reason !== undefined) return null
  return { kind: 'not-for-me', reason }
}

/**
 * Reads stored plans leniently: plans are the person's own records, so a damaged entry is dropped
 * on its own rather than throwing all their plans away.
 */
export function parsePlans(raw: unknown): Plans {
  if (typeof raw !== 'object' || raw === null) return EMPTY_PLANS
  const r: Record<string, unknown> = { ...raw }
  return {
    saved: stringList(r.saved),
    feedback: recordOf(r.feedback, parseFeedback),
    clicked: stringList(r.clicked),
    going: recordOf(r.going, goingAnswer),
    awaitingReturn: typeof r.awaitingReturn === 'string' ? r.awaitingReturn : null,
    flagged: stringList(r.flagged),
    afterEvent: recordOf(r.afterEvent, afterAnswer),
  }
}
