import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { ArrowIcon } from '../../../components/ArrowIcon.tsx'
import { getPod, type PodView } from '../../../data/pods.ts'
import { stageFor } from '../../../lib/pods/connections.ts'
import { formatEventWhen } from '../../../lib/time.ts'
import { useAppState, useProfile } from '../appState.ts'
import { useClock } from '../clock.ts'
import { EventsStatus } from '../feed/EventsStatus.tsx'
import { ExampleNote } from '../ui/ExampleNote.tsx'
import { DemoSkip } from './DemoSkip.tsx'
import { KeepMeeting } from './KeepMeeting.tsx'
import { PodMates } from './PodMates.tsx'
import { useEvent } from './useEvent.ts'
import { WeMet } from './WeMet.tsx'

/** A conversation starter for the pod, from the event and nothing about anyone (§8.15). */
const STARTER = 'What’s something you made or tried this year that nobody asked you to?'

/**
 * Everything after opting in, for one event (connection-flow.md §C–G): the pod reveal, "We
 * met", keep meeting, and how it went. Each step appears only in its own time window.
 */
export function PodPage() {
  const { events, connections, dispatchConnections, city } = useAppState()
  const profile = useProfile()
  const clock = useClock()
  const event = useEvent()
  const [pod, setPod] = useState<PodView | null>(null)
  const optIn = event ? connections.optIns[event.id] : undefined

  useEffect(() => {
    if (!event || typeof optIn !== 'object') return
    let current = true
    void getPod(event, { optIn, interests: profile.interests, blocked: [] }).then((view) => {
      if (current) setPod(view)
    })
    return () => {
      current = false
    }
  }, [event, optIn, profile.interests])

  if (events.status !== 'ready') return <EventsStatus />
  const stage = event ? stageFor(event, connections, clock()) : 'closed'
  if (
    !event ||
    stage === 'invite' ||
    stage === 'declined' ||
    stage === 'waiting' ||
    stage === 'closed'
  ) {
    return (
      <Navigate to={event ? `/app/events/${encodeURIComponent(event.id)}` : '/app/feed'} replace />
    )
  }

  const eventPath = `/app/events/${encodeURIComponent(event.id)}`
  const header = (
    <div className="stack stack--tight">
      <Link className="text-link back" to={eventPath}>
        <ArrowIcon direction="left" />
        {event.title}
      </Link>
    </div>
  )

  if (stage === 'left') {
    return (
      <div className="stack">
        {header}
        <h1 className="title">You’ve left this pod.</h1>
        <p className="a-muted">Your pod sees one fewer card, and nothing else.</p>
        {Date.parse(event.startsAt) > clock().getTime() && (
          <button
            type="button"
            className="btn btn--fit"
            onClick={() => {
              dispatchConnections({ type: 'rejoin', eventId: event.id })
            }}
          >
            Rejoin
          </button>
        )}
      </div>
    )
  }

  if (!pod) {
    return (
      <p className="a-muted" role="status">
        Finding your pod…
      </p>
    )
  }

  if (pod.kind === 'none') {
    return (
      <div className="stack">
        {header}
        <h1 className="title">No pod this time.</h1>
        <p className="a-muted">
          Not enough people going wanted the same thing from this event. Enjoy it anyway: you’ll get
          a pod at the next one if there is one.
        </p>
      </div>
    )
  }

  const mates = pod.mates.filter((m) => !connections.blocked.includes(m.id))

  return (
    <div className="split split--event">
      <div className="split__main stack">
        {header}
        {pod.isExample && (
          <ExampleNote>
            These pod-mates are made up, and their answers are simulated, so you can try the flow.
          </ExampleNote>
        )}
        {stage === 'pod' && (
          <>
            <div className="label2">
              <span className="ctx">Your pod for {event.title}</span>
              <h1 className="title">Pod {pod.podWord}</h1>
            </div>
            <p className="reason">
              <span className="dot" aria-hidden="true" />
              {pod.reason}
            </p>
            <PodMates mates={mates} myInterests={profile.interests} />
          </>
        )}
        {(stage === 'meet' || stage === 'met') && <WeMet event={event} mates={mates} />}
        {(stage === 'pick' || stage === 'done') && <KeepMeeting event={event} />}
      </div>
      <aside className="split__aside stack stack--tight" aria-label="Where and when">
        <p className="label2">
          <span className="ctx">Meet your pod</span>
          <span>{formatEventWhen(new Date(event.startsAt), event.timeZone, city.locale)}</span>
        </p>
        <p className="label2">
          <span className="ctx">Where</span>
          <span>
            {event.venue}, {event.neighbourhood}. Inside the entrance: look for the Firefly sign and
            say “{pod.podWord}”.
          </span>
        </p>
        {stage === 'pod' && (
          <>
            <p className="label2">
              <span className="ctx">A starter for the pod</span>
              <span>{STARTER}</span>
            </p>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                dispatchConnections({ type: 'leave', eventId: event.id })
              }}
            >
              Leave this pod
            </button>
            <DemoSkip event={event} step="event" />
          </>
        )}
        {stage === 'met' && <DemoSkip event={event} step="after" />}
      </aside>
    </div>
  )
}
