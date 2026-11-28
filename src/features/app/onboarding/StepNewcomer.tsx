import { useAppState } from '../appState.ts'
import { ChoiceList } from './ChoiceList.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

const CHOICES = [
  { id: 'yes', label: 'Yes, I’m new here', hint: 'We’ll favour newcomer-friendly events' },
  { id: 'no', label: 'No, I’ve been here a while' },
] as const

/** "New to [city]?" (v4 step 8). No arrival date is asked. */
export function StepNewcomer({ draft, update }: StepProps) {
  const { city } = useAppState()
  const value = draft.newcomer === null ? null : draft.newcomer ? 'yes' : 'no'
  return (
    <div className="step">
      <StepIntro title={`New to ${city.name}?`} />
      <div className="step__body">
        <ChoiceList
          name="newcomer"
          choices={CHOICES}
          value={value}
          onChange={(answer) => {
            update({ newcomer: answer === 'yes' })
          }}
        />
      </div>
    </div>
  )
}
