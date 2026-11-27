import { Capacitor } from '@capacitor/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { browserMock, resetCapacitorMocks } from '../test/capacitorMocks.ts'
import { ExternalLink } from './ExternalLink.tsx'

vi.mock('@capacitor/browser', async () => ({
  Browser: (await import('../test/capacitorMocks.ts')).browserMock,
}))

beforeEach(resetCapacitorMocks)

describe('ExternalLink', () => {
  it('on the web, is a plain link that opens a new tab', async () => {
    const onOpen = vi.fn()
    render(
      <ExternalLink href="https://example.com/e" onOpen={onOpen}>
        Register
      </ExternalLink>,
    )
    const link = screen.getByRole('link', { name: 'Register' })
    expect(link).toHaveAttribute('href', 'https://example.com/e')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    await userEvent.click(link)
    expect(browserMock.open).not.toHaveBeenCalled()
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('in the native apps, opens the in-app browser instead', async () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true)
    render(<ExternalLink href="https://example.com/e">Register</ExternalLink>)
    await userEvent.click(screen.getByRole('link', { name: 'Register' }))
    expect(browserMock.open).toHaveBeenCalledWith({
      url: 'https://example.com/e',
      presentationStyle: 'popover',
    })
  })

  it('shows an unsafe URL as text, not a link', () => {
    render(<ExternalLink href="javascript:alert(1)">Register</ExternalLink>)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
  })
})
