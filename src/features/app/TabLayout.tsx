import { Link, NavLink, Outlet } from 'react-router'
import { FireflyMark } from '../../components/FireflyMark.tsx'
import { useAppState } from './appState.ts'
import { GoingPrompt } from './event/GoingPrompt.tsx'
import { GateScreen } from './GateScreen.tsx'

/** Each tab's context line is shown only on wide screens, where the bar becomes a block header. */
const TABS = [
  { to: '/app/feed', label: 'For you', context: 'This week' },
  { to: '/app/plans', label: 'Plans', context: 'Going and saved' },
  { to: '/app/you', label: 'You', context: 'Answers and privacy' },
] as const

/**
 * The onboarded app. One navigation, two shapes: a bottom tab bar on phones (thumb reach), and
 * from 900px a block header like the landing page's, with the mark cell and two-line labels.
 * Sends anyone not signed in and onboarded where they belong.
 */
export function TabLayout() {
  const { gate, returnPromptFor } = useAppState()
  if (gate !== 'ready') return <GateScreen gate={gate} />
  return (
    <>
      <nav className="appbar" aria-label="Main">
        <Link className="appbar__home" to="/app/feed" aria-label="Firefly, your feed">
          <span className="appbar__mark">
            <FireflyMark />
          </span>
          <span className="appbar__name">Firefly</span>
        </Link>
        <div className="appbar__tabs">
          {TABS.map((tab) => (
            <NavLink key={tab.to} to={tab.to} className="appbar__tab">
              <span className="appbar__context" aria-hidden="true">
                {tab.context}
              </span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="app-main" id="main">
        <Outlet />
      </main>
      {returnPromptFor !== null && <GoingPrompt eventId={returnPromptFor} />}
    </>
  )
}
