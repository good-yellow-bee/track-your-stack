# E2E Testing Guide

This guide covers end-to-end testing using Playwright.

## Running E2E Tests

```bash
# Run E2E tests (headless)
pnpm test:e2e

# Run E2E tests in UI mode (interactive)
pnpm test:e2e:ui

# Run E2E tests in debug mode
pnpm test:e2e:debug

# View test report after run
pnpm test:e2e:report
```

## Test Structure

E2E tests are organized in `e2e/` directory:

```
e2e/
├── homepage.spec.ts     # Homepage tests
├── auth.spec.ts         # Authentication flows (to be added)
├── portfolio.spec.ts    # Portfolio management (to be added)
└── fixtures/
    └── auth.ts          # Test fixtures and helpers
```

## Writing E2E Tests

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should perform action', async ({ page }) => {
    await page.goto('/')

    // Interact with page
    await page.click('button')

    // Assert results
    await expect(page.locator('.result')).toBeVisible()
  })
})
```

### Using Fixtures

```typescript
import { test, expect } from '@/e2e/fixtures/auth'

test('authenticated test', async ({ authenticatedPage }) => {
  // Page already authenticated
  await authenticatedPage.goto('/dashboard')
  await expect(authenticatedPage).toHaveURL(/dashboard/)
})
```

## Browser Configuration

Playwright runs tests on multiple browsers:

- **Desktop:** Chromium, Firefox, WebKit (Safari)
- **Mobile:** Pixel 5 (Chrome), iPhone 12 (Safari)

Run specific browser only:

```bash
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
```

## Common Patterns

### Navigation

```typescript
// Navigate to URL
await page.goto('/')

// Click link
await page.click('text=Dashboard')

// Wait for navigation
await page.waitForURL('/dashboard')
```

### Form Interactions

```typescript
// Fill input
await page.fill('input[name="email"]', 'test@example.com')

// Select dropdown
await page.selectOption('select[name="currency"]', 'USD')

// Click checkbox
await page.check('input[type="checkbox"]')

// Submit form
await page.click('button[type="submit"]')
```

### Assertions

```typescript
// Element visibility
await expect(page.locator('.message')).toBeVisible()

// Text content
await expect(page.locator('h1')).toHaveText('Welcome')

// URL
await expect(page).toHaveURL(/dashboard/)

// Screenshot comparison
await expect(page).toHaveScreenshot('dashboard.png')
```

### Waiting for Elements

```typescript
// Wait for element
await page.waitForSelector('.loading', { state: 'hidden' })

// Wait for response
await page.waitForResponse(response =>
  response.url().includes('/api/portfolios') && response.status() === 200
)
```

## Test Isolation

Each test runs in isolation with:

- Fresh browser context
- Clean cookies/storage
- Independent viewport

```typescript
test.beforeEach(async ({ page }) => {
  // Setup before each test
  await page.goto('/')
})

test.afterEach(async ({ page }) => {
  // Cleanup after each test
  await page.context().clearCookies()
})
```

## Debugging

### Interactive Mode

```bash
pnpm test:e2e:ui
```

Features:

- Run tests step-by-step
- Inspect DOM at each step
- Time-travel debugging
- Watch mode

### Debug Mode

```bash
pnpm test:e2e:debug
```

Opens Playwright Inspector for debugging.

### Screenshots on Failure

Playwright automatically captures:

- Screenshot on test failure
- Trace for failed tests

Find in: `test-results/` directory

## Best Practices

1. **Use data-testid for selectors** - More stable than CSS classes
2. **Test user journeys, not implementation** - Focus on user behavior
3. **Keep tests independent** - Don't rely on test execution order
4. **Use Page Object Model** - Encapsulate page interactions
5. **Mock external APIs when needed** - Use `page.route()` for API mocking
6. **Test critical paths first** - Login, checkout, data entry
7. **Run tests in CI/CD** - Catch regressions early

## Page Object Pattern

Organize tests with Page Objects:

```typescript
// e2e/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email)
    await this.page.fill('[name="password"]', password)
    await this.page.click('button[type="submit"]')
  }
}

// e2e/auth.spec.ts
import { LoginPage } from './pages/LoginPage'

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.login('test@example.com', 'password')
  await expect(page).toHaveURL('/dashboard')
})
```

## CI Integration

E2E tests run automatically in CI when Playwright is detected:

- Tests run on Chromium in CI (faster)
- Screenshots and videos saved as artifacts
- HTML report generated

## Troubleshooting

### "Browser not found"

Install browsers:

```bash
pnpm exec playwright install --with-deps chromium
```

### "Timeout waiting for selector"

Increase timeout:

```typescript
test.setTimeout(60000) // 60 seconds

await page.waitForSelector('.element', { timeout: 30000 })
```

### "Navigation timeout"

Check if dev server is running:

```bash
pnpm dev
```

Or increase navigation timeout in `playwright.config.ts`
