import { Link, Navigate } from 'react-router'
import { ArrowIcon } from '../../components/ArrowIcon.tsx'
import { FireflyMark } from '../../components/FireflyMark.tsx'
import { useAppState } from './appState.ts'
import { GateScreen } from './GateScreen.tsx'

/** The first screen (v4 step 1): one sentence on what Firefly is, then sign up or log in. */
export function WelcomePage() {
  const { gate, city } = useAppState()
  if (gate === 'loading') return <GateScreen gate="loading" />
  if (gate !== 'signed-out') return <Navigate to="/app" replace />
  return (
    <main className="onboarding onboarding--first" id="main">
      <div className="step">
        <div className="step__intro stack">
          <p className="lockup">
            <FireflyMark className="lockup__mark" cropped />
            <span>Firefly</span>
          </p>
          <h1 className="a-display">Get more out of the events you already go to.</h1>
        </div>
        <div className="step__body stack">
          <p className="lede">
            Tell us what you’re into and how you like to meet people, and we’ll find events in{' '}
            {city.name} that fit you.
          </p>
          <p className="small small--muted">
            No password: we email you a sign-in link. Your answers are private to you, and Firefly
            never uses your location.
          </p>
        </div>
      </div>
      <div className="onboarding__foot stack stack--tight">
        <Link className="btn btn--glow" to="/app/sign-in">
          <span>Get started</span>
          <ArrowIcon direction="right" />
        </Link>
        <Link className="text-link gate__alt" to="/app/sign-in?mode=login">
          I already have an account
        </Link>
      </div>
    </main>
  )
}
