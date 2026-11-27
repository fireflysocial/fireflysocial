import { useAppState } from '../appState.ts'

/** Loading and error states for the events list. Phones lose signal at events (CLAUDE.md §9). */
export function EventsStatus() {
  const { events, reloadEvents } = useAppState()
  if (events.status === 'error') {
    return (
      <div className="stack" role="alert">
        <h1 className="title">Couldn’t load events.</h1>
        <p className="a-muted">Check your connection and try again.</p>
        <button type="button" className="btn" onClick={reloadEvents}>
          Try again
        </button>
      </div>
    )
  }
  return (
    <p className="a-muted" role="status" aria-live="polite">
      Finding this week’s events…
    </p>
  )
}
