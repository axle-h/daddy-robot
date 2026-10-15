import { expect, test, type Locator, type Page } from '@playwright/test'

test('level 1 can be won by tapping tiles, and the win is remembered', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Level 1: Walkies').click()
  for (let i = 0; i < 3; i++) await page.locator('.palette .tile').first().click()
  await expect(page.locator('.strip .tile')).toHaveCount(3)
  await page.getByLabel('Run').click()
  await expect(page.locator('.celebrate')).toBeVisible({ timeout: 10_000 })
  await expect(page.locator('.star.got')).toHaveCount(3)

  await page.locator('.celebrate').getByLabel('Home').click()
  await expect(page.getByLabel('Level 2: Round the bend')).toBeEnabled()
})

test('a kaput run can be reset, and the program is kept', async ({ page }) => {
  await page.goto('/?all')
  await page.getByLabel('Level 5: Mind the pond').click()
  await page.locator('.palette .tile[aria-label="FRWD"]').click()
  await page.getByLabel('Run').click()
  await expect(page.locator('.strip .tile.kaput')).toBeVisible({ timeout: 10_000 })
  await page.getByLabel('Reset').click({ force: true })
  await expect(page.locator('.strip .tile')).toHaveCount(1)
  await expect(page.locator('.strip .tile.kaput')).toHaveCount(0)
})

async function dragTo(page: Page, from: Locator, to: Locator, where: 'start' | 'centre' = 'centre') {
  const a = (await from.boundingBox())!
  const b = (await to.boundingBox())!
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  const x = where === 'start' ? b.x + 4 : b.x + b.width / 2
  await page.mouse.move(x, b.y + b.height / 2, { steps: 8 })
  await page.mouse.up()
}

test('tiles can be dragged into the program, moved around, and dropped in the bin', async ({ page }) => {
  await page.goto('/?all')
  await page.getByLabel('Level 2: Round the bend').click()
  const strip = page.locator('.strip .tile')
  await page.locator('.palette .tile[aria-label="FRWD"]').click()
  await page.locator('.palette .tile[aria-label="FRWD"]').click()
  await expect(strip).toHaveCount(2)

  await dragTo(page, page.locator('.palette .tile[aria-label="LEFT"]'), strip.first(), 'start')
  await expect(strip).toHaveText(['LEFT', 'FRWD', 'FRWD'].map((c) => new RegExp(c)))

  await dragTo(page, strip.first(), strip.last())
  await expect(strip).toHaveText(['FRWD', 'FRWD', 'LEFT'].map((c) => new RegExp(c)))

  await strip.first().click()
  await expect(strip).toHaveCount(3)
  await dragTo(page, strip.last(), page.getByLabel('Clear the program'))
  await expect(strip).toHaveText(['FRWD', 'FRWD'].map((c) => new RegExp(c)))
})
