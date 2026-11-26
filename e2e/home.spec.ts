import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const HEADLINE = 'Meet your people at the events you’d go to anyway.'

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

/** Counts lit pixels on the hero canvas that read as yellow-green (Glow) and as violet (Dusk). */
function cloudTones(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return { glow: 0, dusk: 0 }
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
    let glow = 0
    let dusk = 0
    for (let i = 0; i < data.length; i += 4) {
      const [r = 0, g = 0, b = 0, a = 0] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
      if (a < 60) continue
      if (g > b + 60 && g >= r) glow++
      else if (b > g + 40 && b > r) dusk++
    }
    return { glow, dusk }
  })
}

/**
 * Pixels on the hero canvas inside a box (CSS pixels, relative to the canvas): how many are lit
 * at all, and how many are solid Glow, the mark's tail.
 */
function litIn(page: Page, box: { x: number; y: number; width: number; height: number }) {
  return page.evaluate((area) => {
    const canvas = document.querySelector('canvas')
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return { lit: 0, glow: 0 }
    const ratio = canvas.width / canvas.getBoundingClientRect().width
    const { data } = context.getImageData(
      Math.round(area.x * ratio),
      Math.round(area.y * ratio),
      Math.max(1, Math.round(area.width * ratio)),
      Math.max(1, Math.round(area.height * ratio)),
    )
    let lit = 0
    let glow = 0
    for (let i = 0; i < data.length; i += 4) {
      const [r = 0, g = 0, b = 0, a = 0] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
      if (a > 0) lit++
      if (a === 255 && r === 217 && g === 248 && b === 74) glow++
    }
    return { lit, glow }
  }, box)
}

/** Where the hero's mark tail sits, mirroring markLayout in src/lib/fireflies/mark.ts. */
async function markBox(page: Page) {
  const { width, height, top, bottom } = await page.evaluate(() => {
    const field = document.querySelector('canvas')?.getBoundingClientRect()
    const stage = document.querySelector('.hero__stage')?.getBoundingClientRect()
    return {
      width: field?.width ?? 0,
      height: field?.height ?? 0,
      top: (stage?.top ?? 0) - (field?.top ?? 0),
      bottom: (stage?.bottom ?? 0) - (field?.top ?? 0),
    }
  })
  const stacked = width < 900
  const fits = stacked
    ? Math.min(height * 0.3, width * 0.62)
    : Math.min(height * 0.46, width * 0.28)
  const mark = Math.min(fits, (bottom - top) * 0.78)
  const centerX = stacked
    ? width / 2
    : width - Math.min(32, Math.max(16, width * 0.024)) - (mark * 0.765) / 2
  const centerY = (top + bottom) / 2
  // The tail: a circle in the lower part of the mark.
  return {
    x: centerX - mark * 0.15,
    y: centerY + mark * 0.13,
    width: mark * 0.3,
    height: mark * 0.3,
  }
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
    await expect(feed.getByRole('listitem').first()).toContainText('Startup founders meetup')
    await page.getByRole('button', { name: 'Tech & startups' }).click()
    await page.getByRole('button', { name: 'Running' }).click()
    await expect(page.getByRole('button', { name: 'Running' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(feed.getByRole('listitem').first()).toContainText('Saturday 5K social run')
    await expect(feed.getByRole('listitem').first()).toContainText(
      'Because you like running and outdoors',
    )
  })

  test('paints the cloud in yellow-green and violet', async ({ page }) => {
    await page.goto('/')
    await expect.poll(async () => (await cloudTones(page)).glow).toBeGreaterThan(50)
    await expect.poll(async () => (await cloudTones(page)).dusk).toBeGreaterThan(50)
  })

  test('lets a pointer stir the cloud without getting in the way', async ({ page }) => {
    await page.goto('/')
    const hero = page.locator('.hero')
    const box = await hero.boundingBox()
    if (!box) throw new Error('hero missing')
    for (let i = 0; i < 8; i++) {
      await page.mouse.move(box.x + box.width * (0.3 + i * 0.05), box.y + box.height * 0.3)
    }
    await expect.poll(() => paintedPixels(page)).toBeGreaterThan(0)
    await expect(page.getByRole('heading', { level: 1, name: HEADLINE })).toBeInViewport()
  })

  test('gathers part of the cloud into the Firefly mark', async ({ page }) => {
    await page.goto('/')
    const tail = await markBox(page)
    // The tail of the mark fills in with solid Glow once the lights have gathered.
    await expect
      .poll(async () => (await litIn(page, tail)).glow, { timeout: 10_000 })
      .toBeGreaterThan(400)
  })

  test('heals after a fast pointer drag instead of leaving a pattern', async ({ page }) => {
    await page.goto('/')
    const hero = page.locator('.hero')
    const box = await hero.boundingBox()
    if (!box) throw new Error('hero missing')
    const band = { x: 0, y: box.height * 0.15, width: box.width, height: box.height * 0.2 }
    // Let the mark gather and the field settle first.
    await page.waitForTimeout(4500)
    const before = (await litIn(page, band)).lit
    // A fast zig-zag through the open band.
    for (let i = 0; i < 24; i++) {
      await page.mouse.move(
        box.x + box.width * (0.1 + (i % 6) * 0.15),
        box.y + box.height * (i % 2 === 0 ? 0.2 : 0.3),
        { steps: 3 },
      )
    }
    await page.mouse.move(box.x + 4, box.y + box.height - 4)
    // Every light springs home: the band fills back in to about where it was.
    await expect
      .poll(async () => (await litIn(page, band)).lit, { timeout: 6000 })
      .toBeGreaterThan(before * 0.85)
  })

  test('keeps sideways finger sweeps for the field, and still scrolls', async ({ page }) => {
    await page.goto('/')
    const touchAction = await page
      .locator('.hero')
      .evaluate((hero) => getComputedStyle(hero).touchAction)
    expect(touchAction).toContain('pan-y')
    expect(touchAction).toContain('pinch-zoom')
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

  test('shows the Firefly mark already gathered', async ({ page }) => {
    await page.goto('/')
    const tail = await markBox(page)
    await expect.poll(async () => (await litIn(page, tail)).glow).toBeGreaterThan(400)
  })
})
