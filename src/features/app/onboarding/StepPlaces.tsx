import { useAppState } from '../appState.ts'
import { ChipSet } from './ChipSet.tsx'
import type { StepProps } from './Onboarding.tsx'
import { StepIntro } from './StepIntro.tsx'

/** Neighbourhoods the person would happily go to: picked from a list, never GPS (CLAUDE.md §8.1). */
export function StepPlaces({ draft, update }: StepProps) {
  const { city } = useAppState()
  const options = city.neighbourhoods.map((area) => ({ id: area, label: area }))
  return (
    <div className="step">
      <StepIntro title={`Where in ${city.name} would you happily go?`}>
        Tap any. We never use your location.
      </StepIntro>
      <div className="step__body">
        <ChipSet
          label="Neighbourhoods you’d happily go to"
          hideLabel
          options={options}
          picked={draft.neighbourhoods}
          onChange={(neighbourhoods) => {
            update({ neighbourhoods })
          }}
        />
      </div>
    </div>
  )
}
