import { Link } from 'react-router'
import type { CityEvent } from '../../../lib/events.ts'
import { hasEnded, hasStarted } from '../../../lib/events.ts'
import { isGoing } from '../../../lib/plans.ts'
import { formatEventWhen } from '../../../lib/time.ts'
import { readyEvents, useAppState } from '../appState.ts'
import { useClock } from '../clock.ts'
import { EventsStatus } from '../feed/EventsStatus.tsx'

/** The person's own plans: events they're going to and events they saved. Owner-only. */
export function PlansPage() {
  const { events, plans } = useAppState()
  const clock = useClock()
  const now = clock()
  const list = readyEvents(events)
  const going = list.filter((e) => isGoing(plans, e.id) && !hasEnded(e, now))
  const saved = list.filter(
    (e) => plans.saved.includes(e.id) && !isGoing(plans, e.id) && !hasStarted(e, now),
  )

  return (
    <div className="stack">
      <header className="label2">
        <span className="ctx">Only you can see this</span>
        <h1 className="title">Your plans</h1>
      </header>
      {events.status !== 'ready' ? (
        <EventsStatus />
      ) : (
        <>
          <PlanList
            heading="Going"
            events={going}
            empty="Nothing yet. When you register for an event, tell Firefly you’re going and it shows up here."
          />
          <PlanList heading="Saved" events={saved} empty="Events you save show up here." />
        </>
      )}
    </div>
  )
}

interface PlanListProps {
  heading: string
  events: CityEvent[]
  empty: string
}

function PlanList({ heading, events, empty }: PlanListProps) {
  const { city } = useAppState()
  return (
    <section className="stack stack--tight" aria-label={heading}>
      <h2 className="subtitle">{heading}</h2>
      {events.length === 0 ? (
        <p className="a-muted">{empty}</p>
      ) : (
        <ul className="a-rows">
          {events.map((event) => (
            <li key={event.id} className="a-row">
              <div className="label2">
                <span className="ctx">
                  {formatEventWhen(new Date(event.startsAt), event.timeZone, city.locale)} ·{' '}
                  {event.neighbourhood}
                </span>
                <Link className="a-row__title" to={`/app/events/${encodeURIComponent(event.id)}`}>
                  {event.title}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
