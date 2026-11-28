import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { interestLabel } from '../../../lib/interests.ts'
import {
  ACCESS_NEEDS,
  APPROACHES,
  EVENT_STYLES,
  FREE_TIMES,
  GROUP_SIZES,
  INTENTS,
  LANGUAGES,
  PACES,
  WORK_AREAS,
} from '../../../lib/profile.ts'
import { useAppState, useProfile } from '../appState.ts'

const labelsFor = <T extends string>(
  list: readonly { id: T; label: string }[],
  ids: readonly T[],
) => list.filter((item) => ids.includes(item.id)).map((item) => item.label)

const labelFor = <T extends string>(list: readonly { id: T; label: string }[], id: T | null) =>
  list.find((item) => item.id === id)?.label ?? 'Not set'

const orNone = (items: string[]) => (items.length > 0 ? items.join(', ') : 'Not set')

/** The person's answers, how they're stored, logging out and deleting the account. */
export function YouPage() {
  const { city, account, signOut, deleteEverything } = useAppState()
  const profile = useProfile()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [deleteFailed, setDeleteFailed] = useState(false)

  const onDelete = async () => {
    setBusy(true)
    setDeleteFailed(false)
    if (await deleteEverything()) {
      void navigate('/app/welcome', { replace: true })
      return
    }
    setBusy(false)
    setDeleteFailed(true)
  }

  return (
    <div className="stack">
      <header className="label2">
        <span className="ctx">{city.name}</span>
        <h1 className="title">{profile.firstName}</h1>
      </header>

      <div className="pair">
        <div className="stack">
          <dl className="facts">
            <div>
              <dt>Here for</dt>
              <dd>{orNone(labelsFor(INTENTS, profile.intents))}</dd>
            </div>
            <div>
              <dt>Days</dt>
              <dd>{labelFor(WORK_AREAS, profile.workArea)}</dd>
            </div>
            <div>
              <dt>Interests</dt>
              <dd>{profile.interests.map(interestLabel).join(', ')}</dd>
            </div>
            <div>
              <dt>Best events</dt>
              <dd>{labelFor(EVENT_STYLES, profile.eventStyle)}</dd>
            </div>
            <div>
              <dt>Group size</dt>
              <dd>{labelFor(GROUP_SIZES, profile.groupSize)}</dd>
            </div>
            <div>
              <dt>Walking in</dt>
              <dd>{labelFor(APPROACHES, profile.approach)}</dd>
            </div>
            <div>
              <dt>Languages</dt>
              <dd>{orNone(labelsFor(LANGUAGES, profile.languages))}</dd>
            </div>
            <div>
              <dt>Free</dt>
              <dd>{orNone(labelsFor(FREE_TIMES, profile.freeTimes))}</dd>
            </div>
            <div>
              <dt>How often</dt>
              <dd>{labelFor(PACES, profile.pace)}</dd>
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
          <Link className="btn btn--fit" to="/app/start/name">
            Change your answers
          </Link>
        </div>
        <div className="stack">
          <section className="stack stack--tight" aria-labelledby="privacy-heading">
            <h2 className="subtitle" id="privacy-heading">
              Your privacy
            </h2>
            <p className="a-muted">
              Your answers are saved to your Firefly account, and only you can see them. Saved
              events and plans stay on this device. Firefly never uses your location.
            </p>
            <p className="a-muted">
              You agreed to the respect pledge: you’re here to meet people with good intent. No
              selling, no spam, no unwanted advances.
            </p>
          </section>

          <section className="stack stack--tight" aria-labelledby="account-heading">
            <h2 className="subtitle" id="account-heading">
              Your account
            </h2>
            {account?.email && <p className="a-muted">Signed in as {account.email}</p>}
            <button
              type="button"
              className="btn btn--quiet btn--fit"
              onClick={() => {
                void signOut()
              }}
            >
              Log out
            </button>
            <p className="small small--muted">
              Logging out clears your saved events and plans from this device.
            </p>
          </section>

          <section className="stack stack--tight" aria-labelledby="delete-heading">
            <h2 className="subtitle" id="delete-heading">
              Delete your account
            </h2>
            {confirming ? (
              <div
                className="stack stack--tight"
                role="group"
                aria-label="Confirm deleting your account"
              >
                <p className="a-muted">
                  This deletes your account and your answers from Firefly, and your saved events and
                  plans from this device. It can’t be undone.
                </p>
                {deleteFailed && (
                  <p className="field-error" role="alert">
                    We couldn’t delete your account. Check your connection and try again.
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn--danger btn--fit"
                  disabled={busy}
                  onClick={() => {
                    void onDelete()
                  }}
                >
                  {busy ? 'Deleting…' : 'Delete everything'}
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setConfirming(false)
                    setDeleteFailed(false)
                  }}
                >
                  Keep my account
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
                Delete my account
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
