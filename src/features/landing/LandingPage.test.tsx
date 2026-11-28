import { render as rtlRender, screen, within } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { LandingPage } from './LandingPage.tsx'

/** The landing page links into the app, so it renders inside a router, as it does for real. */
const render = (ui: ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>)

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
      'Get started.',
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

  it('takes people straight to sign-up, or to log in', () => {
    render(<LandingPage />)
    const start = screen.getAllByRole('link', { name: /Get started/ })
    expect(start).toHaveLength(2)
    for (const link of start) expect(link).toHaveAttribute('href', '/app/sign-in')
    for (const link of screen.getAllByRole('link', { name: /Log in/ })) {
      expect(link).toHaveAttribute('href', '/app/sign-in?mode=login')
    }
    expect(screen.getByRole('link', { name: 'Skip to getting started' })).toHaveAttribute(
      'href',
      '#start',
    )
    expect(document.getElementById('start')).toContainElement(start[1] ?? null)
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
