import { confirmMet, type PodMateCard } from '../../../data/pods.ts'
import type { CityEvent } from '../../../lib/events.ts'
import { eventIntentLabel } from '../../../lib/pods/intents.ts'
import { useAppState } from '../appState.ts'

/**
 * "We met" (connection-flow.md §E): tap each pod-mate you actually talked to. It only counts
 * when they tap you too. No location is ever used to check it.
 */
export function WeMet({ event, mates }: { event: CityEvent; mates: readonly PodMateCard[] }) {
  const { connections, dispatchConnections } = useAppState()
  const tapped = connections.met[event.id] ?? []
  const sent = connections.metBack[event.id] !== undefined

  if (sent) {
    return (
      <div className="stack stack--tight">
        <h1 className="title">Thanks.</h1>
        <p className="a-muted">
          After the event, you can choose who you’d like to keep meeting. Only people who also said
          they met you will be there.
        </p>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="label2">
        <span className="ctx">At {event.title}</span>
        <h1 className="title">Who did you meet?</h1>
      </div>
      <p className="a-muted">
        Tap each pod-mate you actually talked to. It only counts when they tap you too. Then put
        your phone away.
      </p>
      <div className="checks">
        {mates.map((mate, index) => (
          <div key={mate.id} className="check">
            <input
              id={`met-${mate.id}`}
              type="checkbox"
              checked={tapped.includes(mate.id)}
              onChange={() => {
                dispatchConnections({ type: 'toggle-met', eventId: event.id, personId: mate.id })
              }}
            />
            <label className="label2" htmlFor={`met-${mate.id}`}>
              <span className="ctx">{mate.intents.map(eventIntentLabel).join(' · ')}</span>
              <span>Pod-mate {index + 1}</span>
            </label>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn btn--glow btn--fit"
        onClick={() => {
          void confirmMet(event, tapped).then((mutual) => {
            dispatchConnections({
              type: 'met-confirmed',
              eventId: event.id,
              mutual: mutual.map((m) => m.id),
            })
          })
        }}
      >
        Done
      </button>
    </div>
  )
}
