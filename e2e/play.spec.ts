import { expect, test } from '@playwright/test'

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
