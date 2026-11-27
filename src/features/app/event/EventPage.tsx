import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowIcon } from '../../../components/ArrowIcon.tsx'
import { ExternalLink } from '../../../components/ExternalLink.tsx'
import { hasEnded, hasStarted, siteName } from '../../../lib/events.ts'
import { isGoing } from '../../../lib/plans.ts'
import { formatPrice } from '../../../lib/price.ts'
import { ACCESS_NEEDS } from '../../../lib/profile.ts'
import { formatEventWhen } from '../../../lib/time.ts'
import { readyEvents, useAppState } from '../appState.ts'
import { useClock } from '../clock.ts'
import { EventsStatus } from '../feed/EventsStatus.tsx'
import { ExampleNote } from '../ui/ExampleNote.tsx'
import { useEventView } from '../useEventView.ts'
import { MeetingPeople } from '../pods/MeetingPeople.tsx'
import { GoingAnswers } from './GoingAnswers.tsx'

export function EventPage() {
  const { eventId } = useParams()
  const { events, plans, dispatch, city } = useAppState()
  const clock = useClock()
  const event = readyEvents(events).find((e) => e.id === eventId)
  const view = useEventView(event)
  const [flagOpen, setFlagOpen] = useState(false)

  if (events.status !== 'ready') return <EventsStatus />
  if (!event) {
    return (
      <div className="stack">
        <BackLink />
        <h1 className="title">This event isn’t listed any more.</h1>
        <p className="a-muted">It may have been cancelled, or it has already happened.</p>
      </div>
    )
  }

  const now = clock()
  const going = isGoing(plans, event.id)
  const answer = plans.going[event.id]
  const askRegistered =
    !going && (answer === 'remind' || (answer === undefined && plans.clicked.includes(event.id)))
  const saved = plans.saved.includes(event.id)
  const flagged = plans.flagged.includes(event.id)
  const confirmedAccess = ACCESS_NEEDS.filter((need) => event.access[need.id] === true)
  const price = formatPrice(event.price, event.currency, city.locale)

  return (
    <article className="split split--event">
      <div className="split__main stack">
        <BackLink />
        <div className="label2">
          <span className="ctx">
            {formatEventWhen(new Date(event.startsAt), event.timeZone, city.locale)} · {price}
          </span>
          <h1 className="title title--event">{event.title}</h1>
        </div>
        {event.isExample && (
          <ExampleNote>Made up. Firefly’s city-wide event search isn’t live yet.</ExampleNote>
        )}

        <dl className="facts">
          <div>
            <dt>Where</dt>
            <dd>
              {event.venue}, {event.neighbourhood}
            </dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>{price}</dd>
          </div>
          {view && (
            <div>
              <dt>Why it’s here</dt>
              <dd>{view.reason}</dd>
            </div>
          )}
          <div>
            <dt>Accessibility</dt>
            <dd>
              {confirmedAccess.length > 0
                ? confirmedAccess.map((need) => need.confirmed).join(' · ')
                : 'Not listed by the organiser'}
            </dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>
              <ExternalLink href={event.sourceUrl} className="text-link">
                {siteName(event.sourceUrl)}
              </ExternalLink>
            </dd>
          </div>
        </dl>
      </div>
      <div className="split__aside event-actions stack">
        {hasEnded(event, now) ? (
          <p className="a-muted">This event has ended.</p>
        ) : going ? (
          <div className="stack stack--tight">
            <p className="status">
              <span className="dot" aria-hidden="true" /> You’re going. Only you can see this.
            </p>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                dispatch({ type: 'answer-going', eventId: event.id, answer: 'not-going' })
              }}
            >
              I’m not going any more
            </button>
          </div>
        ) : hasStarted(event, now) ? (
          <p className="a-muted">This event has started.</p>
        ) : event.registrationUrl ? (
          <div className="stack stack--tight">
            {askRegistered ? (
              <>
                <h2 className="subtitle">Did you register?</h2>
                <GoingAnswers eventId={event.id} />
                <ExternalLink
                  href={event.registrationUrl}
                  className="text-link"
                  onOpen={() => {
                    dispatch({ type: 'open-registration', eventId: event.id })
                  }}
                >
                  Open {siteName(event.registrationUrl)} again
                </ExternalLink>
              </>
            ) : (
              <>
                <ExternalLink
                  href={event.registrationUrl}
                  className="btn btn--glow"
                  onOpen={() => {
                    dispatch({ type: 'open-registration', eventId: event.id })
                  }}
                >
                  <span>Register on {siteName(event.registrationUrl)}</span>
                  <ArrowIcon />
                </ExternalLink>
                <p className="small">
                  You register on the event’s own page. Come back after, and tell us if you’re
                  going.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="stack stack--tight">
            <button
              type="button"
              className="btn btn--glow"
              onClick={() => {
                dispatch({ type: 'answer-going', eventId: event.id, answer: 'going' })
              }}
            >
              <span>I’m going</span>
              <ArrowIcon direction="right" />
            </button>
            <p className="small">Free, and no registration needed.</p>
          </div>
        )}

        {going && <MeetingPeople event={event} />}

        <div className="row-actions">
          <button
            type="button"
            className="a-chip"
            aria-pressed={saved}
            onClick={() => {
              dispatch({ type: 'toggle-save', eventId: event.id })
            }}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        <section className="flag" aria-label="Report a problem with this listing">
          {flagged ? (
            <p className="small" role="status">
              Thanks. The Firefly team will check this listing.
            </p>
          ) : flagOpen ? (
            <div className="stack stack--tight">
              <p className="small">Wrong time or place, cancelled, or a dead link?</p>
              <button
                type="button"
                className="btn btn--quiet"
                onClick={() => {
                  dispatch({ type: 'flag', eventId: event.id })
                }}
              >
                Flag this listing
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setFlagOpen(true)
              }}
            >
              Something wrong with this listing?
            </button>
          )}
        </section>
      </div>
    </article>
  )
}

function BackLink() {
  return (
    <Link className="text-link back" to="/app/feed">
      <ArrowIcon direction="left" />
      Back to your feed
    </Link>
  )
}
