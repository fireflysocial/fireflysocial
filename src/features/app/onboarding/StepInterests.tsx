import { INTEREST_GROUPS, MIN_INTERESTS } from '../../../lib/interests.ts'
import { ChipSet } from './ChipSet.tsx'
import type { StepProps } from './Onboarding.tsx'

/** The core screen (v4 step 6): at least three interests, in everyday words. */
export function StepInterests({ draft, update }: StepProps) {
  const count = draft.interests.length
  return (
    <div className="step">
      <div className="step__intro stack stack--tight">
        <h1 className="title">What are you into?</h1>
        <p className="a-muted" aria-live="polite">
          {count >= MIN_INTERESTS
            ? `${String(count)} picked. Add more if you like.`
            : `Tap at least ${String(MIN_INTERESTS)}. ${String(count)} picked so far.`}
        </p>
      </div>
      <div className="step__body stack interest-groups">
        {INTEREST_GROUPS.map((group) => (
          <ChipSet
            key={group.label}
            label={group.label}
            options={group.interests}
            picked={draft.interests}
            onChange={(interests) => {
              update({ interests })
            }}
          />
        ))}
      </div>
    </div>
  )
}
