import { Navigate } from 'react-router'
import { FireflyMark } from '../../components/FireflyMark.tsx'
import { loadDraft } from '../../data/onboardingDraft.ts'
import { useAppState, type Gate } from './appState.ts'

/**
 * What to show instead of a screen the person can't see yet: a quiet loading state, a retry when
 * the profile couldn't load, the welcome screen when signed out, or onboarding (picking up where
 * they left off) when they haven't finished it.
 */
export function GateScreen({ gate }: { gate: Exclude<Gate, 'ready'> }) {
  const { retryProfile, signOut } = useAppState()
  switch (gate) {
    case 'signed-out':
      return <Navigate to="/app/welcome" replace />
    case 'onboarding':
      return <Navigate to={`/app/start/${loadDraft()?.step ?? 'pledge'}`} replace />
    case 'loading':
      return (
        <main className="gate" id="main">
          <FireflyMark className="gate__mark" cropped />
          <p className="a-muted" role="status">
            Loading…
          </p>
        </main>
      )
    case 'error':
      return (
        <main className="gate" id="main">
          <div className="stack">
            <h1 className="title">We couldn’t load your answers.</h1>
            <p className="a-muted">Check your connection and try again.</p>
            <div className="row-actions">
              <button type="button" className="btn btn--glow btn--fit" onClick={retryProfile}>
                Try again
              </button>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  void signOut()
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </main>
      )
  }
}
