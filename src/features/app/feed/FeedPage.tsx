import { useMemo, useState } from 'react'
import { buildFeed } from '../../../lib/feed/personalFeed.ts'
import { useAppState, useProfile } from '../appState.ts'
import { useClock } from '../clock.ts'
import { ExampleNote } from '../ui/ExampleNote.tsx'
import { EventsStatus } from './EventsStatus.tsx'
import { FeedRow } from './FeedRow.tsx'
import { HiddenRow } from './HiddenRow.tsx'
import { QuietCards } from './QuietCards.tsx'
import { RankedBy } from './RankedBy.tsx'

/** The personal feed (v4 §1): this week's events, ranked for this person, each saying why. */
export function FeedPage() {
  const { events, plans, city } = useAppState()
  const profile = useProfile()
  const clock = useClock()
  const [showAll, setShowAll] = useState(false)
  // Events hidden with "Not for me" during this visit stay in place, so the person can say why
  // or undo. They're gone from the feed next time.
  const [justHidden, setJustHidden] = useState<string[]>([])

  const list = events.status === 'ready' ? events.events : null
  const feed = useMemo(() => {
    if (!list) return null
    const feedback = Object.fromEntries(
      Object.entries(plans.feedback).filter(([id]) => !justHidden.includes(id)),
    )
    return buildFeed({
      events: list,
      profile,
      plans: { ...plans, feedback },
      city,
      now: clock(),
      showAll,
    })
  }, [list, profile, plans, justHidden, city, clock, showAll])

  return (
    <div className="split split--feed">
      <div className="split__aside stack">
        <header className="label2">
          <span className="ctx">This week in {city.name}</span>
          <h1 className="title">Hi, {profile.firstName}</h1>
        </header>
        {list?.some((e) => e.isExample) && (
          <ExampleNote>
            These are made-up example events. Firefly’s city-wide event search isn’t live yet.
          </ExampleNote>
        )}
        <RankedBy />
        {list && <QuietCards events={list} />}
      </div>
      <div className="split__main">
        {!list || !feed ? (
          <EventsStatus />
        ) : feed.items.length === 0 && showAll ? (
          <div className="stack stack--tight empty">
            <h2 className="subtitle">No events are listed for this week yet.</h2>
            <p className="a-muted">Check back in a day or two.</p>
          </div>
        ) : feed.items.length === 0 ? (
          <div className="stack stack--tight empty">
            <h2 className="subtitle">Nothing fits this week.</h2>
            <p className="a-muted">
              Rather than fill this with events that don’t suit you, here’s the honest answer. You
              can look at everything on this week, or add a few interests.
            </p>
            <button
              type="button"
              className="btn btn--fit"
              onClick={() => {
                setShowAll(true)
              }}
            >
              Show everything this week
            </button>
          </div>
        ) : (
          <div className="stack stack--tight">
            {feed.nothingFits && showAll && (
              <p className="a-muted">
                Nothing matched your answers, so here’s everything this week.
              </p>
            )}
            <ol className="a-rows" aria-label="Events for you this week">
              {feed.items.map((item, index) =>
                justHidden.includes(item.event.id) ? (
                  <HiddenRow
                    key={item.event.id}
                    event={item.event}
                    onUndo={() => {
                      setJustHidden((ids) => ids.filter((id) => id !== item.event.id))
                    }}
                  />
                ) : (
                  <FeedRow
                    key={item.event.id}
                    item={item}
                    top={index === 0}
                    onHide={() => {
                      setJustHidden((ids) => [...ids, item.event.id])
                    }}
                  />
                ),
              )}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
