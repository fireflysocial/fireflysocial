import { useEffect, useId, useRef } from 'react'
import { readyEvents, useAppState } from '../appState.ts'
import { GoingAnswers } from './GoingAnswers.tsx'

/**
 * Asked when the person comes back from an event's own page: "Did you register?" (v4 §2).
 * Closing it turns it into a quiet card on the feed, never a repeat pop-up.
 */
export function GoingPrompt({ eventId }: { eventId: string }) {
  const { events, dispatch } = useAppState()
  const headingId = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const event = readyEvents(events).find((e) => e.id === eventId)

  useEffect(() => {
    // Move focus into the dialog, onto its question, so screen readers announce it.
    headingRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'dismiss-return' })
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [dispatch])

  if (!event) return null
  return (
    <div className="sheet-backdrop">
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={headingId}>
        <p className="ctx">Welcome back</p>
        <h2 className="title" id={headingId} ref={headingRef} tabIndex={-1}>
          Did you register for {event.title}?
        </h2>
        <GoingAnswers eventId={event.id} primary />
        <button
          type="button"
          className="text-link"
          onClick={() => {
            dispatch({ type: 'dismiss-return' })
          }}
        >
          Ask me later
        </button>
      </div>
    </div>
  )
}
