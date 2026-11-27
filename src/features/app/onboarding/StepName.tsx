import { MAX_FIRST_NAME } from '../../../lib/profile.ts'
import { useAppState } from '../appState.ts'
import type { StepProps } from './Onboarding.tsx'

/** First name only, to greet the person (v4 step 4). The city is skipped while there's one. */
export function StepName({ draft, update }: StepProps) {
  const { city } = useAppState()
  return (
    <div className="step">
      <div className="step__intro">
        <h1 className="title">
          <label htmlFor="first-name">What’s your first name?</label>
        </h1>
      </div>
      <div className="step__body stack stack--tight">
        <input
          id="first-name"
          className="a-field"
          type="text"
          autoComplete="given-name"
          maxLength={MAX_FIRST_NAME}
          value={draft.firstName}
          aria-describedby="first-name-hint"
          onChange={(e) => {
            update({ firstName: e.target.value })
          }}
        />
        <p className="small small--muted" id="first-name-hint">
          Only your first name. We use it to say hello. You’re in {city.name}, Firefly’s first city.
        </p>
      </div>
    </div>
  )
}
