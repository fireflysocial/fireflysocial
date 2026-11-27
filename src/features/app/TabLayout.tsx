import { Navigate, NavLink, Outlet } from 'react-router'
import { useAppState } from './appState.ts'
import { GoingPrompt } from './event/GoingPrompt.tsx'

const TABS = [
  { to: '/app/feed', label: 'For you' },
  { to: '/app/plans', label: 'Plans' },
  { to: '/app/you', label: 'You' },
] as const

/** The onboarded app: a screen above a bottom tab bar. Sends anyone not onboarded to the start. */
export function TabLayout() {
  const { profile, returnPromptFor } = useAppState()
  if (!profile) return <Navigate to="/app/start/welcome" replace />
  return (
    <>
      <main className="app-main" id="main">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Main">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className="tabbar__link">
            {tab.label}
          </NavLink>
        ))}
      </nav>
      {returnPromptFor !== null && <GoingPrompt eventId={returnPromptFor} />}
    </>
  )
}
