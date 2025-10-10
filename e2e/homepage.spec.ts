import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Verify page loads
    await expect(page).toHaveTitle(/Track Your Stack/)

    // Verify main content is visible
    await expect(page.locator('main')).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // This will be updated when we add actual navigation
    // For now, verify basic page structure
    expect(await page.locator('body').isVisible()).toBe(true)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // Verify page is accessible on mobile
    await expect(page.locator('body')).toBeVisible()
  })
})
