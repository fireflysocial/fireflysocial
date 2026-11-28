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
 * The brightest pixel on the hero canvas inside a box (CSS pixels), from 0 to 1. Behind text the
 * cloud is cleared to 6% (textClearance in src/lib/fireflies/cloud.ts), and cloud squares are
 * drawn in eighths, so anything a wake or an answer lit there would read 0.125 or more.
 */
function brightestIn(page: Page, box: { x: number; y: number; width: number; height: number }) {
  return page.evaluate((area) => {
    const canvas = document.querySelector('canvas')
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return 0
    const ratio = canvas.width / canvas.getBoundingClientRect().width
    const { data } = context.getImageData(
      Math.round(area.x * ratio),
      Math.round(area.y * ratio),
      Math.max(1, Math.round(area.width * ratio)),
      Math.max(1, Math.round(area.height * ratio)),
    )
    let brightest = 0
    for (let i = 3; i < data.length; i += 4) brightest = Math.max(brightest, data[i] ?? 0)
    return brightest / 255
  }, box)
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Pixel counts per cell over a box on the hero canvas (CSS pixels), in a 16 x 8 grid, counting
 * only the meadow's grass: muted grey pixels, not the yellow fireflies, their halos or the mark.
 * The fireflies breathe all the time, so a picture of them is mostly their glow changing; the
 * grass moves only slowly in the wind, so a hand bending it stands out, and so does it healing.
 */
function grassCells(page: Page, box: Box) {
  return page.evaluate((area) => {
    const cols = 16
    const rows = 8
    const counts = new Array<number>(cols * rows).fill(0)
    const canvas = document.querySelector('canvas')
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return counts
    const ratio = canvas.width / canvas.getBoundingClientRect().width
    const width = Math.max(1, Math.round(area.width * ratio))
    const height = Math.max(1, Math.round(area.height * ratio))
    const { data } = context.getImageData(
      Math.round(area.x * ratio),
      Math.round(area.y * ratio),
      width,
      height,
    )
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4
        const [red = 0, green = 0, blue = 0, alpha = 0] = [
          data[i],
          data[i + 1],
          data[i + 2],
          data[i + 3],
        ]
        // Grass is Muted (#9A9A92): grey, never yellow, never as light as Ember.
        const grey = Math.abs(red - green) <= 14 && Math.abs(red - blue) <= 24 && red < 200
        // The middle and front layers only: the faint back layer and the anti-aliased edges of
        // hairline blades flicker in and out of any threshold as they sway by sub-pixels.
        if (alpha < 55 || !grey) continue
        const cell = Math.floor((x / width) * cols) + cols * Math.floor((y / height) * rows)
        counts[cell] = (counts[cell] ?? 0) + 1
      }
    }
    return counts
  }, box)
}

/** How much the meadow's picture changed between two moments: 0 for none, about 1 for all of it. */
function cloudChange(before: number[], after: number[]) {
  let moved = 0
  let total = 0
  before.forEach((count, cell) => {
    moved += Math.abs(count - (after[cell] ?? 0))
    total += count
  })
  return moved / Math.max(1, total)
}

/** The Firefly logo beside the wordmark: the real mark, there from the start, fully opaque. */
async function expectLogo(page: Page) {
  const mark = page.locator('.wordmark__mark svg')
  await expect(mark).toBeVisible()
  expect(await mark.evaluate((svg) => getComputedStyle(svg).opacity)).toBe('1')
  await expect(mark.locator('circle')).toHaveAttribute('fill', '#D9F84A')
}

/**
 * Waits until the band is settled: two pictures of it half a second apart barely differ, so the
 * first frames' movement doesn't count as the meadow's own drift.
 */
async function expectSettled(page: Page, band: Box) {
  await expect
    .poll(
      async () => {
        const before = await grassCells(page, band)
        await page.waitForTimeout(500)
        return cloudChange(before, await grassCells(page, band))
      },
      { timeout: 20_000 },
    )
    .toBeLessThan(0.15)
}

test.describe('landing page', () => {
  test('leads with the promise and the Get started action', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: HEADLINE })).toBeVisible()
    await expect(page.getByRole('banner').getByRole('link', { name: 'Get started' })).toBeVisible()
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

  test('fills the meadow with yellow fireflies only', async ({ page }) => {
    await page.goto('/')
    await expect.poll(async () => (await cloudTones(page)).glow).toBeGreaterThan(50)
    expect((await cloudTones(page)).dusk).toBe(0)
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

  test('shows the Firefly logo beside the wordmark', async ({ page }) => {
    await page.goto('/')
    await expectLogo(page)
  })

  test('parts the cloud under a fast pointer drag, then heals', async ({ page }) => {
    await page.goto('/')
    // The meadow's lower half: the grass, and the fireflies hanging over it.
    const box = await page.locator('.hero__meadow').boundingBox()
    if (!box) throw new Error('meadow missing')
    const band = {
      x: box.x,
      y: box.y + box.height * 0.45,
      width: box.width,
      height: box.height * 0.5,
    }
    /**
     * A fast zig-zag at the given heights (page pixels): the same eight moves every time. One
     * event per move: the field sweeps the whole path between frames, so in-between steps add
     * nothing, and on a slow runner (CI's WebKit draws this page at about 8fps, and each input
     * step waits for a frame) they would turn a flick into a slow drag that heals as it goes.
     */
    const zigzag = async (heightAt: (i: number) => number) => {
      for (let i = 0; i < 8; i++) {
        await page.mouse.move(box.x + box.width * (i % 2 === 0 ? 0.05 : 0.95), heightAt(i))
      }
    }
    /**
     * Runs a gesture that ends off the hero (on the header), then samples the band for 2s and
     * returns the largest change from just before it. Lights take a moment to travel after a
     * flick, so the change peaks after the gesture, not at its end; sampling the peak keeps the
     * measure the same on a fast machine and a slow runner.
     */
    const peakChange = async (gesture: () => Promise<void>) => {
      const start = await grassCells(page, band)
      await gesture()
      await page.mouse.move(box.x + box.width / 2, 10)
      let peak = 0
      for (let sample = 0; sample < 14; sample++) {
        peak = Math.max(peak, cloudChange(start, await grassCells(page, band)))
        await page.waitForTimeout(150)
      }
      return { start, peak }
    }
    // Start from a settled field.
    await expectSettled(page, band)

    // The control is the same gesture over the header, which doesn't reach the field: how much
    // the band changes on its own (drift, twinkle) over the same time, on this machine.
    const drift = await peakChange(() => zigzag(() => 10))
    // The same gesture through the band.
    const stir = await peakChange(() => zigzag((i) => box.y + box.height * (0.55 + (i % 4) * 0.1)))
    // Measured 2026-11-25 with one worker: stirred peaks of 0.42 to 0.50, against drift peaks of
    // 0.09 to 0.13 (3.7x to 4.8x). A stir that did nothing would come out near 1x.
    expect(stir.peak).toBeGreaterThan(Math.max(0.2, 2 * drift.peak))

    // Every light springs home, so the band heals to well under its peak change, drift included
    // (measured: down to 23% to 40% of it). A cloud that kept the pattern, the bug this guards, stays at its peak or beyond.
    await expect
      .poll(async () => cloudChange(stir.start, await grassCells(page, band)) / stir.peak, {
        // The spring heals in about 2s of animation time, which runs slower than the wall clock
        // on a slow runner (each frame advances at most 1/20s).
        timeout: 15_000,
      })
      .toBeLessThan(0.6)
  })

  test('keeps the ground behind the headline dark while a pointer sweeps the meadow', async ({
    page,
  }) => {
    await page.goto('/')
    const meadow = await page.locator('.hero__meadow').boundingBox()
    const title = await page.locator('.hero__title').boundingBox()
    if (!meadow || !title) throw new Error('hero missing')
    for (let i = 0; i < 12; i++) {
      await page.mouse.move(
        meadow.x + (i % 2 === 0 ? 0.05 : 0.95) * meadow.width,
        meadow.y + meadow.height * (0.4 + (i % 3) * 0.2),
        { steps: 6 },
      )
      expect(await brightestIn(page, title)).toBeLessThan(0.07)
    }
  })

  test('lets a sideways finger sweep stir the cloud, and a vertical one scroll', async ({
    page,
    browserName,
    isMobile,
  }) => {
    // Synthetic touch drags go through Chromium's own input pipeline (CDP), so touch-action and
    // native scrolling apply as on a phone. WebKit has no equivalent; the CSS check covers it.
    await page.goto('/')
    const touchAction = await page
      .locator('.hero__meadow')
      .evaluate((meadow) => getComputedStyle(meadow).touchAction)
    expect(touchAction).toContain('pan-y')
    expect(touchAction).toContain('pinch-zoom')
    test.skip(browserName !== 'chromium' || !isMobile, 'touch drags need a Chromium phone')

    // The meadow's lower half: the grass, and the fireflies hanging over it.
    const box = await page.locator('.hero__meadow').boundingBox()
    if (!box) throw new Error('meadow missing')
    const band = {
      x: box.x,
      y: box.y + box.height * 0.45,
      width: box.width,
      height: box.height * 0.5,
    }
    const cdp = await page.context().newCDPSession(page)
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x = 0, y = 0) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
      })
    /** A sideways finger sweep at height y (page pixels): the same touches every time. */
    const sweep = async (y: number) => {
      await touch('touchStart', 20, y)
      for (let i = 1; i <= 15; i++) {
        await touch('touchMove', 20 + i * 22, y)
        await page.waitForTimeout(16)
      }
    }
    await expectSettled(page, band)

    // The control: the same sweep over the header, which doesn't reach the field.
    const calm = await grassCells(page, band)
    await sweep(10)
    const drift = cloudChange(calm, await grassCells(page, band))
    await touch('touchEnd')

    // A sideways sweep across the band stirs it, and doesn't scroll the page.
    const before = await grassCells(page, band)
    // Low in the meadow, through the upper part of most blades, where a hand bends them.
    await sweep(box.y + box.height * 0.8)
    const swept = cloudChange(before, await grassCells(page, band))
    await touch('touchEnd')
    expect(swept).toBeGreaterThan(Math.max(0.2, 3 * drift))
    expect(await page.evaluate(() => window.scrollY)).toBe(0)

    // A vertical drag starting on the hero still scrolls the page.
    await touch('touchStart', box.width / 2, box.height * 0.8)
    for (let i = 1; i <= 15; i++) {
      await touch('touchMove', box.width / 2, box.height * 0.8 - i * 25)
      await page.waitForTimeout(16)
    }
    await touch('touchEnd')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)
  })

  test('answers a tap on the dark without getting in the way', async ({ page }) => {
    await page.goto('/')
    const before = await page.evaluate(() => window.scrollY)
    await page.locator('.hero__meadow').click({ position: { x: 120, y: 120 } })
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

  test('takes the visitor from the header straight to sign-up, and back', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('banner').getByRole('link', { name: 'Get started' }).click()
    await expect(page).toHaveURL(/\/app\/sign-in$/)
    await expect(page.getByRole('heading', { name: 'What’s your email?' })).toBeVisible()
    await page.getByRole('link', { name: 'Back' }).click()
    await expect(page.getByRole('heading', { level: 1, name: HEADLINE })).toBeVisible()
  })

  test('ends on Get started and Log in', async ({ page }) => {
    await page.goto('/')
    const start = page.locator('#start')
    await start.scrollIntoViewIfNeeded()
    await expect(start.getByRole('link', { name: 'Get started' })).toBeVisible()
    await start.getByRole('link', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/app\/sign-in\?mode=login$/)
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })
})

test.describe('landing page with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('shows the end of the story as a still frame', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.story__week')).toHaveAttribute('data-shown', 'true')
    await expect.poll(() => paintedPixels(page)).toBeGreaterThan(0)
  })

  test('shows the Firefly logo', async ({ page }) => {
    await page.goto('/')
    await expectLogo(page)
  })
})
