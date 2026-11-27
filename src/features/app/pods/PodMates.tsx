import { useState } from 'react'
import type { PodMateCard } from '../../../data/pods.ts'
import { interestLabel, type InterestId } from '../../../lib/interests.ts'
import { eventIntentLabel } from '../../../lib/pods/intents.ts'
import { useAppState } from '../appState.ts'

const REPORT_REASONS = ['Unwanted advance', 'Selling or spam', 'Something else'] as const

/**
 * Pod-mate cards before meeting (connection-flow.md §D): intent, interests (shared ones marked)
 * and the prompt answer. No name, photo, gender or anything else. Block and report are one tap
 * on every card (CLAUDE.md §8.5).
 */
export function PodMates({
  mates,
  myInterests,
}: {
  mates: readonly PodMateCard[]
  myInterests: readonly InterestId[]
}) {
  const { dispatchConnections } = useAppState()
  const [reporting, setReporting] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  return (
    <>
      {notice && (
        <p className="small" role="status">
          {notice}
        </p>
      )}
      <ol className="a-rows" aria-label="Your pod-mates">
        {mates.map((mate, index) => (
          <li key={mate.id} className="a-row">
            <div className="label2">
              <span className="ctx">{mate.intents.map(eventIntentLabel).join(' · ')}</span>
              <span className="a-row__title">Pod-mate {index + 1}</span>
            </div>
            <ul className="interests" aria-label="Interests">
              {mate.interests.map((interest) => (
                <li
                  key={interest}
                  className={myInterests.includes(interest) ? 'is-shared' : undefined}
                >
                  {interestLabel(interest)}
                  {myInterests.includes(interest) && (
                    <span className="visually-hidden"> (you too)</span>
                  )}
                </li>
              ))}
            </ul>
            <p>
              <span className="a-muted">{mate.prompt}:</span> {mate.answer}
            </p>
            {reporting === mate.id ? (
              <div
                className="row-actions"
                role="group"
                aria-label={`Report pod-mate ${String(index + 1)}`}
              >
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    className="a-chip a-chip--small"
                    onClick={() => {
                      dispatchConnections({ type: 'report', personId: mate.id })
                      dispatchConnections({ type: 'block', personId: mate.id })
                      setReporting(null)
                      setNotice(
                        'Reported. The Firefly team will look at it, and you won’t see each other again.',
                      )
                    }}
                  >
                    {reason}
                  </button>
                ))}
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setReporting(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="row-actions">
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    dispatchConnections({ type: 'block', personId: mate.id })
                    setNotice('Blocked. You won’t see each other here or at any future event.')
                  }}
                >
                  Block
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setReporting(mate.id)
                  }}
                >
                  Report
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
    </>
  )
}
