import type { InterestId } from '../interests.ts'
import { intentsFit, type EventIntent } from './intents.ts'

/** Someone going to an event who opted in to meeting people there (connection-flow.md §B). */
export interface PodCandidate {
  id: string
  intents: readonly EventIntent[]
  interests: readonly InterestId[]
  /** "A small group" or "One person first" (v3 #20). */
  mode: 'group' | 'one'
  /** People this person and the other both chose to keep meeting before (v3 #24). */
  keepMeetingWith: readonly string[]
  /** People either of them blocked. Never placed together (CLAUDE.md §8.5). */
  blocked: readonly string[]
}

export interface PodRules {
  minSize: number
  /** Pods grow to this size first, leaving room for people who'd otherwise be left out. */
  targetSize: number
  /** Leftovers can bring a pod up to this; one over target also covers a no-show (v3 #11). */
  maxSize: number
}

export const DEFAULT_POD_RULES: PodRules = { minSize: 3, targetSize: 4, maxSize: 5 }

export interface PodResult {
  /** Each pod's member ids, in the order they were placed. */
  pods: string[][]
  /** People who couldn't be placed: they're told "No pod this time", with no other detail. */
  unplaced: string[]
}

const sharedInterests = (a: PodCandidate, b: PodCandidate) =>
  a.interests.filter((i) => b.interests.includes(i)).length

function canJoin(person: PodCandidate, members: readonly PodCandidate[]): boolean {
  return members.every(
    (m) =>
      intentsFit(person.intents, m.intents) &&
      !person.blocked.includes(m.id) &&
      !m.blocked.includes(person.id),
  )
}

/** Higher is a better fit with a pod: people who kept meeting first, then shared interests. */
function affinity(person: PodCandidate, members: readonly PodCandidate[]): number {
  const kept = members.filter(
    (m) => person.keepMeetingWith.includes(m.id) && m.keepMeetingWith.includes(person.id),
  ).length
  const shared = members.reduce((sum, m) => sum + sharedInterests(person, m), 0)
  return kept * 100 + shared
}

function bestNext(pool: readonly PodCandidate[], members: readonly PodCandidate[]) {
  let best: PodCandidate | undefined
  let bestScore = -1
  for (const person of pool) {
    if (!canJoin(person, members)) continue
    const score = affinity(person, members)
    if (score > bestScore) {
      best = person
      bestScore = score
    }
  }
  return best
}

function grow(seed: PodCandidate, pool: PodCandidate[], size: number): PodCandidate[] {
  const members = [seed]
  while (members.length < size) {
    const next = bestNext(pool, members)
    if (!next) break
    members.push(next)
    pool.splice(pool.indexOf(next), 1)
  }
  return members
}

/**
 * Groups the people going to one event into pods (connection-flow.md §C). Pure and
 * deterministic: the same people always give the same pods, whatever order they arrive in.
 * It runs server-side once the backend exists; here it's tested directly and drives the
 * example pod.
 *
 * Pods grow greedily to the target size, compatible intents only, seeding with the most
 * constrained person and preferring people who kept meeting, then shared interests. Groups that
 * end up too small first borrow a compatible member from a pod that can spare one; failing
 * that, their members fold into pods with room (up to the maximum). Anyone still left over gets
 * no pod. "One person first" pairs up the same way.
 */
export function formPods(
  candidates: readonly PodCandidate[],
  rules: PodRules = DEFAULT_POD_RULES,
): PodResult {
  // Most constrained first: whoever can share a pod with the fewest others seeds first, so
  // flexible people don't fill up early pods and strand them. Ties go by id, so the result
  // never depends on arrival order.
  const options = new Map(
    candidates.map((c) => [c.id, candidates.filter((o) => o !== c && canJoin(c, [o])).length]),
  )
  const sorted = [...candidates].sort(
    (a, b) => Number(options.get(a.id)) - Number(options.get(b.id)) || a.id.localeCompare(b.id),
  )
  const groupPool = sorted.filter((c) => c.mode === 'group')
  const pairPool = sorted.filter((c) => c.mode === 'one')
  const pods: PodCandidate[][] = []
  const small: PodCandidate[][] = []
  const unplaced: string[] = []

  for (let seed = groupPool.shift(); seed; seed = groupPool.shift()) {
    const pod = grow(seed, groupPool, rules.targetSize)
    if (pod.length >= rules.minSize) pods.push(pod)
    else small.push(pod)
  }

  // Repair: a group that's too small borrows a compatible member from a pod that can spare one,
  // so a flexible person placed early doesn't leave two others without a pod.
  for (const group of small) {
    while (group.length < rules.minSize) {
      const donor = pods.find(
        (pod) => pod.length > rules.minSize && pod.some((m) => canJoin(m, group)),
      )
      const member = donor?.find((m) => canJoin(m, group))
      if (!donor || !member) break
      donor.splice(donor.indexOf(member), 1)
      group.push(member)
    }
    if (group.length >= rules.minSize) {
      pods.push(group)
      continue
    }
    for (const person of group) {
      const home = pods.find((pod) => pod.length < rules.maxSize && canJoin(person, pod))
      if (home) home.push(person)
      else unplaced.push(person.id)
    }
  }

  for (let seed = pairPool.shift(); seed; seed = pairPool.shift()) {
    const pair = grow(seed, pairPool, 2)
    if (pair.length === 2) pods.push(pair)
    else unplaced.push(seed.id)
  }

  return { pods: pods.map((pod) => pod.map((m) => m.id)), unplaced }
}
