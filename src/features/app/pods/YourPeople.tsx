import { Link } from 'react-router'
import { useAppState } from '../appState.ts'

/** People you both chose to keep meeting. Owner-only, like the rest of Plans. */
export function YourPeople() {
  const { connections } = useAppState()
  return (
    <section className="stack stack--tight" aria-label="Your people">
      <h2 className="subtitle">Your people</h2>
      {connections.connections.length === 0 ? (
        <p className="a-muted empty-note">
          When you and someone from your pod both choose to keep meeting, they show up here.
        </p>
      ) : (
        <ul className="a-rows">
          {connections.connections.map((c) => (
            <li key={c.personId} className="a-row">
              <span className="ctx">Met at {c.eventTitle}</span>
              <Link className="a-row__title" to={`/app/people/${encodeURIComponent(c.personId)}`}>
                {c.firstName}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
