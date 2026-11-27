import { afterEach, describe, expect, it } from 'vitest'
import { EMPTY_PLANS, plansReducer } from '../lib/plans.ts'
import { makeProfile } from '../test/fixtures.ts'
import { deletePlans, loadPlans, savePlans } from './plans.ts'
import { deleteProfile, loadProfile, saveProfile } from './profile.ts'

afterEach(() => {
  localStorage.clear()
})

describe('profile on this device', () => {
  it('saves, loads and deletes', () => {
    expect(loadProfile()).toBeNull()
    const profile = makeProfile()
    expect(saveProfile(profile)).toBe(true)
    expect(loadProfile()).toEqual(profile)
    deleteProfile()
    expect(loadProfile()).toBeNull()
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
