import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LandingPage } from './LandingPage.tsx'

const HEADLINE = 'Meet your people at the events you’d go to anyway.'

describe('LandingPage', () => {
  it('leads with the promise', () => {
    render(<LandingPage />)
    expect(screen.getByRole('heading', { level: 1, name: HEADLINE })).toBeInTheDocument()
  })

  it('has every section a visitor needs, launch first and vision second', () => {
    render(<LandingPage />)
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Tell it what you like. Watch it pick.',
      'How it works',
      'Coming next: Then, the people going too.',
      'Events Firefly finds',
      'Private by default.',
      'Get an invite.',
    ])
  })

  it('labels what is coming next as coming, not as shipped', () => {
    render(<LandingPage />)
    const comingNext = document.getElementById('coming-next')
    if (!comingNext) throw new Error('coming-next section missing')
    expect(within(comingNext).getByText('Coming next')).toBeInTheDocument()
    expect(
      within(comingNext).getByText('Firefly will put a few of you together.'),
    ).toBeInTheDocument()
  })

  it('tells the whole story in text, not only in the animation', () => {
    render(<LandingPage />)
    for (const line of [
      'Your city is full of people you’ve almost met.',
      'Same event. Same faces. Week after week.',
      'Until you’re in step.',
    ]) {
      expect(screen.getByText(line)).toBeInTheDocument()
    }
  })

  it('points every invite link at the invite form', () => {
    render(<LandingPage />)
    for (const link of screen.getAllByRole('link', { name: /invite/i })) {
      expect(link).toHaveAttribute('href', '#invite')
    }
    expect(document.getElementById('invite')).toContainElement(screen.getByLabelText('Email'))
  })

  it('labels the example feed as made up', () => {
    render(<LandingPage />)
    expect(
      screen.getByText(
        'Example events, set in Vancouver, our first city. Real listings come from your city.',
      ),
    ).toBeInTheDocument()
  })

  it('promises the privacy rules that apply at launch', () => {
    render(<LandingPage />)
    for (const promise of [
      'No location, ever.',
      'Your plans stay yours.',
      'Only what’s needed.',
      '18+ and good intent only.',
      'Report anything.',
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

  it('paints the browser toolbar black while open and restores it after', () => {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = '#ffffff'
    document.head.append(meta)
    const { unmount } = render(<LandingPage />)
    expect(meta.content).toBe('#050505')
    unmount()
    expect(meta.content).toBe('#ffffff')
    meta.remove()
  })
})
