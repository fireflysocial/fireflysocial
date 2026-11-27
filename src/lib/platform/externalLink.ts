import { Browser } from '@capacitor/browser'
import { toSafeHttpUrl } from './safeUrl.ts'

/**
 * Opens an outside page (an event's own registration page) in the in-app browser: SFSafariViewController
 * on iOS, Custom Tabs on Android. Only used inside the native apps; on the web, ExternalLink is a
 * plain link that opens a new tab, so there are no window.open popups (CLAUDE.md §9).
 * Returns false, without opening anything, if the URL isn't a plain http(s) URL.
 */
export async function openInAppBrowser(raw: string): Promise<boolean> {
  const url = toSafeHttpUrl(raw)
  if (!url) return false
  await Browser.open({ url, presentationStyle: 'popover' })
  return true
}
