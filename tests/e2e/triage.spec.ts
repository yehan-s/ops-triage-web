import { test, expect } from '@playwright/test'

test('triage analyzes /api/foo and shows routeMatch', async ({ page }) => {
  await page.goto('/triage')
  await page.getByPlaceholder('URL').fill('/api/foo')
  await page.getByRole('button', { name: /分.?析/ }).click()
  await expect(page.locator('pre')).toContainText('"pattern": "/api/foo"', { timeout: 10000 })
})
