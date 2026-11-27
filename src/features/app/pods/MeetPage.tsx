import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { ArrowIcon } from '../../../components/ArrowIcon.tsx'
import { toggle } from '../../../lib/onboarding.ts'
import { isGoing } from '../../../lib/plans.ts'
import { checkPromptAnswer, MAX_ANSWER, PROMPTS, type Prompt } from '../../../lib/pods/answers.ts'
import { stageFor } from '../../../lib/pods/connections.ts'
import {
  defaultEventIntents,
  EVENT_INTENTS,
  MAX_EVENT_INTENTS,
  type EventIntent,
} from '../../../lib/pods/intents.ts'
import { useAppState, useProfile } from '../appState.ts'
import { useClock } from '../clock.ts'
import { EventsStatus } from '../feed/EventsStatus.tsx'
import { Chip } from '../ui/Chip.tsx'
import { useEvent } from './useEvent.ts'

/**
 * Opting in to meet people at one event (connection-flow.md §B): what you want out of it, how
 * you'd like to meet, and (the first time) one prompt answer. The consent says exactly what the
 * pod will see.
 */
export function MeetPage() {
  const { events, plans, connections, dispatchConnections } = useAppState()
  const profile = useProfile()
  const clock = useClock()
  const navigate = useNavigate()
  const event = useEvent()
  const [intents, setIntents] = useState<EventIntent[]>(() => defaultEventIntents(profile.intents))
  const [mode, setMode] = useState<'group' | 'one'>('group')
  const [prompt, setPrompt] = useState<Prompt>(connections.podAnswer?.prompt ?? PROMPTS[0])
  const [answer, setAnswer] = useState(connections.podAnswer?.answer ?? '')
  const [error, setError] = useState<string | null>(null)

  if (events.status !== 'ready') return <EventsStatus />
  if (!event || !isGoing(plans, event.id) || stageFor(event, connections, clock()) !== 'invite') {
    return (
      <Navigate to={event ? `/app/events/${encodeURIComponent(event.id)}` : '/app/feed'} replace />
    )
  }

  const firstTime = connections.podAnswer === null
  const pickIntent = (id: EventIntent) => {
    const next = toggle(intents, id)
    setIntents(next.length > MAX_EVENT_INTENTS ? next.slice(1) : next)
  }

  const submit = () => {
    const checked = checkPromptAnswer(answer)
    if (!checked.ok) {
      setError(checked.error)
      return
    }
    dispatchConnections({
      type: 'opt-in',
      eventId: event.id,
      optIn: { intents, mode },
      podAnswer: { prompt, answer: checked.value },
    })
    void navigate(`/app/events/${encodeURIComponent(event.id)}`, { replace: true })
  }

  return (
    <div className="split split--event">
      <div className="split__main stack">
        <div className="label2">
          <span className="ctx">{event.title}</span>
          <h1 className="title">What do you want out of this one?</h1>
        </div>
        <div className="a-chips" role="group" aria-label="What you want out of this event">
          <p className="a-chips__label">
            Pick up to {MAX_EVENT_INTENTS}. Prefilled from your answers.
          </p>
          {EVENT_INTENTS.map((intent) => (
            <Chip
              key={intent.id}
              pressed={intents.includes(intent.id)}
              onToggle={() => {
                pickIntent(intent.id)
              }}
            >
              {intent.label}
            </Chip>
          ))}
        </div>
        <div className="a-chips" role="group" aria-label="How you want to meet">
          <p className="a-chips__label">How do you want to meet?</p>
          <Chip
            pressed={mode === 'group'}
            onToggle={() => {
              setMode('group')
            }}
          >
            A small group
          </Chip>
          <Chip
            pressed={mode === 'one'}
            onToggle={() => {
              setMode('one')
            }}
          >
            One person first
          </Chip>
        </div>
        {firstTime && (
          <div className="stack stack--tight">
            <div className="a-chips" role="group" aria-label="Choose a prompt">
              <p className="a-chips__label">
                One prompt your pod will see. You only answer this once.
              </p>
              {PROMPTS.map((p) => (
                <Chip
                  key={p}
                  pressed={prompt === p}
                  onToggle={() => {
                    setPrompt(p)
                  }}
                >
                  {p}
                </Chip>
              ))}
            </div>
            <label className="label2" htmlFor="pod-answer">
              <span className="ctx">{prompt}…</span>
            </label>
            <input
              id="pod-answer"
              className="a-field"
              type="text"
              maxLength={MAX_ANSWER + 20}
              value={answer}
              aria-invalid={error !== null}
              aria-describedby="pod-answer-message"
              onChange={(e) => {
                setAnswer(e.target.value)
                setError(null)
              }}
            />
            <p
              className={error ? 'small field-error' : 'small small--muted'}
              id="pod-answer-message"
            >
              {error ?? 'No links, handles or numbers. Socials come later, only if you both want.'}
            </p>
          </div>
        )}
      </div>
      <div className="split__aside stack stack--tight">
        <h2 className="subtitle">What your pod will see</h2>
        <p className="a-muted">
          Your intent for this event, your interests and your prompt answer. Not your name, photo,
          or anything else. Only your pod sees it, and only until an hour after the event.
        </p>
        <p className="small a-muted">You can leave any time before the event.</p>
        <button
          type="button"
          className="btn btn--glow"
          disabled={intents.length === 0}
          onClick={submit}
        >
          <span>Put me in a pod</span>
          <ArrowIcon direction="right" />
        </button>
      </div>
    </div>
  )
}
