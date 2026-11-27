import { Link } from 'react-router'
import { interestLabel } from '../../../lib/interests.ts'
import { useProfile } from '../appState.ts'

/**
 * What the feed is ranked by, so "why is this here?" has an answer before anyone asks, and one
 * link to change it. Wide screens only: on a phone the row's own reason line does this job.
 */
export function RankedBy() {
  const profile = useProfile()
  return (
    <section className="ranked wide-only" aria-label="What your feed is ranked by">
      <p className="label2">
        <span className="ctx">Ranked by what you told us</span>
        <span className="small">{profile.interests.map(interestLabel).join(' · ')}</span>
      </p>
      <Link className="text-link" to="/app/start/brings">
        Change your answers
      </Link>
    </section>
  )
}
