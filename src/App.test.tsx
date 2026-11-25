import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('opens on the landing page', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Make friends at the events you’d go to anyway.',
      }),
    ).toBeInTheDocument()
  })
})
