# Enhanced Testing Requirements

**Document Version**: 1.0
**Date**: 2025-10-12
**Status**: Comprehensive Testing Strategy

## Executive Summary

This document defines a comprehensive testing strategy for Track Your Stack to ensure reliability, security, performance, and accessibility. Testing must cover financial calculations, security features, data integrity, and user experience across all implementation phases.

**Testing Philosophy**: Test-Driven Development (TDD) for critical financial logic, comprehensive E2E coverage for user flows, automated security testing, and continuous integration.

**Coverage Targets**:

- Unit Tests: 80%+ coverage
- Integration Tests: 70%+ coverage
- E2E Tests: Critical user journeys (100% coverage)
- Security Tests: OWASP Top 10 (100% coverage)
- Performance Tests: Core Web Vitals targets
- Accessibility Tests: WCAG 2.1 AA (zero violations)

**Total Estimated Effort**: 15 days (distributed across implementation phases)

---

## 1. Unit Testing Strategy

### 1.1 Financial Calculations (Priority: CRITICAL)

**Testing Framework**: Vitest (fast, TypeScript-native)

**Critical Calculation Functions**:

**Average Cost Basis Calculation**:

```typescript
// lib/calculations/investment.test.ts
import { describe, it, expect } from 'vitest'
import { calculateAverageCostBasis, addPurchaseToInvestment } from './investment'

describe('Average Cost Basis Calculations', () => {
  it('should calculate correct average on first purchase', () => {
    const result = calculateAverageCostBasis({
      existingQuantity: 0,
      existingAvgCost: 0,
      newQuantity: 10,
      newPrice: 150,
    })

    expect(result.totalQuantity).toBe(10)
    expect(result.averageCostBasis).toBe(150)
    expect(result.totalCost).toBe(1500)
  })

  it('should calculate weighted average on subsequent purchase', () => {
    const result = calculateAverageCostBasis({
      existingQuantity: 10,
      existingAvgCost: 150,
      newQuantity: 5,
      newPrice: 160,
    })

    expect(result.totalQuantity).toBe(15)
    expect(result.averageCostBasis).toBeCloseTo(153.33, 2)
    expect(result.totalCost).toBe(2300)
  })

  it('should handle fractional shares correctly', () => {
    const result = calculateAverageCostBasis({
      existingQuantity: 10.5,
      existingAvgCost: 150.25,
      newQuantity: 5.3,
      newPrice: 160.75,
    })

    expect(result.totalQuantity).toBeCloseTo(15.8, 8)
    expect(result.averageCostBasis).toBeCloseTo(153.98, 2)
  })

  it('should include transaction fees in cost basis', () => {
    const result = calculateAverageCostBasis({
      existingQuantity: 10,
      existingAvgCost: 150,
      newQuantity: 5,
      newPrice: 160,
      commission: 10,
    })

    // Total cost = (10 * 150) + (5 * 160) + 10 = 2310
    // Avg cost = 2310 / 15 = 154
    expect(result.averageCostBasis).toBeCloseTo(154, 2)
  })
})
```

**Tax Lot Calculations**:

```typescript
// lib/calculations/tax-lot.test.ts
import { describe, it, expect } from 'vitest'
import { allocateSaleToTaxLots, calculateCapitalGain } from './tax-lot'

describe('Tax Lot Allocation - FIFO', () => {
  it('should allocate sale to oldest lot first (FIFO)', () => {
    const taxLots = [
      { id: '1', purchaseDate: new Date('2020-01-01'), quantity: 10, costBasisPerUnit: 100 },
      { id: '2', purchaseDate: new Date('2021-01-01'), quantity: 5, costBasisPerUnit: 150 },
      { id: '3', purchaseDate: new Date('2022-01-01'), quantity: 8, costBasisPerUnit: 120 },
    ]

    const result = allocateSaleToTaxLots({
      quantity: 12,
      taxLots,
      method: 'FIFO',
    })

    expect(result.allocations).toHaveLength(2)
    expect(result.allocations[0]).toEqual({
      taxLotId: '1',
      quantity: 10,
      costBasisPerUnit: 100,
    })
    expect(result.allocations[1]).toEqual({
      taxLotId: '2',
      quantity: 2,
      costBasisPerUnit: 150,
    })
  })

  it('should calculate short-term capital gain correctly', () => {
    const result = calculateCapitalGain({
      salePrice: 200,
      saleQuantity: 10,
      saleFee: 10,
      taxLotAllocations: [
        { quantity: 10, costBasisPerUnit: 150, purchaseDate: new Date('2023-06-01') },
      ],
      saleDate: new Date('2023-12-01'), // 6 months later
    })

    // Proceeds = (200 * 10) - 10 = 1990
    // Cost basis = 150 * 10 = 1500
    // Gain = 1990 - 1500 = 490
    expect(result.proceeds).toBe(1990)
    expect(result.costBasis).toBe(1500)
    expect(result.gainLoss).toBe(490)
    expect(result.isShortTerm).toBe(true)
    expect(result.isLongTerm).toBe(false)
  })

  it('should calculate long-term capital gain correctly', () => {
    const result = calculateCapitalGain({
      salePrice: 200,
      saleQuantity: 10,
      taxLotAllocations: [
        { quantity: 10, costBasisPerUnit: 150, purchaseDate: new Date('2020-01-01') },
      ],
      saleDate: new Date('2024-01-02'), // >1 year later
    })

    expect(result.isShortTerm).toBe(false)
    expect(result.isLongTerm).toBe(true)
  })
})

describe('Wash Sale Detection', () => {
  it('should detect wash sale within 30-day window', () => {
    const result = detectWashSale({
      ticker: 'AAPL',
      saleDate: new Date('2024-01-15'),
      saleLoss: -500,
      purchaseHistory: [
        { date: new Date('2024-01-20'), quantity: 10 }, // 5 days after sale
        { date: new Date('2024-01-01'), quantity: 5 }, // 14 days before sale
      ],
    })

    expect(result.isWashSale).toBe(true)
    expect(result.disallowedLoss).toBe(500)
    expect(result.affectedPurchases).toHaveLength(2)
  })

  it('should not flag wash sale outside 30-day window', () => {
    const result = detectWashSale({
      ticker: 'AAPL',
      saleDate: new Date('2024-01-15'),
      saleLoss: -500,
      purchaseHistory: [
        { date: new Date('2023-12-01'), quantity: 10 }, // 45 days before
      ],
    })

    expect(result.isWashSale).toBe(false)
  })
})
```

**Currency Conversion**:

```typescript
// lib/calculations/currency.test.ts
import { describe, it, expect } from 'vitest'
import { convertCurrency, getHistoricalRate } from './currency'

describe('Currency Conversion', () => {
  it('should convert using current exchange rate', async () => {
    const result = await convertCurrency({
      amount: 1000,
      fromCurrency: 'EUR',
      toCurrency: 'USD',
    })

    expect(result).toBeGreaterThan(1000) // Assuming EUR > USD
    expect(result).toBeLessThan(2000)
  })

  it('should use historical rate for past transactions', async () => {
    const historicalRate = await getHistoricalRate({
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      date: new Date('2020-01-01'),
    })

    expect(historicalRate).toBeDefined()
    expect(historicalRate).toBeGreaterThan(0)
  })

  it('should handle same currency conversion', async () => {
    const result = await convertCurrency({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'USD',
    })

    expect(result).toBe(1000)
  })
})
```

**Dividend Yield Calculations**:

```typescript
// lib/calculations/dividend.test.ts
import { describe, it, expect } from 'vitest'
import { calculateDividendYield, calculateYieldOnCost } from './dividend'

describe('Dividend Yield Calculations', () => {
  it('should calculate current dividend yield correctly', () => {
    const result = calculateDividendYield({
      annualDividendPerShare: 5,
      currentPrice: 100,
    })

    expect(result).toBe(0.05) // 5%
  })

  it('should calculate yield on cost correctly', () => {
    const result = calculateYieldOnCost({
      annualDividendPerShare: 5,
      costBasisPerShare: 80,
    })

    expect(result).toBe(0.0625) // 6.25%
  })

  it('should calculate total return including dividends', () => {
    const result = calculateTotalReturn({
      currentValue: 1200,
      costBasis: 1000,
      dividendsReceived: 150,
    })

    // Capital gain = 200
    // Total return = 200 + 150 = 350
    // Return % = 350 / 1000 = 35%
    expect(result.totalReturn).toBe(350)
    expect(result.returnPercent).toBe(0.35)
  })
})
```

---

### 1.2 Data Validation (Priority: HIGH)

**Price Validation**:

```typescript
// lib/validation/price-validation.test.ts
import { describe, it, expect } from 'vitest'
import { validatePrice } from './price-validation'

describe('Price Validation', () => {
  it('should reject negative prices', async () => {
    const result = await validatePrice({
      ticker: 'AAPL',
      assetType: 'STOCK',
      price: -150,
      currency: 'USD',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Price must be positive')
  })

  it('should warn on unusually large price changes', async () => {
    // Mock previous price
    mockLastKnownPrice('AAPL', 150)

    const result = await validatePrice({
      ticker: 'AAPL',
      assetType: 'STOCK',
      price: 300, // 100% increase
      currency: 'USD',
    })

    expect(result.isValid).toBe(true)
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0]).toContain('Price changed by')
  })

  it('should reject extreme outliers', async () => {
    mockLastKnownPrice('AAPL', 150)

    const result = await validatePrice({
      ticker: 'AAPL',
      assetType: 'STOCK',
      price: 500, // >90% increase
      currency: 'USD',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Price change exceeds 90%')
  })
})
```

**Quantity Validation**:

```typescript
// lib/validation/quantity-validation.test.ts
import { describe, it, expect } from 'vitest'
import { validateQuantity, getQuantityRules } from './quantity-validation'

describe('Quantity Validation', () => {
  it('should enforce minimum quantity for crypto', () => {
    const result = validateQuantity(0.00000001, 'CRYPTO')
    expect(result.isValid).toBe(true)
  })

  it('should reject negative quantities', () => {
    const result = validateQuantity(-10, 'STOCK')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Quantity must be positive')
  })

  it('should enforce decimal place limits', () => {
    const result = validateQuantity(10.123456789, 'STOCK') // 9 decimals
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('too many decimal places')
  })
})
```

---

### 1.3 Security Functions (Priority: CRITICAL)

**MFA TOTP Generation**:

```typescript
// lib/auth/mfa.test.ts
import { describe, it, expect } from 'vitest'
import { generateTOTPSecret, verifyTOTPToken, generateBackupCodes } from './mfa'

describe('MFA TOTP', () => {
  it('should generate valid TOTP secret', () => {
    const secret = generateTOTPSecret()

    expect(secret).toHaveLength(32)
    expect(secret).toMatch(/^[A-Z2-7]+$/) // Base32
  })

  it('should verify valid TOTP token', () => {
    const secret = generateTOTPSecret()
    const token = generateTOTPToken(secret) // Generate current token

    const result = verifyTOTPToken(secret, token)
    expect(result).toBe(true)
  })

  it('should reject invalid TOTP token', () => {
    const secret = generateTOTPSecret()
    const result = verifyTOTPToken(secret, '000000')

    expect(result).toBe(false)
  })

  it('should generate 10 unique backup codes', () => {
    const codes = generateBackupCodes()

    expect(codes).toHaveLength(10)
    expect(new Set(codes).size).toBe(10) // All unique
    codes.forEach((code) => {
      expect(code).toHaveLength(8)
      expect(code).toMatch(/^[A-Z0-9]+$/)
    })
  })
})
```

**Rate Limiting**:

```typescript
// lib/rate-limiting/limiter.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, resetRateLimit } from './limiter'

describe('Rate Limiting', () => {
  beforeEach(async () => {
    await resetRateLimit() // Clear Redis
  })

  it('should allow requests within limit', async () => {
    for (let i = 0; i < 10; i++) {
      const result = await checkRateLimit('portfolio', 'user123')
      expect(result.allowed).toBe(true)
    }
  })

  it('should block requests exceeding limit', async () => {
    // Make 10 requests (limit)
    for (let i = 0; i < 10; i++) {
      await checkRateLimit('portfolio', 'user123')
    }

    // 11th request should be blocked
    const result = await checkRateLimit('portfolio', 'user123')
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should reset after time window', async () => {
    // Make 10 requests
    for (let i = 0; i < 10; i++) {
      await checkRateLimit('portfolio', 'user123')
    }

    // Fast-forward time (mock)
    vi.setSystemTime(Date.now() + 3600 * 1000 + 1000) // 1 hour + 1 second

    const result = await checkRateLimit('portfolio', 'user123')
    expect(result.allowed).toBe(true)
  })
})
```

---

## 2. Integration Testing Strategy

### 2.1 Server Actions (Priority: HIGH)

**Testing Framework**: Vitest with database mocking

**Portfolio CRUD Operations**:

```typescript
// lib/actions/portfolio.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createPortfolio, updatePortfolio, deletePortfolio } from './portfolio'
import { mockSession } from '@/test/mocks/session'
import { prisma } from '@/lib/prisma'

describe('Portfolio Server Actions', () => {
  beforeEach(async () => {
    await prisma.portfolio.deleteMany()
    mockSession({ user: { id: 'user123', email: 'test@example.com' } })
  })

  it('should create portfolio successfully', async () => {
    const result = await createPortfolio({
      name: 'My Portfolio',
      baseCurrency: 'USD',
    })

    expect(result.success).toBe(true)
    expect(result.portfolio).toBeDefined()
    expect(result.portfolio.name).toBe('My Portfolio')

    const dbPortfolio = await prisma.portfolio.findUnique({
      where: { id: result.portfolio.id },
    })
    expect(dbPortfolio).toBeDefined()
  })

  it('should enforce authorization', async () => {
    const otherUserPortfolio = await prisma.portfolio.create({
      data: {
        userId: 'other-user',
        name: 'Other Portfolio',
        baseCurrency: 'USD',
      },
    })

    await expect(
      updatePortfolio({
        portfolioId: otherUserPortfolio.id,
        name: 'Hacked Name',
      })
    ).rejects.toThrow('Forbidden')
  })

  it('should handle optimistic locking conflicts', async () => {
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: 'user123',
        name: 'Test',
        baseCurrency: 'USD',
        version: 1,
      },
    })

    // Update in background (simulate concurrent user)
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { name: 'Updated by other user', version: 2 },
    })

    // Attempt update with stale version
    await expect(
      updatePortfolio({
        portfolioId: portfolio.id,
        name: 'My update',
        expectedVersion: 1, // Stale
      })
    ).rejects.toThrow('Conflict')
  })
})
```

**Investment Calculations**:

```typescript
// lib/actions/investment.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { addPurchaseTransaction } from './investment'

describe('Investment Purchase Transactions', () => {
  beforeEach(async () => {
    // Setup test portfolio and investment
    await setupTestData()
  })

  it('should update average cost basis on new purchase', async () => {
    const investment = await createTestInvestment({
      ticker: 'AAPL',
      quantity: 10,
      avgCostBasis: 150,
    })

    const result = await addPurchaseTransaction({
      investmentId: investment.id,
      quantity: 5,
      pricePerUnit: 160,
      purchaseDate: new Date(),
      expectedVersion: investment.version,
    })

    expect(result.success).toBe(true)

    const updated = await prisma.investment.findUnique({
      where: { id: investment.id },
    })

    expect(Number(updated.totalQuantity)).toBe(15)
    expect(Number(updated.averageCostBasis)).toBeCloseTo(153.33, 2)
  })

  it('should create tax lot for purchase', async () => {
    const investment = await createTestInvestment()

    await addPurchaseTransaction({
      investmentId: investment.id,
      quantity: 10,
      pricePerUnit: 150,
      purchaseDate: new Date('2024-01-01'),
    })

    const taxLots = await prisma.taxLot.findMany({
      where: { investmentId: investment.id },
    })

    expect(taxLots).toHaveLength(1)
    expect(Number(taxLots[0].quantity)).toBe(10)
    expect(Number(taxLots[0].costBasisPerUnit)).toBe(150)
  })
})
```

---

### 2.2 API Routes (Priority: MEDIUM)

**Alpha Vantage Integration**:

```typescript
// lib/api/alphaVantage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getStockQuote, getCryptoPrice, getExchangeRate } from './alphaVantage'
import { mockAlphaVantageAPI } from '@/test/mocks/alphaVantage'

describe('Alpha Vantage API Client', () => {
  beforeEach(() => {
    mockAlphaVantageAPI.reset()
  })

  it('should fetch stock quote successfully', async () => {
    mockAlphaVantageAPI.mockStockQuote('AAPL', {
      price: 175.5,
      volume: 50000000,
      change: 2.5,
      changePercent: 1.45,
    })

    const quote = await getStockQuote('AAPL')

    expect(quote.ticker).toBe('AAPL')
    expect(quote.price).toBe(175.5)
    expect(quote.volume).toBe(50000000)
  })

  it('should handle rate limiting with retry', async () => {
    mockAlphaVantageAPI
      .mockRateLimitError()
      .then(() => mockAlphaVantageAPI.mockStockQuote('AAPL', { price: 175.5 }))

    const quote = await getStockQuote('AAPL')

    expect(quote.price).toBe(175.5)
    expect(mockAlphaVantageAPI.callCount()).toBe(2) // Retry worked
  })

  it('should throw on invalid ticker', async () => {
    mockAlphaVantageAPI.mockInvalidTicker('INVALID')

    await expect(getStockQuote('INVALID')).rejects.toThrow('Invalid ticker')
  })
})
```

---

## 3. End-to-End Testing (Playwright)

### 3.1 Critical User Journeys (Priority: CRITICAL)

**Complete Onboarding Flow**:

```typescript
// tests/e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Onboarding', () => {
  test('should complete full onboarding flow', async ({ page }) => {
    // 1. Sign in with Google (mock OAuth)
    await page.goto('/auth/signin')
    await page.click('button:has-text("Sign in with Google")')
    // ... mock OAuth flow ...

    // 2. Welcome screen
    await expect(page).toHaveURL('/welcome')
    await expect(page.locator('h1')).toContainText('Welcome to Track Your Stack')

    // 3. Create first portfolio
    await page.click('button:has-text("Create Portfolio")')
    await page.fill('input[name="name"]', 'My Retirement')
    await page.selectOption('select[name="baseCurrency"]', 'USD')
    await page.click('button[type="submit"]')

    // 4. Add first investment
    await expect(page).toHaveURL(/\/portfolios\//)
    await page.click('button:has-text("Add Investment")')
    await page.fill('input[name="ticker"]', 'AAPL')
    await page.fill('input[name="quantity"]', '10')
    await page.fill('input[name="pricePerUnit"]', '150')
    await page.fill('input[name="purchaseDate"]', '2024-01-01')
    await page.click('button[type="submit"]')

    // 5. Verify investment appears
    await expect(page.locator('text=AAPL')).toBeVisible()
    await expect(page.locator('text=10 shares')).toBeVisible()
    await expect(page.locator('text=$1,500')).toBeVisible()

    // 6. Verify onboarding checklist updated
    await page.goto('/dashboard')
    await expect(page.locator('text=Created portfolio ✓')).toBeVisible()
    await expect(page.locator('text=Added investment ✓')).toBeVisible()
  })
})
```

**Portfolio CRUD Operations**:

```typescript
// tests/e2e/portfolio-crud.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Portfolio Management', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('should create, update, and delete portfolio', async ({ page }) => {
    // Create
    await page.goto('/dashboard')
    await page.click('button:has-text("Create Portfolio")')
    await page.fill('input[name="name"]', 'Test Portfolio')
    await page.selectOption('select[name="baseCurrency"]', 'EUR')
    await page.click('button[type="submit"]')

    await expect(page.locator('h2:has-text("Test Portfolio")')).toBeVisible()

    // Update
    await page.click('button[aria-label="Edit portfolio"]')
    await page.fill('input[name="name"]', 'Updated Portfolio')
    await page.click('button:has-text("Save")')

    await expect(page.locator('h2:has-text("Updated Portfolio")')).toBeVisible()

    // Delete
    await page.click('button[aria-label="Delete portfolio"]')
    await page.click('button:has-text("Confirm Delete")')

    await expect(page.locator('text=Updated Portfolio')).not.toBeVisible()
  })
})
```

**Investment Tracking & Price Refresh**:

```typescript
// tests/e2e/investment-tracking.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Investment Tracking', () => {
  test('should add purchase and refresh price', async ({ page }) => {
    await signIn(page)
    await createTestPortfolio(page)

    // Add investment
    await page.click('button:has-text("Add Investment")')
    await page.fill('input[name="ticker"]', 'MSFT')
    await page.fill('input[name="quantity"]', '5')
    await page.fill('input[name="pricePerUnit"]', '300')
    await page.fill('input[name="purchaseDate"]', '2024-01-01')
    await page.click('button[type="submit"]')

    // Verify initial values
    await expect(page.locator('text=MSFT')).toBeVisible()
    await expect(page.locator('text=5 shares')).toBeVisible()

    // Refresh price
    await page.click('button:has-text("Refresh Price")')

    // Wait for loading indicator
    await expect(page.locator('.animate-spin')).toBeVisible()
    await expect(page.locator('.animate-spin')).not.toBeVisible()

    // Verify price updated
    await expect(page.locator('text=Updated')).toBeVisible()

    // Verify gain/loss displayed
    await expect(page.locator('text=/[+-]\\$/')).toBeVisible()
  })

  test('should handle bulk price refresh', async ({ page }) => {
    await signIn(page)
    await createPortfolioWithMultipleInvestments(page)

    // Click bulk refresh
    await page.click('button:has-text("Refresh All Prices")')

    // Verify progress indicator
    await expect(page.locator('text=/Refreshing \\(\\d+\\/\\d+\\)/')).toBeVisible()

    // Wait for completion
    await expect(page.locator('text=/Updated \\d+ of \\d+ prices/')).toBeVisible()
  })
})
```

**CSV Import**:

```typescript
// tests/e2e/csv-import.spec.ts
import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('CSV Import', () => {
  test('should import investments from CSV', async ({ page }) => {
    await signIn(page)
    await createTestPortfolio(page)

    // Open import dialog
    await page.click('button:has-text("Import from CSV")')

    // Upload CSV file
    const csvPath = path.join(__dirname, 'fixtures', 'investments.csv')
    await page.setInputFiles('input[type="file"]', csvPath)

    // Verify preview
    await expect(page.locator('text=Preview (first 5 rows)')).toBeVisible()
    await expect(page.locator('table tbody tr')).toHaveCount(5)

    // Import
    await page.click('button:has-text("Import")')

    // Verify success
    await expect(page.locator('text=/Imported \\d+ investments/')).toBeVisible()

    // Verify investments appear
    await expect(page.locator('text=AAPL')).toBeVisible()
    await expect(page.locator('text=MSFT')).toBeVisible()
    await expect(page.locator('text=GOOGL')).toBeVisible()
  })

  test('should show validation errors for invalid CSV', async ({ page }) => {
    await signIn(page)
    await createTestPortfolio(page)

    await page.click('button:has-text("Import from CSV")')

    const invalidCsvPath = path.join(__dirname, 'fixtures', 'invalid.csv')
    await page.setInputFiles('input[type="file"]', invalidCsvPath)

    // Verify error messages
    await expect(page.locator('text=/\\d+ validation errors found/')).toBeVisible()
    await expect(page.locator('text=Invalid ticker')).toBeVisible()
    await expect(page.locator('text=Negative quantity')).toBeVisible()

    // Import button should be disabled
    await expect(page.locator('button:has-text("Import")')).toBeDisabled()
  })
})
```

---

### 3.2 Security Flows (Priority: CRITICAL)

**MFA Setup & Login**:

```typescript
// tests/e2e/mfa.spec.ts
import { test, expect } from '@playwright/test'
import { generateTOTPToken } from '@/lib/auth/mfa'

test.describe('Multi-Factor Authentication', () => {
  test('should enable MFA and login with TOTP', async ({ page }) => {
    await signIn(page)

    // Navigate to security settings
    await page.goto('/settings/security')

    // Enable MFA
    await page.click('button:has-text("Enable MFA")')

    // Verify QR code displayed
    await expect(page.locator('img[alt="QR Code"]')).toBeVisible()

    // Get secret from page (in production, scan QR code)
    const secret = await page.getAttribute('[data-testid="mfa-secret"]', 'data-secret')

    // Generate TOTP token
    const token = generateTOTPToken(secret)

    // Enter token
    await page.fill('input[name="token"]', token)
    await page.click('button:has-text("Verify")')

    // Verify MFA enabled
    await expect(page.locator('text=MFA Enabled')).toBeVisible()

    // Logout
    await page.click('button:has-text("Sign Out")')

    // Login again (should require MFA)
    await page.goto('/auth/signin')
    await page.click('button:has-text("Sign in with Google")')
    // ... mock OAuth ...

    // MFA challenge should appear
    await expect(page.locator('h2:has-text("Enter Authentication Code")')).toBeVisible()

    // Enter valid token
    const newToken = generateTOTPToken(secret)
    await page.fill('input[name="token"]', newToken)
    await page.click('button[type="submit"]')

    // Should reach dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('should use backup code when TOTP unavailable', async ({ page }) => {
    await signInWithMFAEnabled(page)

    // Logout
    await page.click('button:has-text("Sign Out")')

    // Login
    await page.goto('/auth/signin')
    await page.click('button:has-text("Sign in with Google")')

    // MFA challenge
    await page.click('text=Use backup code')

    // Enter backup code (from test fixtures)
    await page.fill('input[name="backupCode"]', 'ABC123XY')
    await page.click('button[type="submit"]')

    // Should reach dashboard
    await expect(page).toHaveURL('/dashboard')

    // Backup code should be marked as used
    await page.goto('/settings/security')
    await expect(page.locator('text=ABC123XY (Used)')).toBeVisible()
  })
})
```

**Rate Limiting**:

```typescript
// tests/e2e/rate-limiting.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Rate Limiting', () => {
  test('should block excessive requests', async ({ page }) => {
    await signIn(page)
    await page.goto('/dashboard')

    // Make 10 portfolio creation requests rapidly
    for (let i = 0; i < 11; i++) {
      await page.click('button:has-text("Create Portfolio")')
      await page.fill('input[name="name"]', `Portfolio ${i}`)
      await page.click('button[type="submit"]')

      if (i === 10) {
        // 11th request should be rate limited
        await expect(page.locator('text=Too many requests')).toBeVisible()
        await expect(page.locator('text=Please try again in')).toBeVisible()
      }
    }
  })
})
```

---

## 4. Security Testing

### 4.1 OWASP Top 10 Coverage (Priority: CRITICAL)

**A01: Broken Access Control**:

```typescript
// tests/security/authorization.test.ts
import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/prisma'
import { updatePortfolio } from '@/lib/actions/portfolio'
import { mockSession } from '@/test/mocks/session'

describe('Authorization Tests', () => {
  it('should prevent accessing other users portfolios', async () => {
    const otherUserPortfolio = await prisma.portfolio.create({
      data: {
        userId: 'other-user',
        name: 'Private Portfolio',
        baseCurrency: 'USD',
      },
    })

    mockSession({ user: { id: 'attacker', email: 'hacker@example.com' } })

    await expect(
      updatePortfolio({
        portfolioId: otherUserPortfolio.id,
        name: 'Hacked',
      })
    ).rejects.toThrow('Forbidden')
  })

  it('should prevent IDOR attacks on investments', async () => {
    const victimInvestment = await createInvestmentForUser('victim-user')

    mockSession({ user: { id: 'attacker', email: 'hacker@example.com' } })

    await expect(deleteInvestment(victimInvestment.id)).rejects.toThrow('Forbidden')
  })
})
```

**A02: Cryptographic Failures**:

```typescript
// tests/security/encryption.test.ts
import { describe, it, expect } from 'vitest'
import { encryptMFASecret, decryptMFASecret } from '@/lib/encryption'

describe('Encryption Tests', () => {
  it('should encrypt MFA secrets at rest', async () => {
    const secret = 'JBSWY3DPEHPK3PXP'

    const encrypted = await encryptMFASecret(secret)

    expect(encrypted).not.toBe(secret)
    expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/) // Base64

    const decrypted = await decryptMFASecret(encrypted)
    expect(decrypted).toBe(secret)
  })

  it('should use different initialization vectors', async () => {
    const secret = 'JBSWY3DPEHPK3PXP'

    const encrypted1 = await encryptMFASecret(secret)
    const encrypted2 = await encryptMFASecret(secret)

    expect(encrypted1).not.toBe(encrypted2) // Different IVs
  })
})
```

**A03: Injection**:

```typescript
// tests/security/injection.test.ts
import { describe, it, expect } from 'vitest'
import { createPortfolio } from '@/lib/actions/portfolio'

describe('SQL Injection Tests', () => {
  it('should prevent SQL injection in portfolio name', async () => {
    const maliciousName = "'; DROP TABLE portfolios; --"

    const result = await createPortfolio({
      name: maliciousName,
      baseCurrency: 'USD',
    })

    expect(result.success).toBe(true)

    // Verify table still exists
    const portfolios = await prisma.portfolio.findMany()
    expect(portfolios).toBeDefined()
  })

  it('should prevent NoSQL injection in filters', async () => {
    const maliciousFilter = { $ne: null }

    await expect(searchInvestments(maliciousFilter)).rejects.toThrow('Invalid filter')
  })
})
```

**A05: Security Misconfiguration**:

```typescript
// tests/security/headers.test.ts
import { describe, it, expect } from 'vitest'

describe('Security Headers', () => {
  it('should set Content-Security-Policy', async () => {
    const response = await fetch('http://localhost:3000')

    expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'")
  })

  it('should set X-Frame-Options', async () => {
    const response = await fetch('http://localhost:3000')

    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
  })

  it('should set Strict-Transport-Security', async () => {
    const response = await fetch('https://trackyourstack.com')

    expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=')
  })
})
```

**A07: Identification and Authentication Failures**:

```typescript
// tests/security/authentication.test.ts
import { describe, it, expect } from 'vitest'
import { signIn } from 'next-auth/react'

describe('Authentication Tests', () => {
  it('should enforce password requirements (when implemented)', async () => {
    await expect(
      signUpWithPassword({
        email: 'test@example.com',
        password: '123', // Too short
      })
    ).rejects.toThrow('Password must be at least 8 characters')
  })

  it('should prevent brute force attacks', async () => {
    for (let i = 0; i < 6; i++) {
      await signIn('credentials', {
        email: 'victim@example.com',
        password: 'wrong',
        redirect: false,
      })
    }

    // 6th attempt should be rate limited
    const result = await signIn('credentials', {
      email: 'victim@example.com',
      password: 'wrong',
      redirect: false,
    })

    expect(result.error).toContain('Too many failed attempts')
  })

  it('should invalidate sessions on logout', async () => {
    const session = await signIn(...)
    const sessionToken = session.sessionToken

    await signOut()

    const invalidated = await getSession({ sessionToken })
    expect(invalidated).toBeNull()
  })
})
```

---

## 5. Performance Testing

### 5.1 Load Testing (Priority: HIGH)

**Tool**: k6 (Grafana k6)

**Dashboard Load Test**:

```javascript
// tests/performance/dashboard.k6.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp up to 10 users
    { duration: '3m', target: 50 }, // Stay at 50 users
    { duration: '1m', target: 100 }, // Spike to 100 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% failures
  },
}

export default function () {
  // Login
  const loginRes = http.post('https://trackyourstack.com/api/auth/signin', {
    email: 'loadtest@example.com',
    password: 'password123',
  })

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  })

  const sessionToken = loginRes.cookies.get('session')

  // Dashboard page
  const dashboardRes = http.get('https://trackyourstack.com/dashboard', {
    cookies: { session: sessionToken },
  })

  check(dashboardRes, {
    'dashboard loads': (r) => r.status === 200,
    'dashboard fast': (r) => r.timings.duration < 1000, // Under 1 second
  })

  sleep(5) // User reads dashboard for 5 seconds

  // Portfolio page
  const portfolioRes = http.get('https://trackyourstack.com/portfolios/abc123', {
    cookies: { session: sessionToken },
  })

  check(portfolioRes, {
    'portfolio loads': (r) => r.status === 200,
    'portfolio fast': (r) => r.timings.duration < 1500,
  })

  sleep(10)
}
```

**Price Refresh Load Test**:

```javascript
// tests/performance/price-refresh.k6.js
export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 100, // 100 requests per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
    },
  },
  thresholds: {
    http_req_duration: ['p(99)<2000'], // 99% under 2 seconds
  },
}

export default function () {
  const res = http.post('https://trackyourstack.com/api/investments/abc123/refresh-price', null, {
    cookies: { session: sessionToken },
  })

  check(res, {
    'price refreshed': (r) => r.status === 200,
  })
}
```

---

### 5.2 Lighthouse Performance Audits (Priority: HIGH)

**Tool**: Lighthouse CI

**Configuration**:

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/portfolios/test-portfolio',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }], // 90+ performance score
        'categories:accessibility': ['error', { minScore: 0.9 }], // 90+ a11y score
        'categories:seo': ['warn', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }], // Under 2s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // Under 2.5s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // CLS < 0.1
        'total-blocking-time': ['warn', { maxNumericValue: 300 }], // TBT < 300ms
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

**CI Integration**:

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm build
      - run: pnpm start & # Start server
      - run: pnpm lhci autorun
      - uses: treosh/lighthouse-ci-action@v9
        with:
          uploadArtifacts: true
```

---

## 6. Accessibility Testing

### 6.1 Automated Accessibility Testing (Priority: CRITICAL)

**Tool**: axe-core + Playwright

**Accessibility Test Suite**:

```typescript
// tests/a11y/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('should have no accessibility violations on dashboard', async ({ page }) => {
    await signIn(page)
    await page.goto('/dashboard')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have accessible forms', async ({ page }) => {
    await signIn(page)
    await page.goto('/portfolios/new')

    const results = await new AxeBuilder({ page }).analyze()

    expect(results.violations).toEqual([])

    // Verify labels
    await expect(page.locator('label[for="name"]')).toBeVisible()
    await expect(page.locator('label[for="baseCurrency"]')).toBeVisible()

    // Verify ARIA
    await expect(page.locator('form')).toHaveAttribute('aria-label')
  })

  test('should have keyboard navigation', async ({ page }) => {
    await signIn(page)
    await page.goto('/dashboard')

    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    // Enter should activate buttons
    await page.keyboard.press('Enter')
    // Verify action taken
  })

  test('should have skip navigation link', async ({ page }) => {
    await page.goto('/')

    // Tab to skip link
    await page.keyboard.press('Tab')
    await expect(page.locator('a:has-text("Skip to main content")')).toBeFocused()

    // Activate skip link
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()
  })
})
```

---

### 6.2 Screen Reader Testing (Priority: HIGH)

**Manual Testing Protocol**:

**Screen Readers to Test**:

- NVDA (Windows, free)
- JAWS (Windows, commercial)
- VoiceOver (macOS/iOS, built-in)
- TalkBack (Android, built-in)

**Test Scenarios**:

1. Navigate dashboard with screen reader
2. Create portfolio using only keyboard + screen reader
3. Add investment with form validation
4. Interpret chart data (provide text alternatives)
5. Understand gain/loss indicators

**Acceptance Criteria**:

- ✅ All interactive elements announced
- ✅ Form validation errors read aloud
- ✅ Dynamic content updates announced (ARIA live regions)
- ✅ Chart data has text alternative
- ✅ No unlabeled buttons or links

---

## 7. Test Automation & CI/CD

### 7.1 Continuous Integration Pipeline

**GitHub Actions Workflow**:

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Setup database
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: pnpm playwright install --with-deps

      - name: Build application
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Run security scan
        run: pnpm audit

      - name: Run Snyk test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

### 7.2 Test Coverage Requirements

**Coverage Targets**:

| Test Type         | Target                | Critical Paths        |
| ----------------- | --------------------- | --------------------- |
| Unit Tests        | 80%+                  | 95%+ for calculations |
| Integration Tests | 70%+                  | 90%+ for auth & CRUD  |
| E2E Tests         | 100% of user journeys | All critical flows    |
| Security Tests    | 100% OWASP Top 10     | All vulnerabilities   |

**Coverage Report**:

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html
```

**Code Coverage Enforcement**:

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
      exclude: ['node_modules/', 'test/', '**/*.test.ts', '**/*.spec.ts'],
    },
  },
})
```

---

## 8. Testing Timeline & Resource Allocation

### Phase-by-Phase Testing

**Phase 1: Security Testing (Weeks 3-6)**

- [ ] Unit tests for MFA functions (1 day)
- [ ] Integration tests for auth flows (1 day)
- [ ] E2E tests for MFA login (1 day)
- [ ] Security penetration testing (2 days)

**Phase 2: Business Logic Testing (Weeks 3-10)**

- [ ] Unit tests for tax calculations (3 days)
- [ ] Unit tests for dividend tracking (1 day)
- [ ] Integration tests for corporate actions (2 days)
- [ ] E2E tests for tax reporting (1 day)

**Phase 3: UX Testing (Weeks 7-10)**

- [ ] E2E tests for onboarding (1 day)
- [ ] E2E tests for CSV import (1 day)
- [ ] Accessibility audit with axe (1 day)
- [ ] Screen reader testing (1 day)

**Phase 5: Comprehensive QA (Weeks 15-17)**

- [ ] Load testing with k6 (2 days)
- [ ] Performance testing with Lighthouse (1 day)
- [ ] Security audit review (2 days)
- [ ] Regression testing (2 days)
- [ ] User acceptance testing (3 days)

**Total Testing Effort**: ~25 days distributed across phases

---

## 9. Success Criteria

### Test Quality Metrics

**Code Coverage**:

- ✅ Overall coverage ≥80%
- ✅ Financial calculation coverage ≥95%
- ✅ Security function coverage ≥90%

**Test Stability**:

- ✅ <2% flaky test rate
- ✅ All tests pass on main branch
- ✅ No skipped tests in CI

**Performance**:

- ✅ All pages <3s load time
- ✅ Lighthouse score ≥90
- ✅ Core Web Vitals: Green

**Security**:

- ✅ Zero OWASP Top 10 vulnerabilities
- ✅ Zero critical Snyk vulnerabilities
- ✅ Penetration test passed

**Accessibility**:

- ✅ Zero axe violations (WCAG 2.1 AA)
- ✅ Screen reader testing passed
- ✅ Keyboard navigation complete

---

## Conclusion

This comprehensive testing strategy ensures Track Your Stack meets the highest standards for:

- **Reliability**: Extensive unit and integration testing
- **Security**: OWASP Top 10 coverage + penetration testing
- **Performance**: Load testing + Core Web Vitals monitoring
- **Accessibility**: WCAG 2.1 AA compliance
- **User Experience**: End-to-end validation of critical flows

**Next Steps**:

1. Approve testing strategy
2. Set up testing infrastructure (Vitest, Playwright, k6)
3. Integrate tests into CI/CD pipeline
4. Begin TDD for critical financial calculations
5. Schedule security and accessibility audits

**Testing Philosophy**: Write tests first for critical business logic (TDD), maintain high coverage, automate everything possible, and test continuously throughout development.
