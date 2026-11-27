import type { CityEvent } from '../events.ts'
import { isPrompt, isSocialNetwork, type Prompt, type SocialNetwork } from './answers.ts'
import { isEventIntent, type EventIntent } from './intents.ts'

/**
 * The person's side of the connection flow (connection-flow.md): opting in per event, their
 * pod answers, "We met", private picks, and the people they both chose to keep meeting.
 * Everything about an event is deleted once its 72-hour pick window closes; picks are never
 * kept past that (CLAUDE.md §8.4, §8.9).
 */

export interface OptIn {
  intents: EventIntent[]
  mode: 'group' | 'one'
}

export type Pick = 'keep' | 'not'

/** Someone both people chose to keep meeting. Their first name is known: they met. */
export interface Connection {
  personId: string
  firstName: string
  eventId: string
  eventTitle: string
  /** When they met (the event's start, ISO). */
  metAt: string
  /** What I chose to share with this person, one network at a time. */
  shared: SocialNetwork[]
}

export interface ConnectionsState {
  /** The one prompt answer pod-mates see, asked the first time someone opts in. */
  podAnswer: { prompt: Prompt; answer: string } | null
  /** The person's own handles, entered the first time they share one. */
  socials: Partial<Record<SocialNetwork, string>>
  optIns: Record<string, OptIn | 'declined'>
  left: string[]
  /** Pod-mates I tapped "We met" on, per event. */
  met: Record<string, string[]>
  /** Events where "We met" was sent, with who met me back (mutual only). */
  metBack: Record<string, string[]>
  /** My picks, per event. Private: never shown to anyone, deleted when the window closes. */
  picks: Record<string, Record<string, Pick>>
  picksSent: string[]
  connections: Connection[]
  /** Blocked people, carried forward to every future event (CLAUDE.md §8.5). */
  blocked: string[]
  reported: string[]
  /** Demo only, for example events: pretend it's later, to see each step without waiting. */
  preview: Record<string, PreviewStep>
}

export const EMPTY_CONNECTIONS: ConnectionsState = {
  podAnswer: null,
  socials: {},
  optIns: {},
  left: [],
  met: {},
  metBack: {},
  picks: {},
  picksSent: [],
  connections: [],
  blocked: [],
  reported: [],
  preview: {},
}

export type PreviewStep = 'pod' | 'event' | 'after'

export type ConnectionsAction =
  | { type: 'opt-in'; eventId: string; optIn: OptIn; podAnswer: { prompt: Prompt; answer: string } }
  | { type: 'decline'; eventId: string }
  | { type: 'undecline'; eventId: string }
  | { type: 'leave'; eventId: string }
  | { type: 'rejoin'; eventId: string }
  | { type: 'toggle-met'; eventId: string; personId: string }
  | { type: 'met-confirmed'; eventId: string; mutual: string[] }
  | { type: 'pick'; eventId: string; personId: string; pick: Pick }
  | { type: 'picks-sent'; eventId: string; connections: Connection[] }
  | { type: 'share'; personId: string; network: SocialNetwork; handle: string }
  | { type: 'block'; personId: string }
  | { type: 'report'; personId: string }
  | { type: 'preview'; eventId: string; step: PreviewStep }

const without = <T>(record: Record<string, T>, key: string): Record<string, T> =>
  Object.fromEntries(Object.entries(record).filter(([k]) => k !== key))

const addOnce = (list: readonly string[], id: string) =>
  list.includes(id) ? [...list] : [...list, id]

export function connectionsReducer(
  state: ConnectionsState,
  action: ConnectionsAction,
): ConnectionsState {
  switch (action.type) {
    case 'opt-in':
      return {
        ...state,
        podAnswer: action.podAnswer,
        optIns: { ...state.optIns, [action.eventId]: action.optIn },
      }
    case 'decline':
      return { ...state, optIns: { ...state.optIns, [action.eventId]: 'declined' } }
    case 'undecline':
      return { ...state, optIns: without(state.optIns, action.eventId) }
    case 'leave':
      return { ...state, left: addOnce(state.left, action.eventId) }
    case 'rejoin':
      return { ...state, left: state.left.filter((id) => id !== action.eventId) }
    case 'toggle-met': {
      const current = state.met[action.eventId] ?? []
      const next = current.includes(action.personId)
        ? current.filter((id) => id !== action.personId)
        : [...current, action.personId]
      return { ...state, met: { ...state.met, [action.eventId]: next } }
    }
    case 'met-confirmed':
      return { ...state, metBack: { ...state.metBack, [action.eventId]: action.mutual } }
    case 'pick':
      return {
        ...state,
        picks: {
          ...state.picks,
          [action.eventId]: { ...state.picks[action.eventId], [action.personId]: action.pick },
        },
      }
    case 'picks-sent':
      return {
        ...state,
        picksSent: addOnce(state.picksSent, action.eventId),
        connections: [
          ...state.connections.filter(
            (c) => !action.connections.some((n) => n.personId === c.personId),
          ),
          ...action.connections,
        ],
      }
    case 'share':
      return {
        ...state,
        socials: { ...state.socials, [action.network]: action.handle },
        connections: state.connections.map((c) =>
          c.personId === action.personId
            ? {
                ...c,
                shared: c.shared.includes(action.network)
                  ? c.shared
                  : [...c.shared, action.network],
              }
            : c,
        ),
      }
    case 'block':
      return {
        ...state,
        blocked: addOnce(state.blocked, action.personId),
        connections: state.connections.filter((c) => c.personId !== action.personId),
      }
    case 'report':
      return { ...state, reported: addOnce(state.reported, action.personId) }
    case 'preview':
      return { ...state, preview: { ...state.preview, [action.eventId]: action.step } }
  }
}

/** Who met the person back at an event (mutual only); empty until "We met" is sent. */
export function metBackFor(state: ConnectionsState, eventId: string): string[] {
  return state.metBack[eventId] ?? []
}

const HOUR = 60 * 60 * 1000
/** Pods form a day ahead (connection-flow.md §C). */
export const POD_FORMS_BEFORE_MS = 24 * HOUR
/** Picks stay open 72 hours after the event, then everything about it is deleted. */
export const PICK_WINDOW_MS = 72 * HOUR

/** When the pod for an event forms. */
export function podFormsAt(event: CityEvent): Date {
  return new Date(Date.parse(event.startsAt) - POD_FORMS_BEFORE_MS)
}

/** "Now" for an event's connection flow: the real time, or a demo preview for example events. */
export function effectiveNow(event: CityEvent, state: ConnectionsState, now: Date): Date {
  const step = event.isExample ? state.preview[event.id] : undefined
  const start = Date.parse(event.startsAt)
  const end = Date.parse(event.endsAt)
  if (step === 'pod') return new Date(Math.max(now.getTime(), start - HOUR))
  if (step === 'event') return new Date(Math.max(now.getTime(), start + HOUR / 2))
  if (step === 'after') return new Date(Math.max(now.getTime(), end + HOUR))
  return now
}

export type Stage =
  /** Going, not asked yet: "Open to meeting people at this event?" */
  | 'invite'
  | 'declined'
  /** Opted in; the pod forms later. */
  | 'waiting'
  /** The pod is formed and revealed; the event hasn't started. */
  | 'pod'
  | 'left'
  /** The event is on (or over, within the window) and "We met" isn't sent yet. */
  | 'meet'
  /** "We met" was sent; keep-meeting opens when the event ends. */
  | 'met'
  /** After the event: choose who to keep meeting. */
  | 'pick'
  /** Picks sent. */
  | 'done'
  /** Too late to opt in, or the window closed. */
  | 'closed'

/** Where the person is in the connection flow for one event they're going to. */
export function stageFor(event: CityEvent, state: ConnectionsState, now: Date): Stage {
  const t = effectiveNow(event, state, now).getTime()
  const start = Date.parse(event.startsAt)
  const end = Date.parse(event.endsAt)
  const optIn = state.optIns[event.id]
  if (optIn === undefined) return t < podFormsAt(event).getTime() ? 'invite' : 'closed'
  if (optIn === 'declined') return t < podFormsAt(event).getTime() ? 'declined' : 'closed'
  if (state.left.includes(event.id)) return 'left'
  if (t < podFormsAt(event).getTime()) return 'waiting'
  if (t < start) return 'pod'
  if (t > end + PICK_WINDOW_MS) return 'closed'
  if (state.metBack[event.id] === undefined) return 'meet'
  if (t < end) return 'met'
  return state.picksSent.includes(event.id) ? 'done' : 'pick'
}

/**
 * Deletes everything about events whose pick window has closed or that are no longer listed:
 * opt-ins, taps and picks. Connections, blocks and the person's own answers stay.
 */
export function pruneConnections(
  state: ConnectionsState,
  events: readonly CityEvent[],
  now: Date,
): ConnectionsState {
  const live = new Set(
    events.filter((e) => Date.parse(e.endsAt) + PICK_WINDOW_MS > now.getTime()).map((e) => e.id),
  )
  const keepKeys = <T>(record: Record<string, T>) =>
    Object.fromEntries(Object.entries(record).filter(([id]) => live.has(id)))
  return {
    ...state,
    optIns: keepKeys(state.optIns),
    left: state.left.filter((id) => live.has(id)),
    met: keepKeys(state.met),
    metBack: keepKeys(state.metBack),
    picks: keepKeys(state.picks),
    picksSent: state.picksSent.filter((id) => live.has(id)),
    preview: keepKeys(state.preview),
  }
}

// ---------- Reading stored state (untrusted: dropped piece by piece, never thrown away whole) ----------

const strings = (value: unknown): string[] =>
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

const asObject = (raw: unknown): Record<string, unknown> | null =>
  typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? { ...raw } : null

function parseOptIn(raw: unknown): OptIn | 'declined' | null {
  if (raw === 'declined') return 'declined'
  const r = asObject(raw)
  if (!r || (r.mode !== 'group' && r.mode !== 'one') || !Array.isArray(r.intents)) return null
  const items: unknown[] = r.intents
  const intents = items.filter(isEventIntent)
  if (intents.length === 0 || intents.length !== items.length) return null
  return { intents, mode: r.mode }
}

function parsePicks(raw: unknown): Record<string, Pick> | null {
  return recordOf(raw, (v) => (v === 'keep' || v === 'not' ? v : null))
}

function parseConnection(raw: unknown): Connection | null {
  const r = asObject(raw)
  if (
    !r ||
    typeof r.personId !== 'string' ||
    typeof r.firstName !== 'string' ||
    typeof r.eventId !== 'string' ||
    typeof r.eventTitle !== 'string' ||
    typeof r.metAt !== 'string'
  ) {
    return null
  }
  const shared = Array.isArray(r.shared) ? r.shared.filter(isSocialNetwork) : []
  return {
    personId: r.personId,
    firstName: r.firstName,
    eventId: r.eventId,
    eventTitle: r.eventTitle,
    metAt: r.metAt,
    shared,
  }
}

function parsePodAnswer(raw: unknown): ConnectionsState['podAnswer'] {
  const r = asObject(raw)
  return r && isPrompt(r.prompt) && typeof r.answer === 'string'
    ? { prompt: r.prompt, answer: r.answer }
    : null
}

function parseSocials(raw: unknown): ConnectionsState['socials'] {
  const out: ConnectionsState['socials'] = {}
  for (const [key, value] of Object.entries(asObject(raw) ?? {})) {
    if (isSocialNetwork(key) && typeof value === 'string') out[key] = value
  }
  return out
}

const previewStep = (v: unknown): PreviewStep | null =>
  v === 'pod' || v === 'event' || v === 'after' ? v : null

export function parseConnections(raw: unknown): ConnectionsState {
  const r = asObject(raw)
  if (!r) return EMPTY_CONNECTIONS
  return {
    podAnswer: parsePodAnswer(r.podAnswer),
    socials: parseSocials(r.socials),
    optIns: recordOf(r.optIns, parseOptIn),
    left: strings(r.left),
    met: recordOf(r.met, (v) => (Array.isArray(v) ? strings(v) : null)),
    metBack: recordOf(r.metBack, (v) => (Array.isArray(v) ? strings(v) : null)),
    picks: recordOf(r.picks, parsePicks),
    picksSent: strings(r.picksSent),
    connections: Array.isArray(r.connections)
      ? r.connections.map(parseConnection).filter((c): c is Connection => c !== null)
      : [],
    blocked: strings(r.blocked),
    reported: strings(r.reported),
    preview: recordOf(r.preview, previewStep),
  }
}
