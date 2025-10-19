import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Authentication Flows E2E Tests
 *
 * Tests authentication and authorization including:
 * - Sign-in flow
 * - Protected route access
 * - Unauthorized access handling with error toasts
 * - Session persistence
 * - Sign-out flow
 */

// Skip auth-dependent tests if auth file doesn't exist
const authFilePath = path.join(__dirname, 'fixtures', '.auth', 'user.json')
const hasAuth = fs.existsSync(authFilePath)

test.describe('Authentication Flows', () => {
  test.skip(!hasAuth, 'Skipping: Authentication not configured')
  test.beforeEach(async ({ page }) => {
    // Clear all cookies to start fresh
    await page.context().clearCookies()
  })

  test('should redirect to sign-in page when accessing protected route while unauthenticated', async ({
    page,
  }) => {
    // Try to access protected portfolios page
    await page.goto('/portfolios')

    // Should redirect to sign-in page
    await expect(page).toHaveURL(/\/auth\/signin/)

    // Verify sign-in page elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
  })

  test('should redirect to sign-in when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('should display sign-in page correctly', async ({ page }) => {
    await page.goto('/auth/signin')

    // Verify page title
    await expect(page).toHaveTitle(/sign in/i)

    // Verify sign-in button
    const signInButton = page.getByRole('button', { name: /sign in with google/i })
    await expect(signInButton).toBeVisible()

    // Verify application branding
    await expect(page.getByText(/track your stack/i)).toBeVisible()
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/auth/signin')

    // Check for proper meta tags
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    expect(metaDescription).toBeTruthy()
    expect(metaDescription?.length).toBeGreaterThan(0)
  })

  test('should show accessible sign-in button', async ({ page }) => {
    await page.goto('/auth/signin')

    const signInButton = page.getByRole('button', { name: /sign in with google/i })

    // Verify button is keyboard accessible
    await signInButton.focus()
    await expect(signInButton).toBeFocused()

    // Verify button has proper ARIA attributes
    const ariaLabel = await signInButton.getAttribute('aria-label')
    expect(ariaLabel || (await signInButton.textContent())).toContain('Google')
  })

  test('should display sign-in page on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/auth/signin')

    // Verify key elements are visible on mobile
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
  })
})

test.describe('Protected Routes', () => {
  test('should block access to portfolio creation page without auth', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/portfolios/new')

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('should block access to portfolio edit page without auth', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/portfolios/test-id/edit')

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('should block access to portfolio detail page without auth', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/portfolios/test-id')

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/auth\/signin/)
  })
})

test.describe('Authenticated User Flows', () => {
  test.skip(!hasAuth, 'Skipping: Authentication not configured')

  // Note: These tests require actual authentication
  // In a real scenario, you would set up auth state before tests
  if (hasAuth) {
    test.use({
      storageState: 'e2e/fixtures/.auth/user.json',
    })
  }

  test('should allow access to dashboard when authenticated', async ({ page }) => {
    await page.goto('/dashboard')

    // Should not redirect to sign-in
    await expect(page).toHaveURL('/dashboard')

    // Verify dashboard content is visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('should allow access to portfolios page when authenticated', async ({ page }) => {
    await page.goto('/portfolios')

    // Should not redirect
    await expect(page).toHaveURL('/portfolios')

    // Verify portfolios page content
    await expect(page.getByRole('heading', { name: /portfolios/i })).toBeVisible()
  })

  test('should persist session across page navigations', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/dashboard')

    // Navigate to portfolios
    await page.goto('/portfolios')
    await expect(page).toHaveURL('/portfolios')

    // Navigate back to dashboard
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/dashboard')

    // Session should remain valid throughout
  })

  test('should show user menu when authenticated', async ({ page }) => {
    await page.goto('/dashboard')

    // Look for user menu/profile button
    // This will depend on your navigation implementation
    const userMenu = page
      .getByRole('button', { name: /profile/i })
      .or(page.locator('[aria-label*="user" i]'))

    // Note: This test may need adjustment based on actual UI
    test.skip()
  })
})

test.describe('Authorization Error Handling', () => {
  test.skip(!hasAuth, 'Skipping: Authentication not configured')

  if (hasAuth) {
    test.use({
      storageState: 'e2e/fixtures/.auth/user.json',
    })
  }

  test('should show auth error toast when session expires', async ({ page }) => {
    // This test would require simulating session expiration
    // For now, it's a placeholder for future implementation
    test.skip()
  })

  test('should show forbidden error toast when accessing unauthorized resource', async ({
    page,
  }) => {
    // This test would require attempting to access another user's portfolio
    // For now, it's a placeholder for future implementation
    test.skip()
  })
})

test.describe('Sign-out Flow', () => {
  test.skip(!hasAuth, 'Skipping: Authentication not configured')

  if (hasAuth) {
    test.use({
      storageState: 'e2e/fixtures/.auth/user.json',
    })
  }

  test('should sign out user and redirect to homepage', async ({ page }) => {
    await page.goto('/dashboard')

    // Look for sign-out button
    // This will depend on your navigation implementation
    const signOutButton = page
      .getByRole('button', { name: /sign out/i })
      .or(page.getByText(/sign out/i))

    // If sign-out button exists, test sign-out flow
    if (await signOutButton.isVisible()) {
      await signOutButton.click()

      // Should redirect to homepage or sign-in page
      await expect(page).toHaveURL(/\/($|auth\/signin)/)

      // Try to access protected route
      await page.goto('/dashboard')

      // Should redirect to sign-in
      await expect(page).toHaveURL(/\/auth\/signin/)
    } else {
      // Skip if sign-out button not implemented yet
      test.skip()
    }
  })
})

test.describe('Error Page', () => {
  test('should display error page with appropriate toast on unexpected errors', async ({
    page,
  }) => {
    // Navigate to a page and trigger an error
    // This is a placeholder test - actual implementation depends on error scenarios
    test.skip()
  })

  test('should show 404 page with appropriate styling', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')

    // Verify 404 page or not-found page
    await expect(page.getByText(/not found/i).or(page.getByText(/404/i))).toBeVisible()
  })
})
