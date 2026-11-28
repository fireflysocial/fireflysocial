import { describe, expect, it } from 'vitest'
import { makeProfile } from '../test/fixtures.ts'
import {
  draftFromProfile,
  emptyDraft,
  firstIncompleteStep,
  isStepId,
  parseDraft,
  resolveStep,
  SECTION_LABELS,
  SECTIONS,
  stepAnswered,
  stepComplete,
  stepPosition,
  STEPS,
  toggle,
  toProfile,
  visibleSteps,
  type Draft,
  type StepId,
} from './onboarding.ts'

const ready: Draft = {
  ...emptyDraft(),
  adult: true,
  pledge: true,
  firstName: ' Sam ',
  interests: ['board-games', 'pottery', 'trivia'],
}

const ids = (draft: Draft) => visibleSteps(draft).map((step) => step.id)
const step = (id: StepId) => resolveStep(id, ready)

describe('onboarding steps', () => {
  it('starts with free-or-low-cost as the budget and nothing else picked', () => {
    expect(emptyDraft()).toMatchObject({ budget: 'low', interests: [], newcomer: null })
  })

  it('requires 18+ and the pledge, a first name and at least 3 interests; the rest is optional', () => {
    const draft = emptyDraft()
    expect(STEPS.filter((s) => !stepComplete(s.id, draft)).map((s) => s.id)).toEqual([
      'pledge',
      'name',
      'interests',
    ])
    expect(STEPS.filter((s) => s.required).map((s) => s.id)).toEqual([
      'pledge',
      'name',
      'interests',
    ])
    expect(stepComplete('pledge', { ...draft, adult: true })).toBe(false)
    expect(stepComplete('interests', { ...draft, interests: ['pottery', 'trivia'] })).toBe(false)
  })

  it('finds the first step still missing an answer', () => {
    expect(firstIncompleteStep(emptyDraft())).toBe('pledge')
    expect(firstIncompleteStep({ ...ready, firstName: ' ' })).toBe('name')
    expect(firstIncompleteStep(ready)).toBeNull()
  })

  it('recognises step ids', () => {
    expect(isStepId('interests')).toBe(true)
    expect(isStepId('payment')).toBe(false)
  })

  it('asks about a project only of people looking for a co-founder or collaborators', () => {
    expect(ids(ready)).not.toContain('project')
    expect(ids({ ...ready, intents: ['cofounder'] })).toContain('project')
    expect(resolveStep('project', ready).id).toBe('interests')
    expect(resolveStep('project', { ...ready, intents: ['collaborators'] }).id).toBe('project')
    expect(resolveStep('pace', ready).id).toBe('pace')
  })

  it('puts every step in a section, in order', () => {
    const order = STEPS.map((s) => SECTIONS.indexOf(s.section))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(new Set(STEPS.map((s) => s.section)).size).toBe(SECTIONS.length)
  })

  it('says where a step sits and what comes next', () => {
    expect(stepPosition(step('pledge'), ready)).toEqual({
      number: 1,
      total: 15,
      sectionLabel: SECTION_LABELS.basics,
      sectionNumber: 1,
      next: 'name',
    })
    expect(stepPosition(step('work'), ready).next).toBe('interests')
    expect(stepPosition(step('work'), { ...ready, intents: ['cofounder'] }).next).toBe('project')
    expect(stepPosition(step('access'), ready)).toMatchObject({
      number: 15,
      sectionNumber: 6,
      next: null,
    })
  })
})

describe('stepAnswered', () => {
  it.each<[StepId, Partial<Draft>]>([
    ['brings', { intents: ['friends'] }],
    ['work', { workArea: 'tech' }],
    ['project', { projectRoles: ['engineering'] }],
    ['project', { projectStage: 'idea' }],
    ['style', { eventStyle: 'talk' }],
    ['groups', { groupSize: 'small' }],
    ['approach', { approach: 'easy' }],
    ['languages', { languages: ['english'] }],
    ['languages', { learning: ['french'] }],
    ['free', { freeTimes: ['weekend-days'] }],
    ['pace', { pace: 'weekly' }],
    ['places', { neighbourhoods: ['Gastown'] }],
    ['newcomer', { newcomer: false }],
    ['access', { accessNeeds: ['captions'] }],
  ])('%s counts as answered once something is picked', (id, change) => {
    expect(stepAnswered(id, ready)).toBe(false)
    expect(stepAnswered(id, { ...ready, ...change })).toBe(true)
  })

  it('treats required steps and the budget (which has a default) as answered', () => {
    expect(stepAnswered('budget', ready)).toBe(true)
    expect(stepAnswered('pledge', emptyDraft())).toBe(true)
  })
})

describe('drafts', () => {
  it('starts a change of answers from the saved profile, already pledged', () => {
    const profile = makeProfile({ intents: ['network'] })
    const draft = draftFromProfile(profile)
    expect(draft).toMatchObject({ adult: true, pledge: true, intents: ['network'] })
    expect(draft).not.toHaveProperty('cityId')
    expect(draft).not.toHaveProperty('pledgedAt')
  })

  it('reads a stored draft back, and rejects a damaged one', () => {
    expect(parseDraft(JSON.parse(JSON.stringify(ready)))).toEqual(ready)
    expect(parseDraft({ ...ready, adult: 'yes' })).toBeNull()
    expect(parseDraft({ ...ready, pledge: undefined })).toBeNull()
    expect(parseDraft({ ...ready, intents: ['romance'] })).toBeNull()
    expect(parseDraft('draft')).toBeNull()
  })
})

describe('toProfile', () => {
  it('builds a profile from a finished draft', () => {
    expect(toProfile(ready, 'vancouver', '2026-12-03T17:00:00.000Z')).toEqual({
      ...makeProfile(),
      firstName: 'Sam',
      cityId: 'vancouver',
      interests: ['board-games', 'pottery', 'trivia'],
      budget: 'low',
      pledgedAt: '2026-12-03T17:00:00.000Z',
    })
  })

  it('keeps project answers only for people who want a co-founder or collaborators', () => {
    const project: Draft = { ...ready, projectRoles: ['operations'], projectStage: 'building' }
    expect(toProfile(project, 'vancouver', 'now')).toMatchObject({
      projectRoles: [],
      projectStage: null,
    })
    expect(toProfile({ ...project, intents: ['cofounder'] }, 'vancouver', 'now')).toMatchObject({
      projectRoles: ['operations'],
      projectStage: 'building',
    })
  })

  it('refuses an unfinished draft', () => {
    expect(() => toProfile(emptyDraft(), 'vancouver', 'now')).toThrow('not finished')
    expect(() => toProfile({ ...ready, adult: false }, 'vancouver', 'now')).toThrow('not finished')
  })
})

describe('toggle', () => {
  it('adds and removes', () => {
    expect(toggle(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggle(['a', 'b'], 'a')).toEqual(['b'])
  })
})
