// The only place that touches device features (CLAUDE.md §9). Feature code imports from here and
// never calls navigator.*, window.open or Capacitor plugins directly.
export { onReturnToApp } from './appReturn.ts'
export { openInAppBrowser } from './externalLink.ts'
export { isNativeApp } from './native.ts'
export { toSafeHttpUrl } from './safeUrl.ts'
