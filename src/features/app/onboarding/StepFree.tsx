import { toggle } from '../../../lib/onboarding.ts'
import { FREE_TIMES } from '../../../lib/profile.ts'
import { Chip } from '../ui/Chip.tsx'
import type { StepProps } from './Onboarding.tsx'

/** "When you're free" (v4 step 7). */
export function StepFree({ draft, update }: StepProps) {
  return (
    <div className="step">
      <div className="step__intro stack stack--tight">
        <h1 className="title">When are you usually free?</h1>
        <p className="a-muted">Tap any.</p>
      </div>
      <div className="step__body a-chips" role="group" aria-label="When you’re free">
        {FREE_TIMES.map((time) => (
          <Chip
            key={time.id}
            pressed={draft.freeTimes.includes(time.id)}
            onToggle={() => {
              update({ freeTimes: toggle(draft.freeTimes, time.id) })
            }}
          >
            {time.label}
          </Chip>
        ))}
      </div>
    </div>
  )
}
