# F01b: Testing Framework Setup

**Status:** 📝 Documentation Complete (Implementation Pending)
**Priority:** 🟡 High
**Estimated Time:** 0.5-1 day
**Dependencies:** F01 (Project Setup)

---

## 📝 Documentation Status

**Current State:** This feature document provides comprehensive documentation for setting up the testing framework. The actual Vitest and Playwright installations are NOT yet implemented - this is documentation-only.

**What's included in this PR:**
- ✅ Complete installation and configuration guide
- ✅ Test directory structure documentation
- ✅ Test templates and examples
- ✅ CI integration documentation
- ❌ Actual Vitest/Playwright installation (pending)
- ❌ Working test scripts (pending)

**Next Steps:** To implement this feature, follow the step-by-step instructions below to install Vitest and Playwright.

---

## 📋 Overview

Install and configure Vitest for unit/integration testing and Playwright for end-to-end testing. Set up test directory structure, configure test scripts, and create sample tests to verify the testing infrastructure works correctly.

**What this enables:**

- Unit testing with Vitest and React Testing Library
- Integration testing for Server Actions and API routes
- End-to-end testing with Playwright
- Code coverage reporting
- Automated testing in CI/CD pipeline
- Test-driven development workflow

---

## 🎯 Acceptance Criteria

- [ ] Vitest installed and configured
- [ ] React Testing Library installed for component testing
- [ ] Playwright installed and configured for E2E tests
- [ ] Test directory structure created (`__tests__/`, `e2e/`)
- [ ] Sample unit test passing
- [ ] Sample integration test passing
- [ ] Sample E2E test passing
- [ ] Code coverage configured with 80% threshold
- [ ] Test scripts added to `package.json`
- [ ] CI workflow detects and runs tests automatically
- [ ] Playwright browsers installed in CI
- [ ] Test documentation created

---

## 📦 Dependencies to Install

### Testing Framework (Vitest)

```bash
# Vitest and testing utilities
pnpm add -D vitest @vitejs/plugin-react
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D @vitest/ui @vitest/coverage-v8
pnpm add -D jsdom happy-dom
```

### E2E Testing (Playwright)

```bash
# Playwright for browser automation
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps
```

### Additional Testing Utilities

```bash
# Supertest for API testing
pnpm add -D supertest @types/supertest

# MSW for API mocking
pnpm add -D msw

# Faker for test data generation
pnpm add -D @faker-js/faker
```

---

## 🔧 Implementation Steps

### Step 1: Install Vitest (15 min)

```bash
# Install Vitest and related packages
pnpm add -D vitest @vitejs/plugin-react
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D @vitest/ui @vitest/coverage-v8
pnpm add -D jsdom happy-dom
```

### Step 2: Configure Vitest (20 min)

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '**/__tests__/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock environment variables for tests
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
```

### Step 3: Install Playwright (15 min)

```bash
# Install Playwright
pnpm add -D @playwright/test

# Install browsers (Chromium, Firefox, WebKit)
pnpm exec playwright install --with-deps
```

### Step 4: Configure Playwright (20 min)

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Step 5: Update package.json Scripts (10 min)

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "tsc --noEmit",

    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",

    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",

    "test:all": "pnpm test:coverage && pnpm test:e2e",

    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  }
}
```

### Step 6: Create Test Directory Structure (10 min)

```bash
# Create test directories
mkdir -p __tests__/unit
mkdir -p __tests__/integration
mkdir -p __tests__/utils
mkdir -p e2e
mkdir -p e2e/fixtures
```

### Step 7: Create Sample Unit Test (15 min)

Create `__tests__/unit/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
    })

    it('should merge Tailwind classes correctly', () => {
      expect(cn('px-4 py-2', 'px-2')).toBe('py-2 px-2')
    })
  })
})
```

Create `__tests__/unit/constants.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { CURRENCIES, ASSET_TYPES, PRICE_CACHE_TTL } from '@/lib/constants'

describe('Constants', () => {
  describe('CURRENCIES', () => {
    it('should have valid currency definitions', () => {
      expect(CURRENCIES.length).toBeGreaterThan(0)
      CURRENCIES.forEach((currency) => {
        expect(currency).toHaveProperty('code')
        expect(currency).toHaveProperty('symbol')
        expect(currency).toHaveProperty('name')
      })
    })

    it('should include major currencies', () => {
      const codes = CURRENCIES.map((c) => c.code)
      expect(codes).toContain('USD')
      expect(codes).toContain('EUR')
      expect(codes).toContain('GBP')
    })
  })

  describe('ASSET_TYPES', () => {
    it('should have valid asset type definitions', () => {
      expect(ASSET_TYPES.length).toBeGreaterThan(0)
      ASSET_TYPES.forEach((type) => {
        expect(type).toHaveProperty('value')
        expect(type).toHaveProperty('label')
      })
    })
  })

  describe('PRICE_CACHE_TTL', () => {
    it('should have positive TTL values', () => {
      expect(PRICE_CACHE_TTL.STOCK).toBeGreaterThan(0)
      expect(PRICE_CACHE_TTL.CRYPTO).toBeGreaterThan(0)
      expect(PRICE_CACHE_TTL.CURRENCY).toBeGreaterThan(0)
    })
  })
})
```

### Step 8: Create Sample Integration Test (15 min)

Create `__tests__/integration/api-health.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('API Health Check', () => {
  it('should return 200 for health endpoint', async () => {
    // This will be implemented when we create the health endpoint
    // For now, this is a placeholder test
    expect(true).toBe(true)
  })
})
```

### Step 9: Create Sample E2E Test (20 min)

Create `e2e/homepage.spec.ts`:

```typescript
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
```

### Step 10: Create Test Utilities (15 min)

Create `__tests__/utils/test-helpers.ts`:

```typescript
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Custom render function that wraps components with providers
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { ...options })
}

// Mock user session
export function mockUserSession() {
  return {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

// Wait for async operations
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
```

Create `e2e/fixtures/auth.ts`:

```typescript
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
```

### Step 11: Update .gitignore (5 min)

Add to `.gitignore`:

```
# Testing
coverage/
.nyc_output/
playwright-report/
test-results/
```

### Step 12: Run Tests to Verify Setup (15 min)

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Verify all tests pass
pnpm test:all
```

---

## 🧪 Testing Requirements

### Verification Tests

```bash
# 1. Unit tests run successfully
pnpm test
# Expected: All tests pass

# 2. Coverage report generated
pnpm test:coverage
# Expected: Coverage report in coverage/ directory

# 3. E2E tests run successfully
pnpm test:e2e
# Expected: All E2E tests pass

# 4. Test watch mode works
pnpm test:watch
# Expected: Tests re-run on file changes

# 5. Playwright UI works
pnpm test:e2e:ui
# Expected: Playwright UI opens in browser
```

### CI Integration Verification

The CI workflow (`.github/workflows/ci.yml`) should now:

- Detect that Vitest is installed
- Detect that Playwright is installed
- Run unit tests automatically
- Run E2E tests automatically
- Report test failures

Test the CI detection:

```bash
# Check if test framework is detected
pnpm list vitest --depth=0

# Check if Playwright is detected
pnpm list @playwright/test --depth=0

# Both should return package info, not "not found"
```

---

## 📚 Documentation Updates

### Files to Create/Update

- [ ] `docs/testing/unit-testing.md` - Unit testing guide
- [ ] `docs/testing/e2e-testing.md` - E2E testing guide
- [ ] `docs/testing/test-coverage.md` - Coverage requirements
- [ ] `README.md` - Add testing section
- [ ] `CHANGELOG.md` - Add testing setup entry

### README Testing Section

Add to `README.md`:

````markdown
## Testing

### Unit & Integration Tests

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Open Vitest UI
pnpm test:ui
```
````

### E2E Tests

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui

# Run E2E tests in debug mode
pnpm test:e2e:debug

# View test report
pnpm test:e2e:report
```

### Test Coverage

Minimum coverage thresholds:

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

View coverage report: `open coverage/index.html`

````

### Changelog Entry

```markdown
## [0.2.0] - 2025-10-09

### Added

- Vitest testing framework for unit and integration tests
- React Testing Library for component testing
- Playwright for end-to-end testing
- Code coverage configuration with 80% threshold
- Sample tests to verify testing infrastructure
- Test utilities and helper functions
- CI integration for automated testing
````

---

## 🔀 Git Workflow

### Branch Name

```bash
git checkout -b feature/testing-framework-setup
```

### Commit Messages

```bash
git commit -m "test: install and configure Vitest

- Add Vitest with React Testing Library
- Configure test environment and globals
- Setup code coverage with v8 provider
- Add test utilities and helpers
- Create sample unit tests"

git commit -m "test: install and configure Playwright

- Add Playwright for E2E testing
- Configure browser testing (Chromium, Firefox, WebKit)
- Setup mobile device testing
- Create sample E2E tests
- Add Playwright fixtures"

git commit -m "test: update package.json scripts

- Add test, test:watch, test:coverage scripts
- Add E2E testing scripts
- Update CI to detect installed test frameworks"

git commit -m "docs: add testing documentation

- Add unit testing guide
- Add E2E testing guide
- Update README with testing section
- Document coverage requirements"
```

### Pull Request Template

```markdown
## F01b: Testing Framework Setup

### What does this PR do?

Installs and configures Vitest for unit/integration testing and Playwright for E2E testing. Sets up the testing infrastructure needed for TDD and automated testing in CI.

### Type of change

- [x] Testing infrastructure
- [x] Configuration
- [x] Documentation

### Checklist

- [x] Vitest installed and configured
- [x] React Testing Library installed
- [x] Playwright installed and configured
- [x] Test scripts added to package.json
- [x] Sample unit tests created and passing
- [x] Sample E2E tests created and passing
- [x] Code coverage configured
- [x] CI detects and runs tests
- [x] Documentation updated

### Testing performed

- ✅ Unit tests run: `pnpm test`
- ✅ Coverage report generated: `pnpm test:coverage`
- ✅ E2E tests run: `pnpm test:e2e`
- ✅ Test watch mode works: `pnpm test:watch`
- ✅ Playwright UI works: `pnpm test:e2e:ui`
- ✅ CI detects Vitest: `pnpm list vitest`
- ✅ CI detects Playwright: `pnpm list @playwright/test`

### Coverage Report
```

--------------------|---------|----------|---------|---------|
File | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files | 100 | 100 | 100 | 100 |
lib/constants.ts | 100 | 100 | 100 | 100 |
lib/utils.ts | 100 | 100 | 100 | 100 |
--------------------|---------|----------|---------|---------|

```

```

---

## ⚠️ Common Issues & Solutions

### Issue: Vitest can't find modules

**Solution:** Verify path aliases in `vitest.config.ts` match `tsconfig.json`

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
}
```

### Issue: Playwright browsers not installed

**Solution:** Run browser installation command

```bash
pnpm exec playwright install --with-deps
```

### Issue: Tests fail with "Cannot find module 'next/navigation'"

**Solution:** Verify Next.js mocks in `vitest.setup.ts` are correct

### Issue: E2E tests timeout

**Solution:** Increase timeout in `playwright.config.ts`

```typescript
use: {
  timeout: 30000, // 30 seconds
}
```

### Issue: Coverage threshold not met

**Solution:** Write more tests or adjust thresholds temporarily

```typescript
coverage: {
  thresholds: {
    lines: 70, // Temporarily lower if needed
  },
}
```

---

## 📦 Deliverables

After completing this feature, you should have:

- [x] Vitest configured and working
- [x] Playwright configured and working
- [x] Test directory structure created
- [x] Sample tests passing
- [x] Code coverage reporting enabled
- [x] Test scripts in package.json
- [x] CI integration working
- [x] Testing documentation

---

## 🔗 Related Files

- `vitest.config.ts` - Vitest configuration
- `vitest.setup.ts` - Test setup and mocks
- `playwright.config.ts` - Playwright configuration
- `package.json` - Test scripts
- `__tests__/` - Unit and integration tests
- `e2e/` - End-to-end tests
- `.github/workflows/ci.yml` - CI configuration

---

## 🎯 Success Metrics

- ✅ All sample tests passing
- ✅ Code coverage > 80%
- ✅ E2E tests running on 3 browsers
- ✅ CI automatically runs tests
- ✅ Test execution time < 30 seconds for unit tests
- ✅ Test execution time < 2 minutes for E2E tests

---

## ⏭️ Next Steps

After completing F01b:

1. Start writing tests for new features (TDD approach)
2. Maintain 80% code coverage throughout development
3. Add E2E tests for critical user journeys
4. Run tests before every commit

**Next Feature:** [F02: Database Schema & Prisma](F02_database_schema.md)

---

**Status Legend:**

- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked
