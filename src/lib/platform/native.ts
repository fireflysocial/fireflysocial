import { Capacitor } from '@capacitor/core'

/** True inside the iOS or Android app, false in a browser (including a phone's browser). */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}
