import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const isCI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  ...(isCI ? { workers: 1 } : {}),
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // Phones are the primary target (the native apps wrap this same build), so every spec runs on:
  // - mobile-safari: iPhone 17 (402px), WebKit, closest to the iOS WKWebView that Capacitor uses
  // - mobile-chrome: Pixel 10 (360px), Chromium, closest to the Android WebView; 360px is the
  //   common width for mainstream Android phones and the narrowest we test, so layout bugs show up here first
  // - desktop-chrome: secondary check for the web version
  projects: [
    { name: 'mobile-safari', use: { ...devices['iPhone 17'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 10'] } },
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // Test the production build, not the dev server.
    command: `npm run build && npm run preview -- --port ${String(PORT)} --strictPort`,
    url: `http://localhost:${String(PORT)}`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
