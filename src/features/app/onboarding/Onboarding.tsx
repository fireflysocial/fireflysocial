import { useEffect, useState, type JSX } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { ArrowIcon } from '../../../components/ArrowIcon.tsx'
import { FireflyMark } from '../../../components/FireflyMark.tsx'
import { loadDraft, saveDraft } from '../../../data/onboardingDraft.ts'
import {
  draftFromProfile,
  emptyDraft,
  firstIncompleteStep,
  isStepId,
  resolveStep,
  stepAnswered,
  stepComplete,
  stepPosition,
  toProfile,
  type Draft,
  type StepId,
} from '../../../lib/onboarding.ts'
import { useAppState } from '../appState.ts'
import { useClock } from '../clock.ts'
import { GateScreen } from '../GateScreen.tsx'
import { StepAccess } from './StepAccess.tsx'
import { StepApproach } from './StepApproach.tsx'
import { StepBudget } from './StepBudget.tsx'
import { StepFree } from './StepFree.tsx'
import { StepGroups } from './StepGroups.tsx'
import { StepIntents } from './StepIntents.tsx'
import { StepInterests } from './StepInterests.tsx'
import { StepLanguages } from './StepLanguages.tsx'
import { StepName } from './StepName.tsx'
import { StepNewcomer } from './StepNewcomer.tsx'
import { StepPace } from './StepPace.tsx'
import { StepPlaces } from './StepPlaces.tsx'
import { StepPledge } from './StepPledge.tsx'
import { StepProject } from './StepProject.tsx'
import { StepStyle } from './StepStyle.tsx'
import { StepWork } from './StepWork.tsx'

export interface StepProps {
  draft: Draft
  update: (change: Partial<Draft>) => void
}

const STEP_VIEWS: Record<StepId, (props: StepProps) => JSX.Element> = {
  pledge: StepPledge,
  name: StepName,
  brings: StepIntents,
  work: StepWork,
  project: StepProject,
  interests: StepInterests,
  style: StepStyle,
  groups: StepGroups,
  approach: StepApproach,
  languages: StepLanguages,
  free: StepFree,
  pace: StepPace,
  places: StepPlaces,
  budget: StepBudget,
  newcomer: StepNewcomer,
  access: StepAccess,
}

/** Onboarding for a signed-in person. Sends everyone else where they belong. */
export function Onboarding() {
  const { gate } = useAppState()
  if (gate === 'onboarding' || gate === 'ready') return <OnboardingSteps />
  return <GateScreen gate={gate} />
}

/**
 * One question per screen, grouped into short sections, with a progress bar and the personal feed
 * at the end. Each step has its own URL, so the phone's back gesture works. Answers in progress
 * stay on this device until the last screen saves them to the account; someone changing their
 * answers starts from their saved profile instead.
 */
function OnboardingSteps() {
  const { step: param } = useParams()
  const navigate = useNavigate()
  const clock = useClock()
  const { profile, city, completeOnboarding } = useAppState()
  const editing = profile !== null
  const [draft, setDraft] = useState<Draft>(() =>
    profile ? draftFromProfile(profile) : (loadDraft()?.draft ?? emptyDraft()),
  )
  const [saving, setSaving] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)

  const step = isStepId(param) ? resolveStep(param, draft) : null

  useEffect(() => {
    if (!editing && step) saveDraft(draft, step.id)
  }, [editing, draft, step])

  if (!step) return <Navigate to="/app/start/pledge" replace />
  // A step that doesn't apply to this person (the project questions) moves on to the next one.
  if (step.id !== param) return <Navigate to={`/app/start/${step.id}`} replace />
  const missing = firstIncompleteStep(draft)
  const position = stepPosition(step, draft)
  // Opening a later step directly: go back to the first required answer still missing.
  if (
    missing !== null &&
    stepPosition(resolveStep(missing, draft), draft).number < position.number
  ) {
    return <Navigate to={`/app/start/${missing}`} replace />
  }

  const update = (change: Partial<Draft>) => {
    setSaveFailed(false)
    setDraft((d) => ({ ...d, ...change }))
  }
  const View = STEP_VIEWS[step.id]
  const { next } = position

  const onContinue = async () => {
    if (next) {
      void navigate(`/app/start/${next}`)
      return
    }
    // Every earlier step is complete here (see the redirect above), so the draft is finished.
    setSaving(true)
    const saved = await completeOnboarding(
      toProfile(draft, city.id, profile?.pledgedAt ?? clock().toISOString()),
    )
    if (saved) {
      void navigate('/app/feed', { replace: true })
      return
    }
    setSaving(false)
    setSaveFailed(true)
  }

  let label = 'Continue'
  if (!next) label = editing ? 'Save changes' : 'Show my feed'
  else if (!step.required && !stepAnswered(step.id, draft)) label = 'Skip'
  if (saving) label = 'Saving…'

  return (
    <main className="onboarding" id="main">
      <div className="onboarding__top">
        <p className="lockup wide-only">
          <FireflyMark className="lockup__mark" cropped />
          <span>Firefly</span>
        </p>
        <div className="onboarding__progress">
          {position.number > 1 ? (
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
          ) : editing ? (
            <Link className="text-link back" to="/app/you">
              <ArrowIcon direction="left" />
              Cancel
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          <div
            className="progress"
            role="progressbar"
            aria-label="Setup progress"
            aria-valuemin={1}
            aria-valuemax={position.total}
            aria-valuenow={position.number}
            aria-valuetext={`Step ${String(position.number)} of ${String(position.total)}: ${position.sectionLabel}`}
          >
            <span style={{ width: `${String((position.number / position.total) * 100)}%` }} />
          </div>
        </div>
        <p className="ctx onboarding__section" aria-hidden="true">
          {position.sectionLabel}
          <span className="wide-only">
            {' '}
            · Step {position.number} of {position.total}
          </span>
        </p>
      </div>
      <View draft={draft} update={update} />
      <div className="onboarding__foot stack stack--tight">
        {saveFailed && (
          <p className="field-error" role="alert">
            We couldn’t save your answers. Check your connection and try again.
          </p>
        )}
        <button
          type="button"
          className={label === 'Skip' ? 'btn' : 'btn btn--glow'}
          disabled={saving || !stepComplete(step.id, draft)}
          onClick={() => {
            void onContinue()
          }}
        >
          <span>{label}</span>
          <ArrowIcon direction="right" />
        </button>
      </div>
    </main>
  )
}
