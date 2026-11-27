import type { PluginListenerHandle } from '@capacitor/core'
import { vi } from 'vitest'

// Capacitor plugins are proxies that vi.spyOn can't patch, so tests replace the plugin modules at
// the import boundary instead: vi.mock('@capacitor/browser', () => ({ Browser: browserMock })).
// These stand-ins record calls; tests reset them in beforeEach.

type Listen = (event: string, listener: () => void) => Promise<PluginListenerHandle>

/** Every listener handle the mocks have handed out, so tests can check each was removed. */
export const listenerHandles: { remove: ReturnType<typeof vi.fn<() => Promise<void>>> }[] = []

const listen: Listen = () => {
  const handle = { remove: vi.fn(() => Promise.resolve()) }
  listenerHandles.push(handle)
  return Promise.resolve(handle)
}

export const browserMock = {
  open: vi.fn<(options: { url: string; presentationStyle?: string }) => Promise<void>>(() =>
    Promise.resolve(),
  ),
  addListener: vi.fn<Listen>(listen),
}

export const appMock = {
  addListener: vi.fn<Listen>(listen),
}

export function resetCapacitorMocks() {
  browserMock.open.mockClear()
  browserMock.addListener.mockClear()
  appMock.addListener.mockClear()
  listenerHandles.length = 0
}
