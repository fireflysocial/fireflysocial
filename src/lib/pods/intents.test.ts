import { describe, expect, it } from 'vitest'
import { defaultEventIntents, eventIntentLabel, intentsFit, isEventIntent } from './intents.ts'

describe('event intents', () => {
  it('prefill from "What brings you to Firefly?", at most two', () => {
    expect(defaultEventIntents(['cofounder'])).toEqual(['meet-cofounder'])
    expect(defaultEventIntents(['friends', 'network', 'collaborators'])).toEqual([
      'make-friends',
      'grow-network',
    ])
    expect(defaultEventIntents(['events'])).toEqual(['open-to-anything'])
    expect(defaultEventIntents([])).toEqual(['open-to-anything'])
  })

  it('have labels and recognise their own ids', () => {
    expect(eventIntentLabel('find-collaborators')).toBe('Find collaborators')
    expect(isEventIntent('meet-cofounder')).toBe(true)
    expect(isEventIntent('romance')).toBe(false)
  })

  it('fit when the same, when either is open to anything, or builder with builder', () => {
    expect(intentsFit(['make-friends'], ['make-friends'])).toBe(true)
    expect(intentsFit(['make-friends'], ['open-to-anything'])).toBe(true)
    expect(intentsFit(['open-to-anything'], ['meet-cofounder'])).toBe(true)
    expect(intentsFit(['find-collaborators'], ['meet-cofounder'])).toBe(true)
    expect(intentsFit(['meet-cofounder'], ['find-collaborators'])).toBe(true)
    expect(intentsFit(['make-friends'], ['meet-cofounder'])).toBe(false)
    expect(intentsFit(['make-friends', 'grow-network'], ['grow-network'])).toBe(true)
  })
})
