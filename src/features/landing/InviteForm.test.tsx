import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InvitesNotOpenError } from '../../data/invites.ts'
import { InviteForm } from './InviteForm.tsx'

function setup(onRequest = vi.fn(() => Promise.resolve())) {
  const user = userEvent.setup()
  render(<InviteForm onRequest={onRequest} />)
  const email = screen.getByLabelText('Email')
  const submit = screen.getByRole('button', { name: 'Get an invite' })
  return { user, email, submit, onRequest }
}

describe('InviteForm', () => {
  it('asks for an email when submitted empty, without sending anything', async () => {
    const { user, submit, email, onRequest } = setup()
    await user.click(submit)
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your email address.')
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(onRequest).not.toHaveBeenCalled()
  })

  it('rejects something that is not an email address', async () => {
    const { user, email, onRequest } = setup()
    await user.type(email, 'sam@example{Enter}')
    expect(screen.getByRole('alert')).toHaveTextContent('doesn’t look like an email address')
    expect(onRequest).not.toHaveBeenCalled()
  })

  it('clears the error as soon as the visitor edits the address', async () => {
    const { user, email, submit } = setup()
    await user.click(submit)
    await user.type(email, 's')
    expect(screen.getByRole('alert')).toBeEmptyDOMElement()
    expect(email).toHaveAttribute('aria-invalid', 'false')
  })

  it('sends a cleaned-up address and confirms', async () => {
    const { user, email, onRequest } = setup()
    await user.type(email, '  Sam@Example.CA {Enter}')
    expect(onRequest).toHaveBeenCalledWith('Sam@example.ca')
    expect(await screen.findByRole('status')).toHaveTextContent('You’re on the list.')
  })

  it('shows that it is sending and ignores repeat taps', async () => {
    let finish: (() => void) | undefined
    const onRequest = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    const { user, email, submit } = setup(onRequest)
    await user.type(email, 'sam@example.ca')
    await user.click(submit)
    const sending = screen.getByRole('button', { name: 'Sending…' })
    expect(sending).toBeDisabled()
    await user.click(sending)
    // Any other way of submitting (not through the disabled button) is ignored too.
    act(() => {
      email.closest('form')?.requestSubmit()
    })
    expect(onRequest).toHaveBeenCalledTimes(1)
    finish?.()
    expect(await screen.findByText(/You’re on the list/)).toBeInTheDocument()
  })

  it('says plainly when invites are not open yet', async () => {
    const { user, email } = setup(vi.fn(() => Promise.reject(new InvitesNotOpenError())))
    await user.type(email, 'sam@example.ca{Enter}')
    expect(await screen.findByText(/Invites aren’t open yet/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get an invite' })).toBeEnabled()
  })

  it('suggests checking the connection when the request fails', async () => {
    const { user, email } = setup(vi.fn(() => Promise.reject(new Error('network'))))
    await user.type(email, 'sam@example.ca{Enter}')
    expect(await screen.findByText(/Check your connection and try again/)).toBeInTheDocument()
  })
})
