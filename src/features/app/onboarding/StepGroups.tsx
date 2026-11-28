import { GROUP_SIZES } from '../../../lib/profile.ts'
import { ChoiceList } from './ChoiceList.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** Where the person opens up most. */
export function StepGroups({ draft, update }: StepProps) {
  return (
    <div className="step">
      <StepIntro title="Where do you open up most?" />
      <div className="step__body">
        <ChoiceList
          name="groups"
          choices={GROUP_SIZES}
          value={draft.groupSize}
          onChange={(groupSize) => {
            update({ groupSize })
          }}
        />
      </div>
    </div>
  )
}
