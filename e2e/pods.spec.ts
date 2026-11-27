import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// The connection flow (workflow/connection-flow.md) on the example pod: opt in, the pod reveal,
// "We met", keep meeting and sharing a social. Pod-mates are made up; "Example only" controls
// jump ahead in time.

test.use({ reducedMotion: 'reduce' })

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

test('opt in, meet the pod, keep meeting and share a social', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('firefly.profile.v1')) return
    localStorage.setItem(
      'firefly.profile.v1',
      JSON.stringify({
        firstName: 'Alex',
        cityId: 'vancouver',
        intents: ['friends'],
        interests: ['board-games', 'language-exchange', 'pottery'],
        freeTimes: [],
        neighbourhoods: [],
        budget: 'low',
        newcomer: null,
        accessNeeds: [],
        pledgedAt: '2026-11-27T00:00:00.000Z',
      }),
    )
  })
  await page.goto('/app/feed')
  // A free event with no registration, two or more days away: its pod hasn't formed yet.
  await page.getByRole('link', { name: 'Board game social' }).click()
  await page.getByRole('button', { name: 'I’m going' }).click()

  await page.getByRole('link', { name: 'Yes, I’m open' }).click()
  await expect(
    page.getByRole('heading', { name: 'What do you want out of this one?' }),
  ).toBeVisible()
  await expectAccessible(page)
  await expectNoSideScroll(page)
  await page.getByLabel(/The last thing I got nerdy about/).fill('old maps of the city')
  await page.getByRole('button', { name: /Put me in a pod/ }).click()
  await expect(page.getByText(/You’re in. Your pod forms/)).toBeVisible()

  await page.getByRole('button', { name: /Skip to when the pod forms/ }).click()
  await page.getByRole('link', { name: 'See your pod' }).click()
  await expect(page.getByRole('heading', { name: /^Pod [A-Z]/ })).toBeVisible()
  await expect(page.getByText('Pod-mate 1', { exact: true })).toBeVisible()
  await expectAccessible(page)
  await expectNoSideScroll(page)

  await page.getByRole('button', { name: /Skip to the event/ }).click()
  await expect(page.getByRole('heading', { name: 'Who did you meet?' })).toBeVisible()
  await expectAccessible(page)
  for (const box of await page.getByRole('checkbox').all()) await box.check()
  await page.getByRole('button', { name: 'Done' }).click()
  await page.getByRole('button', { name: /Skip to after the event/ }).click()

  await expect(
    page.getByRole('heading', { name: 'Anyone you’d like to keep meeting?' }),
  ).toBeVisible()
  await expectAccessible(page)
  for (const keep of await page.getByRole('button', { name: 'Keep meeting' }).all())
    await keep.click()
  await page.getByRole('button', { name: 'Send privately' }).click()
  await expect(page.getByRole('heading', { name: /want to keep meeting/ })).toBeVisible()

  await page.locator('a[href^="/app/people/"]').first().click()
  await expect(page.getByRole('heading', { name: 'Share a way to stay in touch' })).toBeVisible()
  await expectAccessible(page)
  await expectNoSideScroll(page)
  await page.getByLabel('Instagram').fill('@alex.makes')
  await page.getByRole('button', { name: /Share my Instagram/ }).click()
  await expect(page.getByText('Shared: @alex.makes')).toBeVisible()
})
