import type { CapacitorConfig } from '@capacitor/cli'

// Capacitor wraps the Vite web build (dist/) in the iOS and Android apps. The app ID is permanent
// once the apps are in the stores (decided 2026-11-27); don't change it (CLAUDE.md §12).
const config: CapacitorConfig = {
  appId: 'com.fireflysocial.app',
  appName: 'Firefly',
  webDir: 'dist',
  // The soft black ground shows while the web view loads, so there's no white flash.
  backgroundColor: '#050505',
  ios: {
    // Safe areas are handled in CSS (viewport-fit=cover and the --safe-* variables in index.css).
    contentInset: 'never',
  },
}

export default config
