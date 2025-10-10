import { test as base, Page } from '@playwright/test'

// Define fixture types
type AuthFixtures = {
  authenticatedPage: Page
}

// Extend base test with authenticated user fixture
export const test = base.extend<AuthFixtures>({
  // This will be expanded when we implement authentication
  authenticatedPage: async ({ page }, use) => {
    // Mock authentication will go here
    await use(page)
  },
})

export { expect } from '@playwright/test'