import { isStepId, parseDraft, type Draft, type StepId } from '../lib/onboarding.ts'
import { readStored, removeStored, writeStored } from '../lib/platform/index.ts'

/**
 * Onboarding answers in progress, kept on this device between screens so a reload or a closed app
 * picks up where the person left off. Sent to Firefly only when they finish, then deleted.
 */
const KEY = 'firefly.onboarding.v1'

export interface SavedDraft {
  draft: Draft
  step: StepId
}

export function loadDraft(): SavedDraft | null {
  const raw = readStored(KEY)
  if (typeof raw !== 'object' || raw === null) return null
  const { draft: rawDraft, step }: Record<string, unknown> = { ...raw }
  const draft = parseDraft(rawDraft)
  return draft && isStepId(step) ? { draft, step } : null
}

export function saveDraft(draft: Draft, step: StepId): void {
  writeStored(KEY, { draft, step })
}

export function deleteDraft(): void {
  removeStored(KEY)
}
