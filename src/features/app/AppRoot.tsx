import { Outlet } from 'react-router'
import { AppStateProvider } from './AppStateProvider.tsx'
import './app.css'

/** Everything under /app: the attendee app (v4 launch flow). Always dark until light mode is designed. */
export function AppRoot() {
  return (
    <AppStateProvider>
      <div className="app">
        <Outlet />
      </div>
    </AppStateProvider>
  )
}
