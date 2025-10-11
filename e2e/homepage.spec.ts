import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Verify page loads
    await expect(page).toHaveTitle(/Track Your Stack/)

    // Verify main heading
    await expect(page.getByRole('heading', { name: /Track Your Stack/i })).toBeVisible()

    // Verify main content is visible
    await expect(page.locator('main')).toBeVisible()
  })

  test('should display sign-in button when not authenticated', async ({ page }) => {
    await page.goto('/')

    // Verify sign-in button is visible
    const signInButton = page.getByRole('link', { name: /sign in with google/i })
    await expect(signInButton).toBeVisible()

    // Verify it links to the correct page
    await expect(signInButton).toHaveAttribute('href', '/auth/signin')
  })

  test('should display feature highlights', async ({ page }) => {
    await page.goto('/')

    // Verify all four feature cards are visible
    await expect(page.getByRole('heading', { name: /multiple portfolios/i })).toBeVisible()
    await expect(page.getByText(/track different investment strategies/i)).toBeVisible()

    await expect(page.getByRole('heading', { name: /real-time prices/i })).toBeVisible()
    await expect(page.getByText(/live market data via alpha vantage/i)).toBeVisible()

    await expect(page.getByRole('heading', { name: /multi-currency/i })).toBeVisible()
    await expect(page.getByText(/support for global investments/i)).toBeVisible()

    await expect(page.getByRole('heading', { name: /gains & losses/i })).toBeVisible()
    await expect(page.getByText(/track your portfolio performance/i)).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')

    // Verify page is accessible on mobile
    await expect(page.locator('body')).toBeVisible()

    // Verify main heading is visible on mobile
    await expect(page.getByRole('heading', { name: /Track Your Stack/i })).toBeVisible()

    // Verify sign-in button is visible on mobile
    await expect(page.getByRole('link', { name: /sign in with google/i })).toBeVisible()

    // Verify at least one feature card is visible
    await expect(page.getByRole('heading', { name: /multiple portfolios/i })).toBeVisible()
  })

  test('should have proper page structure and semantics', async ({ page }) => {
    await page.goto('/')

    // Check for proper semantic HTML
    await expect(page.locator('main')).toBeVisible()

    // Verify heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toHaveCount(1)
    await expect(h1).toHaveText(/Track Your Stack/)

    // Verify multiple h3 headings for features
    const h3s = page.getByRole('heading', { level: 3 })
    await expect(h3s).toHaveCount(4)
  })
})
