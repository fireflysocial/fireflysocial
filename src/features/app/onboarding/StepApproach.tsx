import { APPROACHES } from '../../../lib/profile.ts'
import { ChoiceList } from './ChoiceList.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** How walking in feels, answered honestly and privately, with a reply that meets them there. */
export function StepApproach({ draft, update }: StepProps) {
  const reply = APPROACHES.find((a) => a.id === draft.approach)?.reply
  return (
    <div className="step">
      <StepIntro title="Walking into a room of strangers feels…">
        Be honest. Only you see this.
      </StepIntro>
      <div className="step__body stack">
        <ChoiceList
          name="approach"
          choices={APPROACHES}
          value={draft.approach}
          onChange={(approach) => {
            update({ approach })
          }}
        />
        <p className="lede" aria-live="polite">
          {reply}
        </p>
      </div>
    </div>
  )
}
