import { FREE_TIMES } from '../../../lib/profile.ts'
import { ChipSet } from './ChipSet.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** "When you're free" (v4 step 7). */
export function StepFree({ draft, update }: StepProps) {
  return (
    <div className="step">
      <StepIntro title="When are you usually free?">Tap any.</StepIntro>
      <div className="step__body">
        <ChipSet
          label="When you’re free"
          hideLabel
          options={FREE_TIMES}
          picked={draft.freeTimes}
          onChange={(freeTimes) => {
            update({ freeTimes })
          }}
        />
      </div>
    </div>
  )
}
