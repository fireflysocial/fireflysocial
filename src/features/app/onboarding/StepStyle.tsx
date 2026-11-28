import { EVENT_STYLES } from '../../../lib/profile.ts'
import { ChoiceList } from './ChoiceList.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** The shape of event the person enjoys most. */
export function StepStyle({ draft, update }: StepProps) {
  return (
    <div className="step">
      <StepIntro title="What kind of event suits you best?" />
      <div className="step__body">
        <ChoiceList
          name="style"
          choices={EVENT_STYLES}
          value={draft.eventStyle}
          onChange={(eventStyle) => {
            update({ eventStyle })
          }}
        />
      </div>
    </div>
  )
}
