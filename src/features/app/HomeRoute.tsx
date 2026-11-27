import { Navigate } from 'react-router'
import { isNativeApp } from '../../lib/platform/index.ts'
import { LandingPage } from '../landing/LandingPage.tsx'

/** "/" is the public landing page on the web. The iOS and Android apps open straight into the app. */
export function HomeRoute() {
  return isNativeApp() ? <Navigate to="/app" replace /> : <LandingPage />
}
