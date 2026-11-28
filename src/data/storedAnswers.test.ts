import { afterEach, describe, expect, it } from 'vitest'
import { emptyDraft } from '../lib/onboarding.ts'
import { EMPTY_PLANS, plansReducer } from '../lib/plans.ts'
import { deleteDraft, loadDraft, saveDraft } from './onboardingDraft.ts'
import { deletePlans, loadPlans, savePlans } from './plans.ts'

afterEach(() => {
  localStorage.clear()
})

describe('onboarding draft on this device', () => {
  it('saves, loads and deletes the draft and the step it was on', () => {
    expect(loadDraft()).toBeNull()
    const draft = { ...emptyDraft(), firstName: 'Sam' }
    saveDraft(draft, 'interests')
    expect(loadDraft()).toEqual({ draft, step: 'interests' })
    deleteDraft()
    expect(loadDraft()).toBeNull()
  })

  it('ignores a damaged draft', () => {
    localStorage.setItem(
      'firefly.onboarding.v1',
      JSON.stringify({ draft: emptyDraft(), step: 'x' }),
    )
    expect(loadDraft()).toBeNull()
    localStorage.setItem('firefly.onboarding.v1', JSON.stringify({ draft: {}, step: 'name' }))
    expect(loadDraft()).toBeNull()
    localStorage.setItem('firefly.onboarding.v1', '"draft"')
    expect(loadDraft()).toBeNull()
  })
})

describe('plans on this device', () => {
  it('saves, loads and deletes', () => {
    expect(loadPlans()).toEqual(EMPTY_PLANS)
    const plans = plansReducer(EMPTY_PLANS, { type: 'toggle-save', eventId: 'a' })
    expect(savePlans(plans)).toBe(true)
    expect(loadPlans()).toEqual(plans)
    deletePlans()
    expect(loadPlans()).toEqual(EMPTY_PLANS)
  })
})
