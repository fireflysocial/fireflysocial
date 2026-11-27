import type { CityEvent } from '../lib/events.ts'
import type { InterestId } from '../lib/interests.ts'
import type { Prompt, SocialNetwork } from '../lib/pods/answers.ts'
import type { Connection, OptIn } from '../lib/pods/connections.ts'
import { formPods } from '../lib/pods/formPods.ts'
import type { EventIntent } from '../lib/pods/intents.ts'
import { podReason } from '../lib/pods/podReason.ts'
import { EXAMPLE_PEOPLE, type ExamplePerson } from './examplePeople.ts'

/**
 * Pods and picks. STUB: until the backend exists, every pod is the person plus made-up example
 * people, formed by the real formPods, and the other side's answers are simulated. The real
 * version runs pod forming in a server job and enforces who sees what in RLS (CLAUDE.md §8.2);
 * keep these signatures so the screens don't change.
 */

/** What a pod-mate can see of someone before meeting: no name, photo or anything else. */
export interface PodMateCard {
  id: string
  intents: readonly EventIntent[]
  interests: readonly InterestId[]
  prompt: Prompt
  answer: string
}

export type PodView =
  | {
      kind: 'pod'
      /** A neutral word the pod looks for on the Firefly sign. */
      podWord: string
      reason: string
      mates: PodMateCard[]
      isExample: boolean
    }
  | { kind: 'none' }

const ME = 'me'
const POD_WORDS = ['Maple', 'Cedar', 'Harbour', 'Lantern', 'Willow', 'Tide', 'Juniper', 'Comet']

function hash(text: string): number {
  let h = 0
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0
  return h
}

const card = (p: ExamplePerson): PodMateCard => ({
  id: p.id,
  intents: p.intents,
  interests: p.interests,
  prompt: p.prompt,
  answer: p.answer,
})

interface Me {
  optIn: OptIn
  interests: readonly InterestId[]
  blocked: readonly string[]
}

export function getPod(event: CityEvent, me: Me): Promise<PodView> {
  const crowd = EXAMPLE_PEOPLE.filter((p) => !me.blocked.includes(p.id))
  // Pairs need an even number of people; keep the example crowd even so the demo always works.
  const others = me.optIn.mode === 'one' && crowd.length % 2 === 0 ? crowd.slice(0, -1) : crowd
  const result = formPods([
    {
      id: ME,
      intents: me.optIn.intents,
      interests: me.interests,
      mode: me.optIn.mode,
      keepMeetingWith: [],
      blocked: me.blocked,
    },
    ...others.map((p) => ({
      id: p.id,
      intents: p.intents,
      interests: p.interests,
      mode: me.optIn.mode,
      keepMeetingWith: [],
      blocked: [],
    })),
  ])
  const pod = result.pods.find((ids) => ids.includes(ME))
  if (!pod) return Promise.resolve({ kind: 'none' })
  const mates = others.filter((p) => pod.includes(p.id))
  return Promise.resolve({
    kind: 'pod',
    podWord: String(POD_WORDS[hash(event.id) % POD_WORDS.length]),
    reason: podReason([{ intents: me.optIn.intents, interests: me.interests }, ...mates]),
    mates: mates.map(card),
    isExample: true,
  })
}

/** Sends "We met" and returns who met the person back (mutual only), with first names. */
export function confirmMet(
  _event: CityEvent,
  tapped: readonly string[],
): Promise<{ id: string; firstName: string }[]> {
  return Promise.resolve(
    EXAMPLE_PEOPLE.filter((p) => tapped.includes(p.id) && p.metBack).map((p) => ({
      id: p.id,
      firstName: p.firstName,
    })),
  )
}

/** First names of people who met the person back, for the keep-meeting screen. */
export function firstNames(ids: readonly string[]): Record<string, string> {
  return Object.fromEntries(
    EXAMPLE_PEOPLE.filter((p) => ids.includes(p.id)).map((p) => [p.id, p.firstName]),
  )
}

/**
 * Sends private picks and returns only the mutual ones as connections. A one-sided pick is never
 * revealed, by this function or any other (CLAUDE.md §8.4).
 */
export function sendPicks(event: CityEvent, keep: readonly string[]): Promise<Connection[]> {
  return Promise.resolve(
    EXAMPLE_PEOPLE.filter((p) => keep.includes(p.id) && p.keepsMeeting).map((p) => ({
      personId: p.id,
      firstName: p.firstName,
      eventId: event.id,
      eventTitle: event.title,
      metAt: event.startsAt,
      shared: [],
    })),
  )
}

/** What a connection chose to share back (simulated for example people). */
export function sharedWithMe(personId: string): Partial<Record<SocialNetwork, string>> {
  return EXAMPLE_PEOPLE.find((p) => p.id === personId)?.shares ?? {}
}
