import { useState } from 'react'
import { flushSync } from 'react-dom'
import { INTERESTS, rankEvents, type InterestId } from '../../lib/feed/rank.ts'
import { EXAMPLE_EVENTS } from './exampleEvents.ts'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.ts'

/** How many events the phone shows: a short list that fits, not an endless feed. */
const SHOWN = 4
const STARTING_PICKS: readonly InterestId[] = ['board-games', 'outdoors']

/**
 * "Try it": tap interests and watch an example feed re-rank, each event saying why it's there.
 * The same ranking logic (src/lib/feed/rank.ts) will order the real feed.
 */
export function FeedDemo() {
  const [picked, setPicked] = useState<ReadonlySet<InterestId>>(() => new Set(STARTING_PICKS))
  const reducedMotion = usePrefersReducedMotion()
  const ranked = rankEvents(EXAMPLE_EVENTS, picked).slice(0, SHOWN)
  const top = ranked[0]

  const toggle = (id: InterestId) => {
    const update = () => {
      flushSync(() => {
        // Build from the latest state, so rapid taps never work from a stale selection.
        setPicked((previous) => {
          const next = new Set(previous)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      })
    }
    // Cards glide to their new places where the browser supports view transitions.
    if (!reducedMotion && 'startViewTransition' in document) document.startViewTransition(update)
    else update()
  }

  return (
    <section className="section demo" id="try" aria-labelledby="try-title">
      <div className="demo__text">
        <h2 id="try-title" className="headline">
          Tell it what you like. Watch it pick.
        </h2>
        <p className="demo__lede">
          Tap a few. This is how your feed works: events from across Vancouver, ranked for you, each
          with a reason.
        </p>
        <div className="chips" role="group" aria-labelledby="chips-label">
          <p id="chips-label" className="chips__label">
            I’m into
          </p>
          {INTERESTS.map((interest) => (
            <button
              key={interest.id}
              type="button"
              className="chip"
              aria-pressed={picked.has(interest.id)}
              onClick={() => {
                toggle(interest.id)
              }}
            >
              {interest.label}
            </button>
          ))}
        </div>
      </div>

      <figure className="phone">
        <div className="phone__screen">
          {/* Device cues so the frame reads as a phone: status bar and camera island. */}
          <div className="phone__status" aria-hidden="true">
            <span>9:41</span>
            <span className="phone__island" />
            <span className="phone__battery" />
          </div>
          <p className="label phone__heading">
            <span className="muted">This week</span>
            <span>For you</span>
          </p>
          <p className="visually-hidden" role="status">
            {top && picked.size > 0 ? `Top pick: ${top.event.title}` : ''}
          </p>
          <ol className="feed" aria-label="Example feed">
            {ranked.map(({ event, reason }, index) => (
              <li
                key={event.id}
                className="feed__item"
                style={{ viewTransitionName: `event-${event.id}` }}
              >
                <p className="label">
                  <span className="muted">
                    {event.when} · {event.price}
                  </span>
                  <span className="feed__title">{event.title}</span>
                </p>
                <p className="feed__place">{event.place}</p>
                {reason && (
                  <p className="feed__why">
                    {/* The one Glow on this screen: the best fit. */}
                    {index === 0 && <span className="feed__dot" aria-hidden="true" />}
                    {reason}
                  </p>
                )}
              </li>
            ))}
          </ol>
          {picked.size === 0 && (
            <p className="feed__empty">Pick something you’re into and the list reorders.</p>
          )}
          <span className="phone__home" aria-hidden="true" />
        </div>
        <figcaption className="phone__caption">
          Example events. Real listings come from across Vancouver.
        </figcaption>
      </figure>
    </section>
  )
}
