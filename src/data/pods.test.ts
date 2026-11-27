import { afterEach, describe, expect, it } from 'vitest'
import { EMPTY_CONNECTIONS, connectionsReducer } from '../lib/pods/connections.ts'
import { makeEvent } from '../test/fixtures.ts'
import { deleteConnections, loadConnections, saveConnections } from './connections.ts'
import { EXAMPLE_PEOPLE } from './examplePeople.ts'
import { confirmMet, firstNames, getPod, sendPicks, sharedWithMe } from './pods.ts'

const event = makeEvent({ id: 'vancouver-board-games-2026-12-05', title: 'Board game social' })
const me = {
  optIn: { intents: ['open-to-anything' as const], mode: 'group' as const },
  interests: ['board-games' as const],
  blocked: [],
}

describe('example pods (stub)', () => {
  it('forms a pod of made-up people, the same every time, with no names on the cards', async () => {
    const pod = await getPod(event, me)
    expect(pod).toEqual(await getPod(event, me))
    if (pod.kind !== 'pod') throw new Error('expected a pod')
    expect(pod.isExample).toBe(true)
    expect(pod.mates.length).toBeGreaterThanOrEqual(2)
    expect(pod.mates.length).toBeLessThanOrEqual(4)
    expect(pod.podWord).toMatch(/^[A-Z][a-z]+$/)
    expect(pod.reason).toMatch(/^You’re /)
    for (const mate of pod.mates) {
      expect(Object.keys(mate).sort()).toEqual(['answer', 'id', 'intents', 'interests', 'prompt'])
    }
  })

  it('never places someone the person blocked', async () => {
    const first = await getPod(event, me)
    if (first.kind !== 'pod') throw new Error('expected a pod')
    const blocked = first.mates.map((m) => m.id)
    const again = await getPod(event, { ...me, blocked })
    const ids = again.kind === 'pod' ? again.mates.map((m) => m.id) : []
    expect(ids.some((id) => blocked.includes(id))).toBe(false)
  })

  it('gives no pod when nobody going wants something compatible', async () => {
    const lonely = await getPod(event, {
      ...me,
      optIn: { intents: ['meet-cofounder'], mode: 'one' },
      blocked: EXAMPLE_PEOPLE.map((p) => p.id),
    })
    expect(lonely).toEqual({ kind: 'none' })
  })

  it('returns only mutual "We met" and mutual keep-meeting, never one-sided', async () => {
    const ids = EXAMPLE_PEOPLE.map((p) => p.id)
    const met = await confirmMet(event, ids)
    expect(met.map((m) => m.id)).toEqual(EXAMPLE_PEOPLE.filter((p) => p.metBack).map((p) => p.id))
    const kept = await sendPicks(event, ids)
    expect(kept.map((c) => c.personId)).toEqual(
      EXAMPLE_PEOPLE.filter((p) => p.keepsMeeting).map((p) => p.id),
    )
    expect(kept[0]).toMatchObject({
      eventId: event.id,
      eventTitle: 'Board game social',
      metAt: event.startsAt,
      shared: [],
    })
  })

  it('looks up first names and what someone shared back', () => {
    expect(firstNames(['example-1', 'nobody'])).toEqual({ 'example-1': 'Sam' })
    expect(sharedWithMe('example-1')).toEqual({ linkedin: 'linkedin.com/in/example-sam' })
    expect(sharedWithMe('nobody')).toEqual({})
  })
})

describe('connections on this device', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('saves, loads and deletes', () => {
    expect(loadConnections()).toEqual(EMPTY_CONNECTIONS)
    const state = connectionsReducer(EMPTY_CONNECTIONS, { type: 'block', personId: 'x' })
    expect(saveConnections(state)).toBe(true)
    expect(loadConnections()).toEqual(state)
    deleteConnections()
    expect(loadConnections()).toEqual(EMPTY_CONNECTIONS)
  })
})

describe('the example crowd always has a pod for any single intent', () => {
  it.each([
    'make-friends',
    'grow-network',
    'find-collaborators',
    'meet-cofounder',
    'open-to-anything',
  ] as const)('%s, in a group or one-to-one', async (intent) => {
    for (const mode of ['group', 'one'] as const) {
      for (const id of ['a', 'vancouver-board-games-2026-12-05', 'zz-9']) {
        const pod = await getPod(makeEvent({ id }), { ...me, optIn: { intents: [intent], mode } })
        expect(pod.kind).toBe('pod')
      }
    }
  })
})
