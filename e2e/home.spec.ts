import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const HEADLINE = 'Make friends at the events you’d go to anyway.'

/** Scrolls to the end of the opening story (the sticky firefly field). */
async function scrollToStoryEnd(page: Page) {
  await page.evaluate(() => {
    const story = document.querySelector<HTMLElement>('.story')
    if (!story) throw new Error('story section missing')
    window.scrollTo({
      top: story.offsetTop + story.offsetHeight - window.innerHeight,
      behavior: 'instant',
    })
  })
}

/** Counts painted pixels on the field canvas, to prove the fireflies actually drew. */
function paintedPixels(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return 0
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    let painted = 0
    for (let i = 3; i < data.length; i += 4) if ((data[i] ?? 0) > 0) painted++
    return painted
  })
}

test.describe('landing page', () => {
  test('leads with the promise and the invite action', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: HEADLINE })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Get an invite' })).toBeVisible()
  })

  test('has no detectable accessibility violations', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('does not scroll horizontally', async ({ page }) => {
    await page.goto('/')
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })

  test('draws the firefly field', async ({ page }) => {
    await page.goto('/')
    await expect.poll(() => paintedPixels(page)).toBeGreaterThan(0)
  })

  test('lets the visitor pick interests and watch the example feed re-rank', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'How it picks' }).click()
    const feed = page.getByRole('list', { name: 'Example feed' })
    await expect(feed.getByRole('listitem').first()).toContainText('Board-game night')
    await page.getByRole('button', { name: 'Board games' }).click()
    await page.getByRole('button', { name: 'Running' }).click()
    await expect(page.getByRole('button', { name: 'Running' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(feed.getByRole('listitem').first()).toContainText('Saturday 5K social run')
    await expect(feed.getByRole('listitem').first()).toContainText('Because you like running')
  })

  test('answers a tap on the dark without getting in the way', async ({ page }) => {
    await page.goto('/')
    const before = await page.evaluate(() => window.scrollY)
    await page.locator('.hero').click({ position: { x: 120, y: 200 } })
    await expect.poll(() => paintedPixels(page)).toBeGreaterThan(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(before)
  })

  test('tells the story as the visitor scrolls', async ({ page }) => {
    await page.goto('/')
    const week = page.locator('.story__week')
    await expect(week).toHaveAttribute('data-shown', 'false')
    await scrollToStoryEnd(page)
    await expect(page.getByText('Until you’re in step.')).toBeInViewport()
    await expect(week).toHaveAttribute('data-shown', 'true')
    await expect(week).toContainText('4')
  })

  test('takes the visitor from the header to the invite form', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Get an invite' }).click()
    await expect(page).toHaveURL(/#invite$/)
    await expect(page.getByLabel('Email')).toBeInViewport()
  })

  test('checks the email and is honest that invites are not open yet', async ({ page }) => {
    await page.goto('/#invite')
    const submit = page.getByRole('button', { name: 'Get an invite' })
    await submit.click()
    await expect(page.getByRole('alert')).toHaveText('Enter your email address.')
    await page.getByLabel('Email').fill('sam@example.ca')
    await submit.click()
    await expect(page.getByText(/Invites aren’t open yet/)).toBeVisible()
  })
})

test.describe('landing page with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('shows the end of the story as a still frame', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.story__week')).toHaveAttribute('data-shown', 'true')
    await expect.poll(() => paintedPixels(page)).toBeGreaterThan(0)
  })
})
