import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { fakeSupabase, openLink, type FakeSupabase } from './fakeSupabase.ts'

// The launch flow (workflow/v4-user-flow.md): sign up → onboarding → personal feed → going.
// Events are the made-up examples until the event pipeline is live; Supabase is faked at the
// HTTP boundary (fakeSupabase.ts).

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

/** Opens the last sign-in link, as tapping it in the email would. */
async function openEmailedLink(page: Page, supabase: FakeSupabase) {
  const sent = supabase.sent.at(-1)
  if (!sent) throw new Error('no link was sent')
  expect(sent.redirectTo).toMatch(/\/app\/sign-in$/)
  // A link from an email is a fresh page load, not a change to the page already open.
  await page.goto('about:blank')
  await page.goto(openLink(sent))
}

async function onboard(page: Page): Promise<FakeSupabase> {
  const supabase = await fakeSupabase(page)
  await page.goto('/app')
  await expect(page).toHaveURL(/\/app\/welcome$/)
  await expectAccessible(page)
  await page.getByRole('link', { name: 'Get started' }).click()

  await page.getByLabel('What’s your email?').fill('sam@example.com')
  await page.getByRole('button', { name: 'Send link' }).click()
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible()
  await expectAccessible(page)
  await openEmailedLink(page, supabase)

  await expect(page).toHaveURL(/\/app\/start\/pledge$/)
  await page.getByLabel('I’m 18 or older').check()
  await page.getByLabel(/good intent/).check()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByLabel('What’s your first name?').fill('Sam')
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'New friends' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByLabel('Building my own thing').check()
  await expectAccessible(page)
  await expectNoSideScroll(page)
  await page.getByRole('button', { name: 'Continue' }).click()

  for (const name of ['Board games', 'Language exchange', 'Pottery']) {
    await page.getByRole('button', { name }).click()
  }
  await expectAccessible(page)
  await expectNoSideScroll(page)
  await page.getByRole('button', { name: 'Continue' }).click()

  // The rest is optional: skip through, answering one on the way.
  for (let screen = 0; screen < 4; screen++)
    await page.getByRole('button', { name: 'Skip' }).click()
  await page.getByRole('button', { name: 'Weekday evenings' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  for (let screen = 0; screen < 2; screen++)
    await page.getByRole('button', { name: 'Skip' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Skip' }).click()
  await expectNoSideScroll(page)
  await page.getByRole('button', { name: 'Show my feed' }).click()
  await expect(page).toHaveURL(/\/app\/feed$/)
  return supabase
}

test.describe('launch flow', () => {
  // Chips change colour over 180ms; with reduced motion that's instant, so axe checks the settled
  // colours rather than a frame mid-transition. Nothing in these screens animates meaningfully.
  test.use({ reducedMotion: 'reduce' })

  test('signs up and onboards to a personal feed that says why each event is there', async ({
    page,
  }) => {
    const supabase = await onboard(page)
    expect(supabase.sent.map((s) => s.email)).toEqual(['sam@example.com'])
    expect([...supabase.rows.values()]).toEqual([
      expect.objectContaining({
        first_name: 'Sam',
        intents: ['friends'],
        work_area: 'building',
        interests: ['board-games', 'language-exchange', 'pottery'],
        free_times: ['weekday-evenings'],
      }),
    ])
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

  test('remembers the person, and deletes the account on request', async ({ page }) => {
    const supabase = await onboard(page)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Hi, Sam' })).toBeVisible()
    await page.getByRole('link', { name: 'You', exact: true }).click()
    await expectAccessible(page)
    await page.getByRole('button', { name: 'Delete my account' }).click()
    await page.getByRole('button', { name: 'Delete everything' }).click()
    await expect(page).toHaveURL(/\/app\/welcome$/)
    expect(supabase.rows.size).toBe(0)
    expect(await page.evaluate(() => localStorage.length)).toBe(0)
  })

  test('logs back in with a link, straight to the feed', async ({ page }) => {
    const supabase = await onboard(page)
    await page.getByRole('link', { name: 'You', exact: true }).click()
    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page).toHaveURL(/\/app\/welcome$/)
    await page.getByRole('link', { name: 'I already have an account' }).click()
    await page.getByLabel('Welcome back').fill('sam@example.com')
    await page.getByRole('button', { name: 'Send link' }).click()
    await openEmailedLink(page, supabase)
    await expect(page.getByRole('heading', { name: 'Hi, Sam' })).toBeVisible()
    expect(new URL(page.url()).hash).toBe('')
  })

  test('says so when a link has expired', async ({ page }) => {
    await fakeSupabase(page)
    await page.goto('/app/sign-in#error=access_denied&error_code=otp_expired')
    await expect(page.getByRole('alert')).toContainText('expired or was already used')
    await expectAccessible(page)
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
