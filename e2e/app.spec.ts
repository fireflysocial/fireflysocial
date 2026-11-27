import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// The launch flow (workflow/v4-user-flow.md): onboarding → personal feed → going.
// Events are the made-up examples until the event pipeline is live.

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
}

async function expectNoSideScroll(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
}

async function onboard(page: Page) {
  await page.goto('/app')
  await expect(page).toHaveURL(/\/app\/start\/welcome$/)
  await expectAccessible(page)
  await page.getByRole('button', { name: 'Get started' }).click()

  await page.getByLabel('I’m 18 or older').check()
  await page.getByLabel(/good intent/).check()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByLabel('What’s your first name?').fill('Sam')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'New friends' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  for (const name of ['Board games', 'Language exchange', 'Pottery']) {
    await page.getByRole('button', { name }).click()
  }
  await expectAccessible(page)
  await expectNoSideScroll(page)
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'Continue' }).click()
  await expectNoSideScroll(page)
  await page.getByRole('button', { name: 'Show my feed' }).click()
  await expect(page).toHaveURL(/\/app\/feed$/)
}

test.describe('launch flow', () => {
  // Chips change colour over 180ms; with reduced motion that's instant, so axe checks the settled
  // colours rather than a frame mid-transition. Nothing in these screens animates meaningfully.
  test.use({ reducedMotion: 'reduce' })

  test('onboards to a personal feed that says why each event is there', async ({ page }) => {
    await onboard(page)
    await expect(page.getByRole('heading', { name: 'Hi, Sam' })).toBeVisible()
    await expect(page.getByText(/made-up example events/)).toBeVisible()
    await expect(page.getByText(/^Because you like /).first()).toBeVisible()
    await expectAccessible(page)
    await expectNoSideScroll(page)
  })

  test('going to a free event, and seeing it in Plans', async ({ page }) => {
    await onboard(page)
    await page.getByRole('link', { name: 'Board game social' }).click()
    await expect(page.getByRole('heading', { name: 'Board game social' })).toBeVisible()
    await expectAccessible(page)
    await expectNoSideScroll(page)
    await page.getByRole('button', { name: 'I’m going' }).click()
    await expect(page.getByText(/You’re going. Only you can see this./)).toBeVisible()

    await page.getByRole('link', { name: 'Plans' }).click()
    await expect(page.getByRole('region', { name: 'Going' }).getByRole('link')).toHaveText([
      'Board game social',
    ])
    await expectAccessible(page)
  })

  test('register links open the event’s own page in a new tab, never a popup script', async ({
    page,
  }) => {
    await onboard(page)
    await page.getByRole('link', { name: /^Language exchange/ }).click()
    const register = page.getByRole('link', { name: 'Register on example.com' })
    await expect(register).toHaveAttribute('target', '_blank')
    await expect(register).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('remembers the person on this device, and deletes everything on request', async ({
    page,
  }) => {
    await onboard(page)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Hi, Sam' })).toBeVisible()
    await page.getByRole('link', { name: 'You', exact: true }).click()
    await expectAccessible(page)
    await page.getByRole('button', { name: 'Delete my data' }).click()
    await page.getByRole('button', { name: 'Delete everything' }).click()
    await expect(page).toHaveURL(/\/app\/start\/welcome$/)
    expect(await page.evaluate(() => localStorage.length)).toBe(0)
  })

  test('navigation is a bottom tab bar on phones and a header on wide screens', async ({
    page,
  }) => {
    await onboard(page)
    const nav = page.getByRole('navigation', { name: 'Main' })
    const box = await nav.boundingBox()
    const viewport = page.viewportSize()
    if (!box || !viewport) throw new Error('no layout')
    if (viewport.width >= 900) {
      expect(box.y).toBe(0)
      await expect(page.getByText('Ranked by what you told us')).toBeVisible()
    } else {
      expect(Math.round(box.y + box.height)).toBe(viewport.height)
      await expect(page.getByText('Ranked by what you told us')).toBeHidden()
    }
  })
})
