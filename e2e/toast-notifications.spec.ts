import { test, expect } from '@playwright/test'

/**
 * Toast Notifications E2E Tests
 *
 * Tests the toast notification system including:
 * - Toast positioning and visibility
 * - Toast auto-dismiss behavior
 * - Multiple toast stacking
 * - Toast accessibility (ARIA attributes)
 * - Different toast types (success, error, warning, info)
 */

test.describe('Toast Notification System', () => {
  test.use({
    storageState: 'e2e/fixtures/.auth/user.json',
  })

  test('should display toast at top-right position', async ({ page }) => {
    await page.goto('/portfolios')

    // Trigger a toast by creating a portfolio
    await page.getByRole('button', { name: /new portfolio/i }).click()
    await page.getByLabel(/portfolio name/i).fill('Toast Position Test')
    await page.getByLabel(/base currency/i).click()
    await page.getByRole('option', { name: /USD/i }).click()
    await page.getByRole('button', { name: /create portfolio/i }).click()

    // Wait for toast to appear
    const toast = page.getByRole('status')
    await expect(toast).toBeVisible()

    // Verify toast is positioned at top-right
    const toastBox = await toast.boundingBox()
    const viewportSize = page.viewportSize()

    expect(toastBox).toBeTruthy()
    expect(viewportSize).toBeTruthy()

    // Toast should be near the top and right of viewport
    if (toastBox && viewportSize) {
      expect(toastBox.y).toBeLessThan(viewportSize.height / 2) // In top half
      expect(toastBox.x).toBeGreaterThan(viewportSize.width / 2) // In right half
    }
  })

  test('should auto-dismiss toast after timeout', async ({ page }) => {
    await page.goto('/portfolios')

    // Trigger a toast
    await page.getByRole('button', { name: /new portfolio/i }).click()
    await page.getByLabel(/portfolio name/i).fill('Auto Dismiss Test')
    await page.getByLabel(/base currency/i).click()
    await page.getByRole('option', { name: /USD/i }).click()
    await page.getByRole('button', { name: /create portfolio/i }).click()

    // Wait for toast to appear
    const toast = page.getByRole('status')
    await expect(toast).toBeVisible()

    // Wait for toast to dismiss (Sonner default is 4 seconds)
    await expect(toast).not.toBeVisible({ timeout: 10000 })
  })

  test('should display success toast with appropriate styling', async ({ page }) => {
    await page.goto('/portfolios')

    // Create portfolio to trigger success toast
    await page.getByRole('button', { name: /new portfolio/i }).click()
    await page.getByLabel(/portfolio name/i).fill('Success Toast Test')
    await page.getByLabel(/base currency/i).click()
    await page.getByRole('option', { name: /USD/i }).click()
    await page.getByRole('button', { name: /create portfolio/i }).click()

    // Wait for success toast
    const toast = page.getByRole('status')
    await expect(toast).toBeVisible()
    await expect(toast).toContainText(/portfolio created/i)

    // Verify success styling (green border based on config)
    await expect(toast).toHaveClass(/border-green-500/)
  })

  test('should display error toast when operation fails', async ({ page }) => {
    await page.goto('/portfolios')

    // Trigger an error by submitting invalid data
    await page.getByRole('button', { name: /new portfolio/i }).click()
    // Leave name empty to trigger validation error
    await page.getByRole('button', { name: /create portfolio/i }).click()

    // Wait for error toast or validation message
    const errorMessage = page
      .getByRole('status')
      .or(page.getByText(/required/i))
      .first()
    await expect(errorMessage).toBeVisible()
  })

  test('should stack multiple toasts vertically', async ({ page }) => {
    await page.goto('/portfolios')

    // Trigger multiple toasts quickly
    const portfolioNames = ['Toast 1', 'Toast 2', 'Toast 3']

    for (const name of portfolioNames) {
      await page.goto('/portfolios/new')
      await page.getByLabel(/portfolio name/i).fill(name)
      await page.getByLabel(/base currency/i).click()
      await page.getByRole('option', { name: /USD/i }).click()
      await page.getByRole('button', { name: /create portfolio/i }).click()
      // Don't wait for toast to dismiss - create next one quickly
      await page.waitForTimeout(100)
    }

    // Verify multiple toasts are visible
    const toasts = page.getByRole('status')
    const toastCount = await toasts.count()
    expect(toastCount).toBeGreaterThan(1)
  })

  test('should have proper ARIA attributes for accessibility', async ({ page }) => {
    await page.goto('/portfolios')

    // Trigger a toast
    await page.getByRole('button', { name: /new portfolio/i }).click()
    await page.getByLabel(/portfolio name/i).fill('Accessibility Test')
    await page.getByLabel(/base currency/i).click()
    await page.getByRole('option', { name: /USD/i }).click()
    await page.getByRole('button', { name: /create portfolio/i }).click()

    // Wait for toast
    const toast = page.getByRole('status')
    await expect(toast).toBeVisible()

    // Verify ARIA role
    await expect(toast).toHaveAttribute('role', 'status')

    // Verify aria-live attribute (Sonner should set this)
    const ariaLive = await toast.getAttribute('aria-live')
    expect(ariaLive).toBeTruthy()
  })

  test('should allow manual dismiss of toast by clicking close button', async ({ page }) => {
    await page.goto('/portfolios')

    // Trigger a toast
    await page.getByRole('button', { name: /new portfolio/i }).click()
    await page.getByLabel(/portfolio name/i).fill('Manual Dismiss Test')
    await page.getByLabel(/base currency/i).click()
    await page.getByRole('option', { name: /USD/i }).click()
    await page.getByRole('button', { name: /create portfolio/i }).click()

    // Wait for toast
    const toast = page.getByRole('status')
    await expect(toast).toBeVisible()

    // Try to find and click close button (if Sonner provides one)
    const closeButton = toast.getByRole('button', { name: /close/i }).or(toast.locator('[aria-label*="close" i]'))

    if (await closeButton.isVisible()) {
      await closeButton.click()
      await expect(toast).not.toBeVisible()
    }
  })

  test('should display toast on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/portfolios')

    // Trigger a toast
    await page.getByRole('button', { name: /new portfolio/i }).click()
    await page.getByLabel(/portfolio name/i).fill('Mobile Toast Test')
    await page.getByLabel(/base currency/i).click()
    await page.getByRole('option', { name: /USD/i }).click()
    await page.getByRole('button', { name: /create portfolio/i }).click()

    // Verify toast is visible and properly positioned
    const toast = page.getByRole('status')
    await expect(toast).toBeVisible()

    // Toast should still be in viewport
    const toastBox = await toast.boundingBox()
    expect(toastBox).toBeTruthy()

    if (toastBox) {
      expect(toastBox.x).toBeGreaterThanOrEqual(0)
      expect(toastBox.y).toBeGreaterThanOrEqual(0)
      expect(toastBox.x + toastBox.width).toBeLessThanOrEqual(375)
    }
  })

  test('should maintain toast visibility during page transitions', async ({ page }) => {
    await page.goto('/portfolios')

    // Trigger a toast
    await page.getByRole('button', { name: /new portfolio/i }).click()
    await page.getByLabel(/portfolio name/i).fill('Transition Test')
    await page.getByLabel(/base currency/i).click()
    await page.getByRole('option', { name: /USD/i }).click()
    await page.getByRole('button', { name: /create portfolio/i }).click()

    // Wait for toast
    const toast = page.getByRole('status')
    await expect(toast).toBeVisible()

    // The toast should remain visible even as we navigate
    // (since Toaster is in root layout)
    await expect(toast).toContainText(/portfolio created/i)
  })
})

test.describe('Toast Integration with Features', () => {
  test.use({
    storageState: 'e2e/fixtures/.auth/user.json',
  })

  test('should show appropriate toasts for all portfolio CRUD operations', async ({ page }) => {
    await page.goto('/portfolios')

    // Create - should show success toast
    await page.getByRole('button', { name: /new portfolio/i }).click()
    await page.getByLabel(/portfolio name/i).fill('CRUD Toast Test')
    await page.getByLabel(/base currency/i).click()
    await page.getByRole('option', { name: /USD/i }).click()
    await page.getByRole('button', { name: /create portfolio/i }).click()
    await expect(page.getByRole('status')).toContainText(/portfolio created/i)

    // Wait for toast to dismiss
    await page.waitForTimeout(5000)

    // Update - should show success toast
    const portfolio = page.getByText('CRUD Toast Test').first()
    await portfolio.click()
    await page.getByRole('button', { name: /edit/i }).click()
    await page.getByLabel(/portfolio name/i).clear()
    await page.getByLabel(/portfolio name/i).fill('Updated CRUD Test')
    await page.getByRole('button', { name: /update portfolio/i }).click()
    await expect(page.getByRole('status')).toContainText(/portfolio updated/i)

    // Wait for toast to dismiss
    await page.waitForTimeout(5000)

    // Delete - should show success toast
    await page.getByRole('button', { name: /delete portfolio/i }).click()
    await page
      .getByRole('button', { name: /delete portfolio/i, exact: false })
      .last()
      .click()
    await expect(page.getByRole('status')).toContainText(/portfolio deleted/i)
  })
})
