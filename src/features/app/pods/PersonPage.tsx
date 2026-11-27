import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ArrowIcon } from '../../../components/ArrowIcon.tsx'
import { sharedWithMe } from '../../../data/pods.ts'
import { checkHandle, SOCIAL_NETWORKS, type SocialNetwork } from '../../../lib/pods/answers.ts'
import { useAppState } from '../appState.ts'
import { ExampleNote } from '../ui/ExampleNote.tsx'

/**
 * Someone you both chose to keep meeting (connection-flow.md §G). Each person chooses which
 * socials to share, one network at a time; nothing is pre-selected, and the page is honest that
 * a shared handle can't be taken back.
 */
export function PersonPage() {
  const { personId } = useParams()
  const { connections, dispatchConnections } = useAppState()
  const navigate = useNavigate()
  const connection = connections.connections.find((c) => c.personId === personId)
  const [drafts, setDrafts] = useState<Partial<Record<SocialNetwork, string>>>({})
  const [errors, setErrors] = useState<Partial<Record<SocialNetwork, string>>>({})
  const [confirmBlock, setConfirmBlock] = useState(false)

  if (!connection) return <Navigate to="/app/plans" replace />
  const theirs = sharedWithMe(connection.personId)
  const theirNetworks = SOCIAL_NETWORKS.filter((n) => theirs[n.id] !== undefined)

  const share = (network: SocialNetwork) => {
    const checked = checkHandle(network, drafts[network] ?? connections.socials[network] ?? '')
    if (!checked.ok) {
      setErrors({ ...errors, [network]: checked.error })
      return
    }
    dispatchConnections({
      type: 'share',
      personId: connection.personId,
      network,
      handle: checked.value,
    })
  }

  return (
    <div className="split split--event">
      <div className="split__main stack">
        <Link className="text-link back" to="/app/plans">
          <ArrowIcon direction="left" />
          Your plans
        </Link>
        <div className="label2">
          <span className="ctx">You both want to keep meeting</span>
          <h1 className="title">{connection.firstName}</h1>
        </div>
        <p className="a-muted">You met at {connection.eventTitle}.</p>
        {connection.personId.startsWith('example-') && (
          <ExampleNote>{connection.firstName} is a made-up example person.</ExampleNote>
        )}

        <section className="stack stack--tight" aria-labelledby="share-heading">
          <h2 className="subtitle" id="share-heading">
            Share a way to stay in touch
          </h2>
          <p className="small a-muted">
            You choose each one. Once {connection.firstName} sees a handle, Firefly can’t take it
            back. You can still block {connection.firstName} at any time.
          </p>
          <ul className="a-rows">
            {SOCIAL_NETWORKS.map((network) => {
              const shared = connection.shared.includes(network.id)
              const inputId = `share-${network.id}`
              return (
                <li key={network.id} className="a-row">
                  {shared ? (
                    <p className="label2">
                      <span className="ctx">{network.label}</span>
                      <span>Shared: {connections.socials[network.id]}</span>
                    </p>
                  ) : (
                    <div className="stack stack--tight">
                      <label className="ctx" htmlFor={inputId}>
                        {network.label}
                      </label>
                      <input
                        id={inputId}
                        className="a-field a-field--small"
                        type="text"
                        autoComplete="off"
                        value={drafts[network.id] ?? connections.socials[network.id] ?? ''}
                        aria-invalid={errors[network.id] !== undefined}
                        aria-describedby={`${inputId}-message`}
                        onChange={(e) => {
                          setDrafts({ ...drafts, [network.id]: e.target.value })
                          setErrors({ ...errors, [network.id]: undefined })
                        }}
                      />
                      <p
                        className={errors[network.id] ? 'small field-error' : 'small small--muted'}
                        id={`${inputId}-message`}
                      >
                        {errors[network.id] ?? 'Not shared.'}
                      </p>
                      <button
                        type="button"
                        className="btn btn--fit"
                        onClick={() => {
                          share(network.id)
                        }}
                      >
                        Share my {network.label} with {connection.firstName}
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <aside
        className="split__aside stack stack--tight"
        aria-label={`${connection.firstName} shared`}
      >
        <h2 className="subtitle">{connection.firstName} shared</h2>
        {theirNetworks.length === 0 ? (
          <p className="a-muted">Nothing yet.</p>
        ) : (
          theirNetworks.map((network) => (
            <p key={network.id} className="label2">
              <span className="ctx">{network.label}</span>
              <span>{theirs[network.id]}</span>
            </p>
          ))
        )}
        <div className="flag">
          {confirmBlock ? (
            <div className="stack stack--tight" role="group" aria-label="Confirm block">
              <p className="small a-muted">
                You won’t see each other here, in pods, or at any future event.
              </p>
              <button
                type="button"
                className="btn btn--danger btn--fit"
                onClick={() => {
                  dispatchConnections({ type: 'block', personId: connection.personId })
                  void navigate('/app/plans', { replace: true })
                }}
              >
                Block {connection.firstName}
              </button>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setConfirmBlock(false)
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setConfirmBlock(true)
              }}
            >
              Block {connection.firstName}
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
