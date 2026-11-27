import type { GoingAnswer } from '../../../lib/plans.ts'
import { useAppState } from '../appState.ts'

interface GoingAnswersProps {
  eventId: string
  /** Inside the return prompt, "Yes" is the screen's one Glow action. */
  primary?: boolean
}

/** "Yes, I'm going / Not yet, remind me / Not going" (v4 §2). Only Yes counts as going. */
export function GoingAnswers({ eventId, primary = false }: GoingAnswersProps) {
  const { dispatch } = useAppState()
  const answer = (value: GoingAnswer) => {
    dispatch({ type: 'answer-going', eventId, answer: value })
  }
  return (
    <div className="answers">
      <button
        type="button"
        className={primary ? 'btn btn--glow' : 'btn'}
        onClick={() => {
          answer('going')
        }}
      >
        Yes, I’m going
      </button>
      <button
        type="button"
        className="btn btn--quiet"
        onClick={() => {
          answer('remind')
        }}
      >
        Not yet, remind me
      </button>
      <button
        type="button"
        className="btn btn--quiet"
        onClick={() => {
          answer('not-going')
        }}
      >
        Not going
      </button>
    </div>
  )
}
