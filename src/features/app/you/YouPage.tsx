import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { interestLabel } from '../../../lib/interests.ts'
import { ACCESS_NEEDS, FREE_TIMES, INTENTS } from '../../../lib/profile.ts'
import { useAppState, useProfile } from '../appState.ts'

const labelsFor = <T extends string>(
  list: readonly { id: T; label: string }[],
  ids: readonly T[],
) => list.filter((item) => ids.includes(item.id)).map((item) => item.label)

const orNone = (items: string[]) => (items.length > 0 ? items.join(', ') : 'Not set')

/** The person's answers, how they're stored, and deleting everything (app store requirement). */
export function YouPage() {
  const { city, deleteEverything } = useAppState()
  const profile = useProfile()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="stack">
      <header className="label2">
        <span className="ctx">{city.name}</span>
        <h1 className="title">{profile.firstName}</h1>
      </header>

      <dl className="facts">
        <div>
          <dt>Here for</dt>
          <dd>{orNone(labelsFor(INTENTS, profile.intents))}</dd>
        </div>
        <div>
          <dt>Interests</dt>
          <dd>{profile.interests.map(interestLabel).join(', ')}</dd>
        </div>
        <div>
          <dt>Free</dt>
          <dd>{orNone(labelsFor(FREE_TIMES, profile.freeTimes))}</dd>
        </div>
        <div>
          <dt>Neighbourhoods</dt>
          <dd>{orNone(profile.neighbourhoods)}</dd>
        </div>
        <div>
          <dt>Accessibility</dt>
          <dd>{orNone(labelsFor(ACCESS_NEEDS, profile.accessNeeds))}</dd>
        </div>
      </dl>
      <Link className="btn" to="/app/start/brings">
        Change your answers
      </Link>

      <section className="stack stack--tight" aria-labelledby="privacy-heading">
        <h2 className="subtitle" id="privacy-heading">
          Your privacy
        </h2>
        <p className="a-muted">
          Your answers, saved events and plans are stored on this device only. Nothing is sent to
          Firefly or anyone else yet. Firefly never uses your location.
        </p>
        <p className="a-muted">
          You agreed to the respect pledge: you’re here to meet people with good intent. No selling,
          no spam, no unwanted advances.
        </p>
      </section>

      <section className="stack stack--tight" aria-labelledby="delete-heading">
        <h2 className="subtitle" id="delete-heading">
          Delete your data
        </h2>
        {confirming ? (
          <div className="stack stack--tight" role="group" aria-label="Confirm deleting your data">
            <p className="a-muted">
              This removes your answers, saved events and plans from this device. It can’t be
              undone.
            </p>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                deleteEverything()
                void navigate('/app/start/welcome', { replace: true })
              }}
            >
              Delete everything
            </button>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setConfirming(false)
              }}
            >
              Keep my data
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => {
              setConfirming(true)
            }}
          >
            Delete my data
          </button>
        )}
      </section>
    </div>
  )
}
