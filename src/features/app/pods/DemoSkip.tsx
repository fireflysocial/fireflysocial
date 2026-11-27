import type { CityEvent } from '../../../lib/events.ts'
import type { PreviewStep } from '../../../lib/pods/connections.ts'
import { useAppState } from '../appState.ts'

const LABELS: Record<PreviewStep, string> = {
  pod: 'Skip to when the pod forms',
  event: 'Skip to the event',
  after: 'Skip to after the event',
}

/**
 * Example events only: jump ahead in time to see the next step without waiting a day. Real
 * events always follow the real clock.
 */
export function DemoSkip({ event, step }: { event: CityEvent; step: PreviewStep }) {
  const { dispatchConnections } = useAppState()
  if (!event.isExample) return null
  return (
    <button
      type="button"
      className="text-link demo-skip"
      onClick={() => {
        dispatchConnections({ type: 'preview', eventId: event.id, step })
      }}
    >
      <span className="ctx ctx--dusk">Example only</span>
      {LABELS[step]}
    </button>
  )
}
