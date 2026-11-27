import { Link } from 'react-router'
import type { CityEvent } from '../../../lib/events.ts'
import { podFormsAt, stageFor } from '../../../lib/pods/connections.ts'
import { eventIntentLabel } from '../../../lib/pods/intents.ts'
import { formatEventWhen } from '../../../lib/time.ts'
import { useAppState } from '../appState.ts'
import { useClock } from '../clock.ts'
import { DemoSkip } from './DemoSkip.tsx'

/**
 * The connection flow's entry on an event the person is going to (connection-flow.md §B):
 * opt in, wait for the pod, then open it. Opting in is per event and off by default.
 */
export function MeetingPeople({ event }: { event: CityEvent }) {
  const { connections, dispatchConnections, city } = useAppState()
  const clock = useClock()
  const stage = stageFor(event, connections, clock())
  const podPath = `/app/events/${encodeURIComponent(event.id)}/pod`
  const optIn = connections.optIns[event.id]

  return (
    <section className="meeting stack stack--tight" aria-labelledby="meeting-heading">
      <h2 className="subtitle" id="meeting-heading">
        Meeting people
      </h2>
      {stage === 'invite' && (
        <>
          <p className="a-muted">
            Open to meeting people at this event? Firefly can put you in a small pod of people going
            for the same reason, with a set place to meet.
          </p>
          <Link className="btn" to={`/app/events/${encodeURIComponent(event.id)}/meet`}>
            Yes, I’m open
          </Link>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              dispatchConnections({ type: 'decline', eventId: event.id })
            }}
          >
            Not this time
          </button>
        </>
      )}
      {stage === 'declined' && (
        <>
          <p className="a-muted">No pod for this one. That’s fine, and nobody is told.</p>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              dispatchConnections({ type: 'undecline', eventId: event.id })
            }}
          >
            Change my mind
          </button>
        </>
      )}
      {stage === 'waiting' && typeof optIn === 'object' && (
        <>
          <p>
            You’re in. Your pod forms{' '}
            {formatEventWhen(podFormsAt(event), event.timeZone, city.locale)}.
          </p>
          <p className="small a-muted">
            Here for: {optIn.intents.map(eventIntentLabel).join(', ')}.{' '}
            {optIn.mode === 'one' ? 'One person first.' : 'A small group.'}
          </p>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              dispatchConnections({ type: 'leave', eventId: event.id })
            }}
          >
            Leave
          </button>
          <DemoSkip event={event} step="pod" />
        </>
      )}
      {(stage === 'pod' || stage === 'meet' || stage === 'met' || stage === 'pick') && (
        <Link className="btn" to={podPath}>
          {stage === 'pod'
            ? 'See your pod'
            : stage === 'pick'
              ? 'Who would you like to keep meeting?'
              : 'Your pod'}
        </Link>
      )}
      {(stage === 'done' || stage === 'left') && (
        <Link className="text-link" to={podPath}>
          {stage === 'done' ? 'See how it went' : 'You left this pod'}
        </Link>
      )}
      {stage === 'closed' && <p className="a-muted">Pods for this event have closed.</p>}
    </section>
  )
}
