import { PROJECT_ROLES, PROJECT_STAGES } from '../../../lib/profile.ts'
import { ChipSet } from './ChipSet.tsx'
import { ChoiceList } from './ChoiceList.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** Only for people looking for a co-founder or collaborators: what they'd bring, and how far along. */
export function StepProject({ draft, update }: StepProps) {
  return (
    <div className="step">
      <StepIntro title="Tell us about the project side">
        So we can put you in rooms with people who fit.
      </StepIntro>
      <div className="step__body stack">
        <ChipSet
          label="What you’d bring"
          options={PROJECT_ROLES}
          picked={draft.projectRoles}
          onChange={(projectRoles) => {
            update({ projectRoles })
          }}
        />
        <div className="stack stack--tight">
          <h2 className="a-chips__label" id="stage-label">
            Where your idea is at
          </h2>
          <ChoiceList
            name="stage"
            labelledBy="stage-label"
            choices={PROJECT_STAGES}
            value={draft.projectStage}
            onChange={(projectStage) => {
              update({ projectStage })
            }}
          />
        </div>
      </div>
    </div>
  )
}
