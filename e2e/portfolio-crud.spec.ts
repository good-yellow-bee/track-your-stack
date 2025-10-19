import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Portfolio CRUD E2E Tests
 *
 * Tests the complete portfolio lifecycle including:
 * - Creating portfolios with success toasts
 * - Viewing portfolio list
 * - Editing portfolios with success toasts
 * - Deleting portfolios with confirmation dialog and success toasts
 * - Error handling with appropriate error toasts
 */

// Skip all tests in this file if auth file doesn't exist
const authFilePath = path.join(__dirname, 'fixtures', '.auth', 'user.json')
const hasAuth = fs.existsSync(authFilePath)

test.describe('Portfolio CRUD Operations', () => {
  test.skip(!hasAuth, 'Skipping: Authentication not configured')

  // Note: These tests require authentication
  // In a real scenario, you would set up auth state before tests
  if (hasAuth) {
    test.use({
      storageState: 'e2e/fixtures/.auth/user.json',
    })
  }

  test.beforeEach(async ({ page }) => {
    // Navigate to portfolios page before each test
    await page.goto('/portfolios')
  })

  test('should display empty state when no portfolios exist', async ({ page }) => {
    // Wait for page load
    await expect(page.getByRole('heading', { name: /portfolios/i })).toBeVisible()

    // Check for empty state message or "New Portfolio" button
    const newPortfolioButton = page.getByRole('button', { name: /new portfolio/i })
    await expect(newPortfolioButton).toBeVisible()
  })

  test('should create new portfolio with success toast', async ({ page }) => {
    // Click "New Portfolio" button
    await page.getByRole('button', { name: /new portfolio/i }).click()

    // Fill in portfolio form
    await page.getByLabel(/portfolio name/i).fill('Test Portfolio')
    await page.getByLabel(/base currency/i).click()
    await page.getByRole('option', { name: /USD.*United States Dollar/i }).click()

    // Submit form
    await page.getByRole('button', { name: /create portfolio/i }).click()

    // Wait for success toast
    await expect(page.getByRole('status')).toContainText(/portfolio created/i)

    // Verify redirect to portfolios list
    await expect(page).toHaveURL('/portfolios')

    // Verify portfolio appears in list
    await expect(page.getByText('Test Portfolio')).toBeVisible()
  })

  test('should edit existing portfolio with success toast', async ({ page }) => {
    // Assuming a portfolio exists, click on it
    const portfolio = page.getByText('Test Portfolio').first()
    await portfolio.click()

    // Navigate to edit page
    await page.getByRole('button', { name: /edit/i }).click()

    // Update portfolio name
    await page.getByLabel(/portfolio name/i).clear()
    await page.getByLabel(/portfolio name/i).fill('Updated Test Portfolio')

    // Submit form
    await page.getByRole('button', { name: /update portfolio/i }).click()

    // Wait for success toast
    await expect(page.getByRole('status')).toContainText(/portfolio updated/i)

    // Verify updated name appears
    await expect(page.getByText('Updated Test Portfolio')).toBeVisible()
  })

  test('should delete portfolio with confirmation dialog and success toast', async ({ page }) => {
    // Navigate to a portfolio detail page
    const portfolio = page.getByText('Updated Test Portfolio').first()
    await portfolio.click()

    // Click delete button
    await page.getByRole('button', { name: /delete portfolio/i }).click()

    // Verify confirmation dialog appears
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await expect(page.getByText(/are you absolutely sure/i)).toBeVisible()

    // Confirm deletion
    await page
      .getByRole('button', { name: /delete portfolio/i, exact: false })
      .last()
      .click()

    // Wait for success toast
    await expect(page.getByRole('status')).toContainText(/portfolio deleted/i)

    // Verify redirect to portfolios list
    await expect(page).toHaveURL('/portfolios')

    // Verify portfolio no longer appears
    await expect(page.getByText('Updated Test Portfolio')).not.toBeVisible()
  })

  test('should show error toast when creating portfolio with invalid data', async ({ page }) => {
    // Click "New Portfolio" button
    await page.getByRole('button', { name: /new portfolio/i }).click()

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /create portfolio/i }).click()

    // Verify validation error appears (either inline or toast)
    // This will depend on form validation implementation
    await expect(
      page.getByText(/portfolio name is required/i).or(page.getByRole('status'))
    ).toBeVisible()
  })

  test('should cancel portfolio deletion when clicking cancel in dialog', async ({ page }) => {
    // Navigate to a portfolio detail page
    const portfolio = page.getByText('Test Portfolio').first()
    await portfolio.click()

    // Click delete button
    await page.getByRole('button', { name: /delete portfolio/i }).click()

    // Verify confirmation dialog appears
    await expect(page.getByRole('alertdialog')).toBeVisible()

    // Click cancel button
    await page.getByRole('button', { name: /cancel/i }).click()

    // Verify dialog closes
    await expect(page.getByRole('alertdialog')).not.toBeVisible()

    // Verify still on portfolio detail page
    await expect(page).toHaveURL(/\/portfolios\/[a-z0-9]+/)

    // Verify portfolio name still visible
    await expect(page.getByText('Test Portfolio')).toBeVisible()
  })

  test('should display multiple portfolios in grid layout', async ({ page }) => {
    // Create multiple portfolios first
    const portfolioNames = ['Portfolio A', 'Portfolio B', 'Portfolio C']

    for (const name of portfolioNames) {
      await page.goto('/portfolios/new')
      await page.getByLabel(/portfolio name/i).fill(name)
      await page.getByLabel(/base currency/i).click()
      await page.getByRole('option', { name: /USD/i }).click()
      await page.getByRole('button', { name: /create portfolio/i }).click()
      await expect(page.getByRole('status')).toContainText(/portfolio created/i)
    }

    // Navigate to list
    await page.goto('/portfolios')

    // Verify all portfolios are visible
    for (const name of portfolioNames) {
      await expect(page.getByText(name)).toBeVisible()
    }
  })

  test('should navigate to portfolio detail page when clicking portfolio card', async ({
    page,
  }) => {
    // Click on a portfolio card
    const portfolio = page.getByText('Test Portfolio').first()
    await portfolio.click()

    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/portfolios\/[a-z0-9]+/)

    // Verify portfolio details are visible
    await expect(page.getByRole('heading', { name: /Test Portfolio/i })).toBeVisible()
  })

  test('should show loading state while submitting portfolio form', async ({ page }) => {
    // Navigate to create page
    await page.goto('/portfolios/new')

    // Fill in form
    await page.getByLabel(/portfolio name/i).fill('Loading Test Portfolio')
    await page.getByLabel(/base currency/i).click()
    await page.getByRole('option', { name: /USD/i }).click()

    // Submit form
    const submitButton = page.getByRole('button', { name: /create portfolio/i })
    await submitButton.click()

    // Verify loading state (button disabled or showing spinner)
    await expect(submitButton).toBeDisabled()
  })
})

test.describe('Portfolio Authorization', () => {
  test('should not allow unauthorized access to portfolio pages', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies()

    // Try to access portfolios page
    await page.goto('/portfolios')

    // Should redirect to sign-in page
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('should not allow access to other users portfolios', async ({ page }) => {
    // This test would require setting up multiple user accounts
    // and verifying that user A cannot access user B's portfolios
    // For now, this is a placeholder for future implementation
    test.skip()
  })
})
