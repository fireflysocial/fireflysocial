import { PACES } from '../../../lib/profile.ts'
import { ChoiceList } from './ChoiceList.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** How often the person wants to go out. Sets how many events lead the feed; there are no streaks. */
export function StepPace({ draft, update }: StepProps) {
  return (
    <div className="step">
      <StepIntro title="How often would you like to go out?">
        No pressure. You can change this any time.
      </StepIntro>
      <div className="step__body">
        <ChoiceList
          name="pace"
          choices={PACES}
          value={draft.pace}
          onChange={(pace) => {
            update({ pace })
          }}
        />
      </div>
    </div>
  )
}
