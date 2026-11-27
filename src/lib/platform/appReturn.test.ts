import { Capacitor } from '@capacitor/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  appMock,
  browserMock,
  listenerHandles,
  resetCapacitorMocks,
} from '../../test/capacitorMocks.ts'
import { onReturnToApp } from './index.ts'

vi.mock('@capacitor/browser', async () => ({
  Browser: (await import('../../test/capacitorMocks.ts')).browserMock,
}))
vi.mock('@capacitor/app', async () => ({
  App: (await import('../../test/capacitorMocks.ts')).appMock,
}))

beforeEach(resetCapacitorMocks)

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('onReturnToApp on the web', () => {
  it('fires when the tab becomes visible again, not when it hides', () => {
    const onReturn = vi.fn()
    const stop = onReturnToApp(onReturn)
    setVisibility('hidden')
    expect(onReturn).not.toHaveBeenCalled()
    setVisibility('visible')
    expect(onReturn).toHaveBeenCalledTimes(1)
    stop()
    setVisibility('visible')
    expect(onReturn).toHaveBeenCalledTimes(1)
    expect(appMock.addListener).not.toHaveBeenCalled()
  })
})

describe('onReturnToApp in the native apps', () => {
  it('listens for the app resuming and the in-app browser closing, and stops both', async () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true)
    const onReturn = vi.fn()

    const stop = onReturnToApp(onReturn)
    expect(appMock.addListener).toHaveBeenCalledWith('resume', onReturn)
    expect(browserMock.addListener).toHaveBeenCalledWith('browserFinished', onReturn)

    stop()
    expect(listenerHandles).toHaveLength(2)
    await vi.waitFor(() => {
      for (const h of listenerHandles) expect(h.remove).toHaveBeenCalled()
    })
  })
})
