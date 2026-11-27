import { Link } from 'react-router'
import type { FeedItem } from '../../../lib/feed/personalFeed.ts'
import { isGoing } from '../../../lib/plans.ts'
import { useAppState } from '../appState.ts'
import { EventWhen } from '../ui/EventWhen.tsx'

interface FeedRowProps {
  item: FeedItem
  /** The best fit carries the screen's one Glow dot (DESIGN.md, the One Light Rule). */
  top: boolean
  onHide: () => void
}

/** One event: when | what and why | actions. Stacks on phones; three columns on wide screens. */
export function FeedRow({ item, top, onHide }: FeedRowProps) {
  const { plans, dispatch, city } = useAppState()
  const { event, reason, access } = item
  const saved = plans.saved.includes(event.id)
  const more = plans.feedback[event.id]?.kind === 'more'
  return (
    <li className="a-row a-row--event">
      <EventWhen event={event} locale={city.locale} />
      <div className="a-row__body">
        <Link className="a-row__title" to={`/app/events/${encodeURIComponent(event.id)}`}>
          {event.title}
        </Link>
        <p className="reason">
          {top && <span className="dot" aria-hidden="true" />}
          {reason}
        </p>
        {access && (
          <p className={access.kind === 'confirmed' ? 'small' : 'small small--muted'}>
            {access.text}
          </p>
        )}
        {isGoing(plans, event.id) && <p className="small">You’re going</p>}
      </div>
      <div className="row-actions">
        <button
          type="button"
          className="a-chip a-chip--small"
          aria-pressed={saved}
          onClick={() => {
            dispatch({ type: 'toggle-save', eventId: event.id })
          }}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
        <button
          type="button"
          className="a-chip a-chip--small"
          aria-pressed={more}
          onClick={() => {
            dispatch(
              more
                ? { type: 'undo-feedback', eventId: event.id }
                : { type: 'more-like-this', eventId: event.id },
            )
          }}
        >
          More like this
        </button>
        <button
          type="button"
          className="a-chip a-chip--small"
          aria-pressed={false}
          onClick={() => {
            dispatch({ type: 'not-for-me', eventId: event.id, reason: null })
            onHide()
          }}
        >
          Not for me
        </button>
      </div>
    </li>
  )
}
