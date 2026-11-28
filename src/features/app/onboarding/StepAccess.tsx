import { ACCESS_NEEDS } from '../../../lib/profile.ts'
import { ChipSet } from './ChipSet.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** Private accessibility needs, used only to rank and filter events (v3 #42). */
export function StepAccess({ draft, update }: StepProps) {
  return (
    <div className="step">
      <StepIntro title="Anything that makes an event work for you?">
        Private. Only used to rank and filter events for you.
      </StepIntro>
      <div className="step__body">
        <ChipSet
          label="Accessibility needs"
          hideLabel
          options={ACCESS_NEEDS}
          picked={draft.accessNeeds}
          onChange={(accessNeeds) => {
            update({ accessNeeds })
          }}
        />
      </div>
    </div>
  )
}
