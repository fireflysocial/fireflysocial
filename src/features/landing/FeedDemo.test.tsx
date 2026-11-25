import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FeedDemo } from './FeedDemo.tsx'

function feedTitles() {
  return within(screen.getByRole('list', { name: 'Example feed' }))
    .getAllByRole('listitem')
    .map((item) => item.querySelector('.feed__title')?.textContent)
}

describe('FeedDemo', () => {
  it('starts with a couple of interests picked and a short, explained feed', () => {
    render(<FeedDemo />)
    expect(screen.getByRole('button', { name: 'Board games' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Outdoors' })).toHaveAttribute('aria-pressed', 'true')
    expect(feedTitles()).toHaveLength(4)
    expect(screen.getByText('Because you like board games')).toBeInTheDocument()
  })

  it('re-ranks the feed when the visitor picks an interest', async () => {
    const user = userEvent.setup()
    render(<FeedDemo />)
    await user.click(screen.getByRole('button', { name: 'Crafts' }))
    await user.click(screen.getByRole('button', { name: 'Food & drink' }))
    expect(screen.getByRole('button', { name: 'Crafts' })).toHaveAttribute('aria-pressed', 'true')
    expect(feedTitles()[0]).toBe('Board-game night')
    expect(feedTitles()).toContain('Dumpling-making night')
    expect(screen.getByRole('status')).toHaveTextContent('Top pick: Board-game night')
  })

  it('un-picks on a second tap', async () => {
    const user = userEvent.setup()
    render(<FeedDemo />)
    const boardGames = screen.getByRole('button', { name: 'Board games' })
    await user.click(boardGames)
    expect(boardGames).toHaveAttribute('aria-pressed', 'false')
  })

  it('invites the visitor to pick something when nothing is picked', async () => {
    const user = userEvent.setup()
    render(<FeedDemo />)
    await user.click(screen.getByRole('button', { name: 'Board games' }))
    await user.click(screen.getByRole('button', { name: 'Outdoors' }))
    expect(
      screen.getByText('Pick something you’re into and the list reorders.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Because you like/)).not.toBeInTheDocument()
  })
})
