import { test as base } from '@playwright/test'

// Extend base test with authenticated user fixture
export const test = base.extend({
  // This will be expanded when we implement authentication
  authenticatedPage: async ({ page }, use) => {
    // Mock authentication will go here
    await use(page)
  },
})

export { expect } from '@playwright/test'
