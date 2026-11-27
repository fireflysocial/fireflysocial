import { useState, type JSX } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { ArrowIcon } from '../../../components/ArrowIcon.tsx'
import { FireflyMark } from '../../../components/FireflyMark.tsx'
import {
  draftFromProfile,
  emptyDraft,
  firstIncompleteStep,
  isStepId,
  STEPS,
  stepComplete,
  toProfile,
  type Draft,
  type StepId,
} from '../../../lib/onboarding.ts'
import { useAppState } from '../appState.ts'
import { useClock } from '../clock.ts'
import { StepExtras } from './StepExtras.tsx'
import { StepFree } from './StepFree.tsx'
import { StepIntents } from './StepIntents.tsx'
import { StepInterests } from './StepInterests.tsx'
import { StepName } from './StepName.tsx'
import { StepPledge } from './StepPledge.tsx'
import { StepWelcome } from './StepWelcome.tsx'

export interface StepProps {
  draft: Draft
  update: (change: Partial<Draft>) => void
}

const STEP_VIEWS: Record<StepId, (props: StepProps) => JSX.Element> = {
  welcome: StepWelcome,
  pledge: StepPledge,
  name: StepName,
  brings: StepIntents,
  interests: StepInterests,
  free: StepFree,
  extras: StepExtras,
}

/**
 * Onboarding (v4 §0), paced like Duolingo's: one question per screen, a progress bar, and the
 * personal feed at the end. Each step has its own URL, so the phone's back gesture works.
 */
export function Onboarding() {
  const { step } = useParams()
  const navigate = useNavigate()
  const clock = useClock()
  const { profile, city, completeOnboarding } = useAppState()
  const [draft, setDraft] = useState<Draft>(() =>
    profile ? draftFromProfile(profile) : emptyDraft(),
  )

  if (!isStepId(step)) return <Navigate to="/app/start/welcome" replace />
  const index = STEPS.indexOf(step)
  const missing = firstIncompleteStep(draft)
  // Reloading part-way loses the draft, so send the person back to the first unanswered step.
  if (missing !== null && STEPS.indexOf(missing) < index) {
    return <Navigate to={`/app/start/${missing}`} replace />
  }

  const update = (change: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...change }))
  }
  const next = STEPS[index + 1]
  const canContinue = stepComplete(step, draft)
  const View = STEP_VIEWS[step]

  const onContinue = () => {
    if (next) {
      void navigate(`/app/start/${next}`)
      return
    }
    // Every earlier step is complete here (see the redirect above), so the draft is finished.
    completeOnboarding(toProfile(draft, city.id, profile?.pledgedAt ?? clock().toISOString()))
    void navigate('/app/feed', { replace: true })
  }

  return (
    <main className={index === 0 ? 'onboarding onboarding--first' : 'onboarding'} id="main">
      <div className="onboarding__top">
        <p className="lockup wide-only">
          <FireflyMark className="lockup__mark" cropped />
          <span>Firefly</span>
        </p>
        {index > 0 && (
          <div className="onboarding__progress">
            <button
              type="button"
              className="text-link back"
              onClick={() => {
                void navigate(-1)
              }}
            >
              <ArrowIcon direction="left" />
              Back
            </button>
            <div
              className="progress"
              role="progressbar"
              aria-label="Setup progress"
              aria-valuemin={1}
              aria-valuemax={STEPS.length - 1}
              aria-valuenow={index}
            >
              <span style={{ width: `${String((index / (STEPS.length - 1)) * 100)}%` }} />
            </div>
            <span className="ctx wide-only" aria-hidden="true">
              Step {index} of {STEPS.length - 1}
            </span>
          </div>
        )}
      </div>
      <View draft={draft} update={update} />
      <div className="onboarding__foot">
        <button
          type="button"
          className="btn btn--glow"
          disabled={!canContinue}
          onClick={onContinue}
        >
          <span>{step === 'welcome' ? 'Get started' : next ? 'Continue' : 'Show my feed'}</span>
          <ArrowIcon direction="right" />
        </button>
      </div>
    </main>
  )
}
