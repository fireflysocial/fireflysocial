import type { CityEvent } from '../../../lib/events.ts'
import { notForMeReason, type NotForMeReason } from '../../../lib/plans.ts'
import { useAppState } from '../appState.ts'

const REASONS: { id: NotForMeReason; label: string }[] = [
  { id: 'too-far', label: 'Too far' },
  { id: 'too-expensive', label: 'Too expensive' },
  { id: 'not-my-thing', label: 'Not my thing' },
]

interface HiddenRowProps {
  event: CityEvent
  onUndo: () => void
}

/** What a "Not for me" row turns into: an optional reason, and undo (v4 §1). */
export function HiddenRow({ event, onUndo }: HiddenRowProps) {
  const { plans, dispatch } = useAppState()
  const chosen = notForMeReason(plans, event.id)
  return (
    <li className="a-row a-row--hidden">
      <p className="small" role="status">
        Hidden: {event.title}. {chosen ? 'Thanks, that helps.' : 'What was off? (optional)'}
      </p>
      <div className="row-actions">
        {REASONS.map((reason) => (
          <button
            key={reason.id}
            type="button"
            className="a-chip a-chip--small"
            aria-pressed={chosen === reason.id}
            onClick={() => {
              dispatch({ type: 'not-for-me', eventId: event.id, reason: reason.id })
            }}
          >
            {reason.label}
          </button>
        ))}
        <button
          type="button"
          className="text-link"
          onClick={() => {
            dispatch({ type: 'undo-feedback', eventId: event.id })
            onUndo()
          }}
        >
          Undo
        </button>
      </div>
    </li>
  )
}
