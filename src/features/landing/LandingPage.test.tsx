import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LandingPage } from './LandingPage.tsx'

describe('LandingPage', () => {
  it('leads with the promise', () => {
    render(<LandingPage />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Keep meeting the same faces.' }),
    ).toBeInTheDocument()
  })

  it('tells the whole story in text, not only in the animation', () => {
    render(<LandingPage />)
    for (const line of [
      'Vancouver is full of people you’ve almost met.',
      'Firefly puts five of you in a pod.',
      'Same run. Same five. Week after week.',
      'Until you’re in step.',
    ]) {
      expect(screen.getByText(line)).toBeInTheDocument()
    }
  })

  it('has every section a visitor needs, in order', () => {
    render(<LandingPage />)
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'How it works',
      'Your pod, the night before.',
      'Events Firefly works with',
      'Easy to meet. Hard to find.',
      'Get an invite.',
    ])
  })

  it('points every invite link at the invite form', () => {
    render(<LandingPage />)
    for (const link of screen.getAllByRole('link', { name: /invite/i })) {
      expect(link).toHaveAttribute('href', '#invite')
    }
    expect(document.getElementById('invite')).toContainElement(screen.getByLabelText('Email'))
  })

  it('labels the example pod as made up', () => {
    render(<LandingPage />)
    expect(screen.getByText('Example pod. Names and details are made up.')).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: 'Example pod' })).getAllByRole('listitem'),
    ).toHaveLength(5)
  })

  it('promises the safety rules from the spec', () => {
    render(<LandingPage />)
    for (const promise of [
      'No location, ever.',
      'Picks stay private.',
      'Block and report from every card.',
      '18+ and friends only.',
    ]) {
      expect(screen.getByRole('heading', { level: 3, name: promise })).toBeInTheDocument()
    }
  })

  it('sends invite requests to the function it is given', async () => {
    const onRequestInvite = vi.fn(() => Promise.resolve())
    const user = userEvent.setup()
    render(<LandingPage onRequestInvite={onRequestInvite} />)
    await user.type(screen.getByLabelText('Email'), 'sam@example.ca{Enter}')
    expect(onRequestInvite).toHaveBeenCalledWith('sam@example.ca')
  })

  it('is honest that invites are not open yet by default', async () => {
    const user = userEvent.setup()
    render(<LandingPage />)
    await user.type(screen.getByLabelText('Email'), 'sam@example.ca{Enter}')
    expect(await screen.findByText(/Invites aren’t open yet/)).toBeInTheDocument()
  })

  it('paints the browser toolbar Night while open and restores it after', () => {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = '#ffffff'
    document.head.append(meta)
    const { unmount } = render(<LandingPage />)
    expect(meta.content).toBe('#0e1424')
    unmount()
    expect(meta.content).toBe('#ffffff')
    meta.remove()
  })
})
