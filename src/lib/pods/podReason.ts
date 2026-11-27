import { interestLabel, type InterestId } from '../interests.ts'
import { EVENT_INTENTS, type EventIntent } from './intents.ts'

interface Member {
  intents: readonly EventIntent[]
  interests: readonly InterestId[]
}

/**
 * "You're all here to find collaborators, and 3 of you like startup meetups." The one line that
 * says why a pod is together (connection-flow.md §D). Uses only what pod-mates can already see.
 */
export function podReason(members: readonly Member[]): string {
  const shared = EVENT_INTENTS.find(
    (intent) =>
      intent.id !== 'open-to-anything' && members.every((m) => m.intents.includes(intent.id)),
  )
  const why = shared ? `You’re all here to ${shared.phrase}` : 'You’re here for similar reasons'

  const counts = new Map<InterestId, number>()
  for (const m of members) for (const i of m.interests) counts.set(i, (counts.get(i) ?? 0) + 1)
  let top: InterestId | undefined
  let topCount = 1
  for (const [interest, count] of counts) {
    if (count > topCount) {
      top = interest
      topCount = count
    }
  }
  if (!top) return `${why}.`
  const who = topCount === members.length ? 'you all' : `${String(topCount)} of you`
  return `${why}, and ${who} like ${interestLabel(top).toLowerCase()}.`
}

/** "You and Sam both want to keep meeting." / "Sam and Aiko want to keep meeting you too." */
export function keepMeetingLine(names: readonly string[]): string {
  if (names.length === 1) return `You and ${String(names[0])} both want to keep meeting.`
  const list = `${names.slice(0, -1).join(', ')} and ${String(names.at(-1))}`
  return `${list} want to keep meeting you too.`
}
