import { INTENTS } from '../../../lib/profile.ts'
import { ChipSet } from './ChipSet.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** "What brings you to Firefly?" (v4 step 5). Private; it ranks the feed. */
export function StepIntents({ draft, update }: StepProps) {
  return (
    <div className="step">
      <StepIntro title="What brings you to Firefly?">
        Tap any. This stays private. It helps us pick events for you.
      </StepIntro>
      <div className="step__body">
        <ChipSet
          label="What brings you to Firefly"
          hideLabel
          options={INTENTS}
          picked={draft.intents}
          onChange={(intents) => {
            update({ intents })
          }}
        />
      </div>
    </div>
  )
}
