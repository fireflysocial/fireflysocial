import { useId, useState, type SubmitEvent } from 'react'
import { InvitesNotOpenError, type RequestInvite } from '../../data/invites.ts'
import { checkEmail } from '../../lib/email.ts'
import { ArrowIcon } from './ArrowIcon.tsx'

type Status =
  | { kind: 'idle' }
  | { kind: 'invalid'; message: string }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'failed'; message: string }

const NOT_OPEN = 'Invites aren’t open yet, so we couldn’t save your email. Please check back soon.'
const OFFLINE = 'We couldn’t reach Firefly. Check your connection and try again.'

interface InviteFormProps {
  onRequest: RequestInvite
}

export function InviteForm({ onRequest }: InviteFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const errorId = useId()
  const hintId = useId()

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status.kind === 'sending') return
    const checked = checkEmail(email)
    if (!checked.ok) {
      setStatus({ kind: 'invalid', message: checked.error })
      return
    }
    setStatus({ kind: 'sending' })
    try {
      await onRequest(checked.email)
      setStatus({ kind: 'sent' })
    } catch (error) {
      setStatus({
        kind: 'failed',
        message: error instanceof InvitesNotOpenError ? NOT_OPEN : OFFLINE,
      })
    }
  }

  if (status.kind === 'sent') {
    return (
      <p className="invite__done" role="status">
        You’re on the list. We’ll email you when Firefly opens.
      </p>
    )
  }

  const invalid = status.kind === 'invalid'
  return (
    <form className="invite__form" noValidate onSubmit={(event) => void submit(event)}>
      <label className="invite__label" htmlFor="invite-email">
        Email
      </label>
      <div className="invite__field">
        <input
          id="invite-email"
          className="invite__input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (invalid) setStatus({ kind: 'idle' })
          }}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${errorId} ${hintId}` : hintId}
        />
        <button className="invite__submit" type="submit" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : 'Get an invite'}
          <ArrowIcon direction="right" />
        </button>
      </div>
      <p id={errorId} className="invite__error" role="alert">
        {invalid ? status.message : ''}
      </p>
      <p className="invite__status" role="status">
        {status.kind === 'failed' ? status.message : ''}
      </p>
      <p id={hintId} className="invite__hint">
        We’ll only use your email to tell you when Firefly opens. 18+ only. Friends only: no dating,
        no selling.
      </p>
    </form>
  )
}
