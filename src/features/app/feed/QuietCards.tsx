import { Link } from 'react-router'
import type { CityEvent } from '../../../lib/events.ts'
import {
  afterEventQuestions,
  registrationReminders,
  type AfterEventAnswer,
} from '../../../lib/plans.ts'
import { useAppState } from '../appState.ts'
import { useClock } from '../clock.ts'
import { GoingAnswers } from '../event/GoingAnswers.tsx'

const AFTER: { id: AfterEventAnswer; label: string }[] = [
  { id: 'good', label: 'Good' },
  { id: 'not-for-me', label: 'Not for me' },
  { id: 'didnt-go', label: 'Didn’t go' },
]

/**
 * Quiet cards at the top of the feed: "Did you register?" for events whose page was opened, and
 * one optional "Did you go? How was it?" after an event (v4 §2–3). Never pop-ups.
 */
export function QuietCards({ events }: { events: readonly CityEvent[] }) {
  const { plans, dispatch } = useAppState()
  const clock = useClock()
  const now = clock()
  const reminders = registrationReminders(plans, events, now)
  const after = afterEventQuestions(plans, events, now)
  if (reminders.length === 0 && after.length === 0) return null
  return (
    <section className="quiet" aria-labelledby="quiet-heading">
      <h2 className="ctx ctx--dusk" id="quiet-heading">
        Waiting for your answer
      </h2>
      {reminders.map((event) => (
        <div key={event.id} className="quiet__card">
          <p className="body">
            Did you register for{' '}
            <Link className="text-link" to={`/app/events/${encodeURIComponent(event.id)}`}>
              {event.title}
            </Link>
            ?
          </p>
          <GoingAnswers eventId={event.id} />
        </div>
      ))}
      {after.map((event) => (
        <div key={event.id} className="quiet__card">
          <p className="body">Did you go to {event.title}? How was it?</p>
          <div className="row-actions">
            {AFTER.map((answer) => (
              <button
                key={answer.id}
                type="button"
                className="a-chip a-chip--small"
                aria-pressed={false}
                onClick={() => {
                  dispatch({ type: 'after-event', eventId: event.id, answer: answer.id })
                }}
              >
                {answer.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
