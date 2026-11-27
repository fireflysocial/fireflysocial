import { toggle } from '../../../lib/onboarding.ts'
import { formatPrice } from '../../../lib/price.ts'
import { ACCESS_NEEDS, type BudgetId } from '../../../lib/profile.ts'
import { useAppState } from '../appState.ts'
import { Chip } from '../ui/Chip.tsx'
import type { StepProps } from './Onboarding.tsx'

/** Optional extras on one screen (v4 step 8): neighbourhoods, budget, new in town, access needs. */
export function StepExtras({ draft, update }: StepProps) {
  const { city } = useAppState()
  const budgets: { id: BudgetId; label: string }[] = [
    { id: 'free', label: 'Free only' },
    { id: 'low', label: `Under ${formatPrice(city.lowCostCap, city.currency, city.locale)}` },
    { id: 'any', label: 'Any price' },
  ]
  return (
    <div className="stack">
      <h1 className="title">A few optional extras</h1>
      <p className="a-muted">Skip any of these.</p>

      <div className="a-chips" role="group" aria-label="Neighbourhoods you’d happily go to">
        <h2 className="a-chips__label">Neighbourhoods you’d happily go to</h2>
        {city.neighbourhoods.map((area) => (
          <Chip
            key={area}
            pressed={draft.neighbourhoods.includes(area)}
            onToggle={() => {
              update({ neighbourhoods: toggle(draft.neighbourhoods, area) })
            }}
          >
            {area}
          </Chip>
        ))}
      </div>

      <div className="a-chips" role="group" aria-label="Budget">
        <h2 className="a-chips__label">Budget</h2>
        {budgets.map((budget) => (
          <Chip
            key={budget.id}
            pressed={draft.budget === budget.id}
            onToggle={() => {
              update({ budget: budget.id })
            }}
          >
            {budget.label}
          </Chip>
        ))}
      </div>

      <div className="a-chips" role="group" aria-label={`New to ${city.name}?`}>
        <h2 className="a-chips__label">New to {city.name}?</h2>
        {[
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ].map((option) => (
          <Chip
            key={option.label}
            pressed={draft.newcomer === option.value}
            onToggle={() => {
              update({ newcomer: draft.newcomer === option.value ? null : option.value })
            }}
          >
            {option.label}
          </Chip>
        ))}
      </div>

      <div className="a-chips" role="group" aria-label="Accessibility needs">
        <h2 className="a-chips__label">Accessibility needs (private)</h2>
        {ACCESS_NEEDS.map((need) => (
          <Chip
            key={need.id}
            pressed={draft.accessNeeds.includes(need.id)}
            onToggle={() => {
              update({ accessNeeds: toggle(draft.accessNeeds, need.id) })
            }}
          >
            {need.label}
          </Chip>
        ))}
        <p className="small small--muted a-chips__note">
          Only used to rank and filter events for you.
        </p>
      </div>
    </div>
  )
}
