import { toggle } from '../../../lib/onboarding.ts'
import { INTENTS } from '../../../lib/profile.ts'
import { Chip } from '../ui/Chip.tsx'
import type { StepProps } from './Onboarding.tsx'

/** "What brings you to Firefly?" (v4 step 5). Private; it ranks the feed. */
export function StepIntents({ draft, update }: StepProps) {
  return (
    <div className="step">
      <div className="step__intro stack stack--tight">
        <h1 className="title">What brings you to Firefly?</h1>
        <p className="a-muted">Tap any. This stays private. It helps us pick events for you.</p>
      </div>
      <div className="step__body a-chips" role="group" aria-label="What brings you to Firefly">
        {INTENTS.map((intent) => (
          <Chip
            key={intent.id}
            pressed={draft.intents.includes(intent.id)}
            onToggle={() => {
              update({ intents: toggle(draft.intents, intent.id) })
            }}
          >
            {intent.label}
          </Chip>
        ))}
      </div>
    </div>
  )
}
