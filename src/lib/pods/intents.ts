import type { IntentId } from '../profile.ts'

/**
 * What someone wants out of one specific event (connection-flow.md §B). Chosen from these chips,
 * never typed, so nothing free-form about a person goes anywhere (CLAUDE.md §8.15).
 */
export const EVENT_INTENTS = [
  { id: 'make-friends', label: 'Make friends', phrase: 'make friends' },
  { id: 'grow-network', label: 'Grow my network', phrase: 'grow your network' },
  { id: 'find-collaborators', label: 'Find collaborators', phrase: 'find collaborators' },
  { id: 'meet-cofounder', label: 'Meet a co-founder', phrase: 'meet a co-founder' },
  { id: 'open-to-anything', label: 'Open to anything', phrase: 'meet new people' },
] as const

export type EventIntent = (typeof EVENT_INTENTS)[number]['id']

/** At most two per event, so a pod knows roughly why each person came. */
export const MAX_EVENT_INTENTS = 2

const FROM_ONBOARDING: Record<IntentId, EventIntent> = {
  friends: 'make-friends',
  network: 'grow-network',
  collaborators: 'find-collaborators',
  cofounder: 'meet-cofounder',
  events: 'open-to-anything',
}

/**
 * The prefilled intent for an event, from "What brings you to Firefly?" (v4 step 5), so most
 * people never have to change anything. Nothing answered means "open to anything".
 */
export function defaultEventIntents(onboarding: readonly IntentId[]): EventIntent[] {
  const intents = [...new Set(onboarding.map((id) => FROM_ONBOARDING[id]))]
  return intents.length > 0 ? intents.slice(0, MAX_EVENT_INTENTS) : ['open-to-anything']
}

const LABELS = new Map<string, string>(EVENT_INTENTS.map((intent) => [intent.id, intent.label]))

export function eventIntentLabel(id: EventIntent): string {
  return String(LABELS.get(id))
}

export function isEventIntent(value: unknown): value is EventIntent {
  return EVENT_INTENTS.some((intent) => intent.id === value)
}

/** Founders and collaborators want the same thing: someone to build with. */
const NEIGHBOURS: readonly (readonly [EventIntent, EventIntent])[] = [
  ['find-collaborators', 'meet-cofounder'],
]

function pairFits(a: EventIntent, b: EventIntent): boolean {
  if (a === b || a === 'open-to-anything' || b === 'open-to-anything') return true
  return NEIGHBOURS.some(([x, y]) => (a === x && b === y) || (a === y && b === x))
}

/**
 * Whether two people can share a pod (proposed rules, connection-flow.md open decisions): any
 * of their intents is the same, one is open to anything, or one is building and the other is
 * looking for a builder.
 */
export function intentsFit(a: readonly EventIntent[], b: readonly EventIntent[]): boolean {
  return a.some((x) => b.some((y) => pairFits(x, y)))
}
