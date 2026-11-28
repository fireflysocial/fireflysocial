import { formatPrice } from '../../../lib/price.ts'
import type { BudgetId } from '../../../lib/profile.ts'
import { useAppState } from '../appState.ts'
import { ChoiceList } from './ChoiceList.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** Budget, defaulting to free or low cost in the city's currency (v3 #16). */
export function StepBudget({ draft, update }: StepProps) {
  const { city } = useAppState()
  const choices: { id: BudgetId; label: string }[] = [
    { id: 'free', label: 'Free only' },
    { id: 'low', label: `Under ${formatPrice(city.lowCostCap, city.currency, city.locale)}` },
    { id: 'any', label: 'Any price' },
  ]
  return (
    <div className="step">
      <StepIntro title="What would you usually spend on an event?" />
      <div className="step__body">
        <ChoiceList
          name="budget"
          choices={choices}
          value={draft.budget}
          onChange={(budget) => {
            update({ budget })
          }}
        />
      </div>
    </div>
  )
}
