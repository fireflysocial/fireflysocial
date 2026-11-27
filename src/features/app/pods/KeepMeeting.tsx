import { Link } from 'react-router'
import { firstNames, sendPicks } from '../../../data/pods.ts'
import type { CityEvent } from '../../../lib/events.ts'
import { metBackFor } from '../../../lib/pods/connections.ts'
import { keepMeetingLine } from '../../../lib/pods/podReason.ts'
import { useAppState } from '../appState.ts'

/**
 * Keep meeting (connection-flow.md §F–G). Lists only pod-mates who both marked "We met". Picks
 * are private: a one-sided pick is never shown or hinted at (CLAUDE.md §8.4).
 */
export function KeepMeeting({ event }: { event: CityEvent }) {
  const { connections, dispatchConnections } = useAppState()
  const metBack = metBackFor(connections, event.id)
  const names = firstNames(metBack)
  const picks = connections.picks[event.id] ?? {}
  const sent = connections.picksSent.includes(event.id)
  const mutual = connections.connections.filter((c) => c.eventId === event.id)

  if (sent) {
    return mutual.length > 0 ? (
      <div className="stack">
        <h1 className="title">{keepMeetingLine(mutual.map((c) => c.firstName))}</h1>
        <p className="a-muted">Share a way to stay in touch, if you like. You choose each one.</p>
        <ul className="a-rows">
          {mutual.map((c) => (
            <li key={c.personId} className="a-row">
              <Link className="a-row__title" to={`/app/people/${encodeURIComponent(c.personId)}`}>
                {c.firstName}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <div className="stack stack--tight">
        <h1 className="title">No new connections this time.</h1>
        <p className="a-muted">
          That’s normal after one meeting. What makes the difference is meeting again: go to the
          next one, and you’ll get a pod there too.
        </p>
      </div>
    )
  }

  if (metBack.length === 0) {
    return (
      <div className="stack stack--tight">
        <h1 className="title">No one to choose this time.</h1>
        <p className="a-muted">Only pod-mates who you and they both marked as met show up here.</p>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="label2">
        <span className="ctx">After {event.title} · open for 72 hours</span>
        <h1 className="title">Anyone you’d like to keep meeting?</h1>
      </div>
      <p className="note small a-muted">
        People usually underestimate how much others enjoyed talking to them.
      </p>
      <ul className="a-rows">
        {metBack.map((id) => (
          <li key={id} className="a-row">
            <span className="a-row__title">{names[id]}</span>
            <div
              className="row-actions"
              role="group"
              aria-label={`Keep meeting ${String(names[id])}?`}
            >
              <button
                type="button"
                className="a-chip a-chip--small"
                aria-pressed={picks[id] === 'keep'}
                onClick={() => {
                  dispatchConnections({
                    type: 'pick',
                    eventId: event.id,
                    personId: id,
                    pick: 'keep',
                  })
                }}
              >
                Keep meeting
              </button>
              <button
                type="button"
                className="a-chip a-chip--small"
                aria-pressed={picks[id] === 'not'}
                onClick={() => {
                  dispatchConnections({
                    type: 'pick',
                    eventId: event.id,
                    personId: id,
                    pick: 'not',
                  })
                }}
              >
                Not this time
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="small a-muted">
        Private. Nobody is ever told if you choose them and they don’t choose you.
      </p>
      <button
        type="button"
        className="btn btn--glow btn--fit"
        onClick={() => {
          const keep = Object.entries(picks)
            .filter(([, pick]) => pick === 'keep')
            .map(([id]) => id)
          void sendPicks(event, keep).then((found) => {
            dispatchConnections({ type: 'picks-sent', eventId: event.id, connections: found })
          })
        }}
      >
        Send privately
      </button>
    </div>
  )
}
