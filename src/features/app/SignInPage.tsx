import { useState, type SyntheticEvent } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router'
import { ArrowIcon } from '../../components/ArrowIcon.tsx'
import type { LinkFailure } from '../../data/account.ts'
import { checkEmail } from '../../lib/email.ts'
import { appUrl, isNativeApp, linkErrorIn } from '../../lib/platform/index.ts'
import { useAccountService } from './accountContext.ts'
import { useAppState } from './appState.ts'
import { GateScreen } from './GateScreen.tsx'

const FAILURES: Record<LinkFailure, string> = {
  'rate-limited': 'Too many tries. Wait a few minutes, then try again.',
  network: 'You seem to be offline. Check your connection and try again.',
  unavailable: 'We couldn’t send a link right now. Please try again later.',
}

const EXPIRED = 'That sign-in link has expired or was already used. Enter your email for a new one.'

/** Where the emailed link brings the person back to. */
const RETURN_PATH = '/app/sign-in'

/**
 * Sign up and log in (v4 step 2): an email address, then a link from the email. Both are the same
 * flow, so this page never says whether an address already has an account. Opening the link comes
 * back here signed in, and the app takes over (onboarding or the feed). Links open in the browser,
 * so inside the iOS and Android apps this needs deep links before it works there.
 */
export function SignInPage() {
  const { gate } = useAppState()
  const account = useAccountService()
  const [params] = useSearchParams()
  const { hash } = useLocation()
  const returning = params.get('mode') === 'login'
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(() => (linkErrorIn(hash) ? EXPIRED : null))
  const [notice, setNotice] = useState<string | null>(null)

  if (gate === 'loading') return <GateScreen gate="loading" />
  // Signed in (here, or by opening the link in another tab): the app decides what comes next.
  if (gate !== 'signed-out') return <Navigate to="/app" replace />

  const send = async (address: string) => {
    setBusy(true)
    setError(null)
    setNotice(null)
    const result = await account.sendLink(address, appUrl(RETURN_PATH))
    setBusy(false)
    if (!result.ok) {
      setError(FAILURES[result.reason])
      return false
    }
    return true
  }

  const onEmail = async (e: SyntheticEvent) => {
    e.preventDefault()
    const checked = checkEmail(email)
    if (!checked.ok) {
      setError(checked.error)
      return
    }
    if (await send(checked.email)) setSentTo(checked.email)
  }

  return (
    <main className="onboarding" id="main">
      <div className="onboarding__top">
        {/* On the web people arrive from the landing page; the apps open on the welcome screen. */}
        <Link className="text-link back" to={isNativeApp() ? '/app/welcome' : '/'}>
          <ArrowIcon direction="left" />
          Back
        </Link>
      </div>
      {sentTo === null ? (
        <form
          className="step"
          noValidate
          onSubmit={(e) => {
            void onEmail(e)
          }}
        >
          <div className="step__intro stack stack--tight">
            <h1 className="title">
              <label htmlFor="email">{returning ? 'Welcome back' : 'What’s your email?'}</label>
            </h1>
            <p className="a-muted" id="email-hint">
              {returning
                ? 'Enter your email and we’ll send you a link to log in.'
                : 'We’ll email you a link to sign in. No password to remember.'}
            </p>
          </div>
          <div className="step__body stack stack--tight">
            <input
              id="email"
              className="a-field"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              aria-describedby={error ? 'email-hint auth-error' : 'email-hint'}
              aria-invalid={error !== null}
              onChange={(e) => {
                setEmail(e.target.value)
              }}
            />
            {error && (
              <p className="field-error" id="auth-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="onboarding__foot">
            <button type="submit" className="btn btn--glow" disabled={busy}>
              <span>{busy ? 'Sending…' : 'Send link'}</span>
              <ArrowIcon direction="right" />
            </button>
          </div>
        </form>
      ) : (
        <div className="step">
          <div className="step__intro stack stack--tight">
            <h1 className="title">Check your email</h1>
            <p className="a-muted">
              We sent a sign-in link to <strong>{sentTo}</strong>. Open it on this device to carry
              on. It works for an hour.
            </p>
          </div>
          <div className="step__body stack stack--tight">
            <p className="small small--muted">Can’t find it? Check your spam folder.</p>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <p className="small small--muted" aria-live="polite">
              {notice}
            </p>
            <div className="row-actions">
              <button
                type="button"
                className="text-link"
                disabled={busy}
                onClick={() => {
                  void send(sentTo).then((sent) => {
                    if (sent) setNotice('New link sent.')
                  })
                }}
              >
                Send a new link
              </button>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setError(null)
                  setNotice(null)
                  setSentTo(null)
                }}
              >
                Use a different email
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
