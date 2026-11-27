import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { isNativeApp } from './native.ts'

/**
 * Calls `onReturn` when the person comes back to Firefly: the in-app browser closes or the app
 * returns to the foreground (native), or the tab becomes visible again (web). The going flow uses
 * it to ask "Did you register?" after someone visits an event's own page (v4 §2).
 * Returns a function that stops listening.
 */
export function onReturnToApp(onReturn: () => void): () => void {
  if (isNativeApp()) {
    const handles = [
      App.addListener('resume', onReturn),
      Browser.addListener('browserFinished', onReturn),
    ]
    return () => {
      for (const handle of handles) void handle.then((h) => h.remove())
    }
  }
  const onVisibility = () => {
    if (document.visibilityState === 'visible') onReturn()
  }
  document.addEventListener('visibilitychange', onVisibility)
  return () => {
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
