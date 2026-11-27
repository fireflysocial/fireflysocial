import { describe, expect, it } from 'vitest'
import { inHours, makeEvent, NOW } from '../../test/fixtures.ts'
import {
  connectionsReducer,
  effectiveNow,
  EMPTY_CONNECTIONS,
  metBackFor,
  parseConnections,
  podFormsAt,
  pruneConnections,
  stageFor,
  type Connection,
  type ConnectionsAction,
  type ConnectionsState,
} from './connections.ts'

const run = (...actions: ConnectionsAction[]) =>
  actions.reduce(connectionsReducer, EMPTY_CONNECTIONS)
const optIn = (eventId: string): ConnectionsAction => ({
  type: 'opt-in',
  eventId,
  optIn: { intents: ['make-friends'], mode: 'group' },
  podAnswer: { prompt: 'Ask me about', answer: 'bread' },
})
const sam: Connection = {
  personId: 'p1',
  firstName: 'Sam',
  eventId: 'e',
  eventTitle: 'Games',
  metAt: '2026-12-05T03:00:00.000Z',
  shared: [],
}

describe('connectionsReducer', () => {
  it('opts in with intents and a pod answer, declines, and undoes a decline', () => {
    const state = run(optIn('e'), { type: 'decline', eventId: 'f' })
    expect(state.optIns).toEqual({ e: { intents: ['make-friends'], mode: 'group' }, f: 'declined' })
    expect(state.podAnswer).toEqual({ prompt: 'Ask me about', answer: 'bread' })
    expect(
      connectionsReducer(state, { type: 'undecline', eventId: 'f' }).optIns,
    ).not.toHaveProperty('f')
  })

  it('leaves and rejoins a pod', () => {
    const left = run({ type: 'leave', eventId: 'e' }, { type: 'leave', eventId: 'e' })
    expect(left.left).toEqual(['e'])
    expect(connectionsReducer(left, { type: 'rejoin', eventId: 'e' }).left).toEqual([])
  })

  it('toggles "We met" and records who met back', () => {
    const state = run(
      { type: 'toggle-met', eventId: 'e', personId: 'p1' },
      { type: 'toggle-met', eventId: 'e', personId: 'p2' },
      { type: 'toggle-met', eventId: 'e', personId: 'p1' },
      { type: 'met-confirmed', eventId: 'e', mutual: ['p2'] },
    )
    expect(state.met).toEqual({ e: ['p2'] })
    expect(state.metBack).toEqual({ e: ['p2'] })
  })

  it('keeps picks private per event and records mutual connections once', () => {
    const state = run(
      { type: 'pick', eventId: 'e', personId: 'p1', pick: 'keep' },
      { type: 'pick', eventId: 'e', personId: 'p2', pick: 'not' },
      { type: 'picks-sent', eventId: 'e', connections: [sam] },
      { type: 'picks-sent', eventId: 'e', connections: [sam] },
    )
    expect(state.picks).toEqual({ e: { p1: 'keep', p2: 'not' } })
    expect(state.picksSent).toEqual(['e'])
    expect(state.connections).toEqual([sam])
  })

  it('shares socials one network at a time, remembering the handle', () => {
    const state = run(
      { type: 'picks-sent', eventId: 'e', connections: [sam, { ...sam, personId: 'p2' }] },
      { type: 'share', personId: 'p1', network: 'instagram', handle: '@me' },
      { type: 'share', personId: 'p1', network: 'instagram', handle: '@me' },
    )
    expect(state.socials).toEqual({ instagram: '@me' })
    expect(state.connections.map((c) => c.shared)).toEqual([['instagram'], []])
  })

  it('blocks (removing the connection), reports, and records a demo preview', () => {
    const state = run(
      { type: 'picks-sent', eventId: 'e', connections: [sam] },
      { type: 'block', personId: 'p1' },
      { type: 'report', personId: 'p1' },
      { type: 'preview', eventId: 'e', step: 'pod' },
    )
    expect(state.blocked).toEqual(['p1'])
    expect(state.connections).toEqual([])
    expect(state.reported).toEqual(['p1'])
    expect(state.preview).toEqual({ e: 'pod' })
  })
})

describe('metBackFor', () => {
  it('is empty until "We met" is sent', () => {
    expect(metBackFor(EMPTY_CONNECTIONS, 'e')).toEqual([])
    expect(metBackFor(run({ type: 'met-confirmed', eventId: 'e', mutual: ['p1'] }), 'e')).toEqual([
      'p1',
    ])
  })
})

describe('stageFor', () => {
  // Starts 48 hours after NOW and runs 2 hours.
  const event = makeEvent({ id: 'e', startsAt: inHours(48), endsAt: inHours(50) })
  const at = (hours: number) => new Date(Date.parse(inHours(hours)))
  const stage = (state: ConnectionsState, hours: number) => stageFor(event, state, at(hours))

  it('invites before the pod forms, and closes the invite after', () => {
    expect(podFormsAt(event).toISOString()).toBe(inHours(24))
    expect(stage(EMPTY_CONNECTIONS, 0)).toBe('invite')
    expect(stage(EMPTY_CONNECTIONS, 30)).toBe('closed')
    const declined = run({ type: 'decline', eventId: 'e' })
    expect(stage(declined, 0)).toBe('declined')
    expect(stage(declined, 30)).toBe('closed')
  })

  it('walks through the flow once opted in', () => {
    const opted = run(optIn('e'))
    expect(stage(opted, 0)).toBe('waiting')
    expect(stage(opted, 30)).toBe('pod')
    expect(stage(opted, 49)).toBe('meet')
    const met = connectionsReducer(opted, { type: 'met-confirmed', eventId: 'e', mutual: [] })
    expect(stage(met, 49)).toBe('met')
    expect(stage(met, 51)).toBe('pick')
    const sent = connectionsReducer(met, { type: 'picks-sent', eventId: 'e', connections: [] })
    expect(stage(sent, 51)).toBe('done')
    expect(stage(sent, 50 + 73)).toBe('closed')
    expect(stage(run(optIn('e'), { type: 'leave', eventId: 'e' }), 30)).toBe('left')
  })

  it('lets example events preview later steps, never real ones', () => {
    const preview = (step: 'pod' | 'event' | 'after') =>
      run(optIn('e'), { type: 'preview', eventId: 'e', step })
    expect(stage(preview('pod'), 0)).toBe('pod')
    expect(stage(preview('event'), 0)).toBe('meet')
    expect(stage({ ...preview('after'), metBack: { e: [] } }, 0)).toBe('pick')
    expect(effectiveNow(event, preview('pod'), at(100))).toEqual(at(100))
    const real = { ...event, isExample: false }
    expect(stageFor(real, preview('pod'), at(0))).toBe('waiting')
  })
})

describe('pruneConnections', () => {
  it('deletes per-event data once the pick window closes, keeping connections and blocks', () => {
    const recent = makeEvent({ id: 'recent', startsAt: inHours(-30), endsAt: inHours(-28) })
    const old = makeEvent({ id: 'old', startsAt: inHours(-80), endsAt: inHours(-78) })
    const per = (id: string): ConnectionsAction[] => [
      optIn(id),
      { type: 'leave', eventId: id },
      { type: 'toggle-met', eventId: id, personId: 'p1' },
      { type: 'met-confirmed', eventId: id, mutual: ['p1'] },
      { type: 'pick', eventId: id, personId: 'p1', pick: 'keep' },
      { type: 'picks-sent', eventId: id, connections: [] },
      { type: 'preview', eventId: id, step: 'after' },
    ]
    const state = run(
      ...per('recent'),
      ...per('old'),
      ...per('gone'),
      { type: 'block', personId: 'x' },
      {
        type: 'picks-sent',
        eventId: 'old',
        connections: [sam],
      },
    )
    const pruned = pruneConnections(state, [recent, old], NOW)
    expect(Object.keys(pruned.optIns)).toEqual(['recent'])
    expect(pruned.left).toEqual(['recent'])
    expect(Object.keys(pruned.met)).toEqual(['recent'])
    expect(Object.keys(pruned.metBack)).toEqual(['recent'])
    expect(Object.keys(pruned.picks)).toEqual(['recent'])
    expect(pruned.picksSent).toEqual(['recent'])
    expect(Object.keys(pruned.preview)).toEqual(['recent'])
    expect(pruned.connections).toEqual([sam])
    expect(pruned.blocked).toEqual(['x'])
  })
})

describe('parseConnections', () => {
  it('round-trips valid state', () => {
    const state = run(
      optIn('e'),
      { type: 'decline', eventId: 'f' },
      { type: 'toggle-met', eventId: 'e', personId: 'p1' },
      { type: 'met-confirmed', eventId: 'e', mutual: ['p1'] },
      { type: 'pick', eventId: 'e', personId: 'p1', pick: 'keep' },
      { type: 'picks-sent', eventId: 'e', connections: [sam] },
      { type: 'share', personId: 'p1', network: 'linkedin', handle: 'linkedin.com/in/me' },
      { type: 'block', personId: 'x' },
      { type: 'report', personId: 'x' },
      { type: 'leave', eventId: 'g' },
      { type: 'preview', eventId: 'e', step: 'event' },
    )
    expect(parseConnections(JSON.parse(JSON.stringify(state)))).toEqual(state)
  })

  it('starts empty from nothing or junk', () => {
    expect(parseConnections(null)).toEqual(EMPTY_CONNECTIONS)
    expect(parseConnections([])).toEqual(EMPTY_CONNECTIONS)
    expect(parseConnections({})).toEqual(EMPTY_CONNECTIONS)
  })

  it('drops damaged entries one by one', () => {
    const parsed = parseConnections({
      podAnswer: { prompt: 'Your star sign', answer: 'x' },
      socials: { instagram: '@me', myspace: 'x', linkedin: 3 },
      optIns: {
        a: { intents: ['make-friends'], mode: 'one' },
        b: { intents: ['romance'], mode: 'group' },
        c: { intents: [], mode: 'group' },
        d: { intents: ['make-friends'], mode: 'crowd' },
        e: { mode: 'group' },
        f: 'maybe',
        g: ['make-friends'],
      },
      met: { a: ['p1', 2], b: 'p1' },
      metBack: { a: 'p1' },
      picks: { a: { p1: 'keep', p2: 'love' }, b: [] },
      connections: [
        sam,
        { ...sam, firstName: 3 },
        null,
        { ...sam, personId: 'p9', shared: 'linkedin' },
      ],
      preview: { a: 'after', b: 'tomorrow' },
    })
    expect(parsed.podAnswer).toBeNull()
    expect(parsed.socials).toEqual({ instagram: '@me' })
    expect(parsed.optIns).toEqual({ a: { intents: ['make-friends'], mode: 'one' } })
    expect(parsed.met).toEqual({ a: ['p1'] })
    expect(parsed.metBack).toEqual({})
    expect(parsed.picks).toEqual({ a: { p1: 'keep' }, b: {} })
    expect(parsed.connections).toEqual([sam, { ...sam, personId: 'p9', shared: [] }])
    expect(parsed.preview).toEqual({ a: 'after' })
    expect(parseConnections({ connections: 'x', socials: null }).connections).toEqual([])
  })
})
