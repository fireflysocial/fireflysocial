import { Navigate } from 'react-router'
import { useAppState } from './appState.ts'

/** /app opens the feed for someone who's onboarded, and onboarding for everyone else. */
export function AppIndex() {
  const { profile } = useAppState()
  return <Navigate to={profile ? '/app/feed' : '/app/start/welcome'} replace />
}
