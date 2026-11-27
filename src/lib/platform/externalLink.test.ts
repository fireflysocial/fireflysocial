import { beforeEach, describe, expect, it, vi } from 'vitest'
import { browserMock, resetCapacitorMocks } from '../../test/capacitorMocks.ts'
import { openInAppBrowser } from './externalLink.ts'

vi.mock('@capacitor/browser', async () => ({
  Browser: (await import('../../test/capacitorMocks.ts')).browserMock,
}))

beforeEach(resetCapacitorMocks)

describe('openInAppBrowser', () => {
  it('opens a plain https URL in the in-app browser', async () => {
    await expect(openInAppBrowser('https://example.com/e')).resolves.toBe(true)
    expect(browserMock.open).toHaveBeenCalledWith({
      url: 'https://example.com/e',
      presentationStyle: 'popover',
    })
  })

  it('refuses anything that is not http(s)', async () => {
    await expect(openInAppBrowser('javascript:alert(1)')).resolves.toBe(false)
    expect(browserMock.open).not.toHaveBeenCalled()
  })
})
