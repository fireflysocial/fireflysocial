import { Navigate } from 'react-router'
import { useAppState } from './appState.ts'
import { GateScreen } from './GateScreen.tsx'

/** /app opens the feed for someone signed in and onboarded; everyone else goes where they belong. */
export function AppIndex() {
  const { gate } = useAppState()
  return gate === 'ready' ? <Navigate to="/app/feed" replace /> : <GateScreen gate={gate} />
}
