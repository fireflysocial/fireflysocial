import { LANGUAGES } from '../../../lib/profile.ts'
import { ChipSet } from './ChipSet.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** Languages spoken and being learned: language exchanges, and pod-mates who share one. */
export function StepLanguages({ draft, update }: StepProps) {
  return (
    <div className="step">
      <StepIntro title="Which languages do you speak?">
        Tap any. Learning one? Add it below for language exchanges.
      </StepIntro>
      <div className="step__body stack">
        <ChipSet
          label="I speak"
          options={LANGUAGES}
          picked={draft.languages}
          onChange={(languages) => {
            update({ languages })
          }}
        />
        <ChipSet
          label="I’m learning"
          options={LANGUAGES}
          picked={draft.learning}
          onChange={(learning) => {
            update({ learning })
          }}
        />
      </div>
    </div>
  )
}
