import { WORK_AREAS } from '../../../lib/profile.ts'
import { ChoiceList } from './ChoiceList.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** What the person spends their days on. Never their workplace or school (CLAUDE.md §8.3). */
export function StepWork({ draft, update }: StepProps) {
  return (
    <div className="step">
      <StepIntro title="What do you spend your days on?">
        Roughly. We never ask where you work or study.
      </StepIntro>
      <div className="step__body">
        <ChoiceList
          name="work"
          choices={WORK_AREAS}
          value={draft.workArea}
          onChange={(workArea) => {
            update({ workArea })
          }}
        />
      </div>
    </div>
  )
}
