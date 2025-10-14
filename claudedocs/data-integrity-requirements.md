# Data Integrity Requirements Checklist

**Document Version**: 1.0
**Date**: 2025-10-12
**Status**: Requirements Definition

## Executive Summary

This document defines comprehensive data integrity requirements for Track Your Stack to prevent data corruption, ensure calculation accuracy, and maintain system reliability. It addresses gaps in constraint enforcement, validation logic, concurrency handling, and error recovery.

**Critical Issues Identified**:

- ❌ Missing database constraints allow invalid data
- ❌ No optimistic locking for concurrent edits
- ❌ Time zone handling inconsistent
- ❌ Price staleness not tracked
- ❌ No sanity checks on financial data
- ❌ Weak error recovery patterns

**Total Estimated Effort**: 12 days
**Priority**: HIGH (Phase 2)

---

## 1. Database-Level Constraints

### 1.1 CHECK Constraints (Priority: CRITICAL, Effort: 2 days)

**Problem**: Database allows logically invalid data that causes calculation errors.

**Current State**:

```prisma
model Investment {
  totalQuantity        Decimal  @db.Decimal(20, 8)
  averageCostBasis     Decimal  @db.Decimal(20, 8)
  currentPrice         Decimal? @db.Decimal(20, 8)
  // No constraints! Can be negative, zero, or astronomically large
}
```

**Required CHECK Constraints**:

```sql
-- Migration: add_data_integrity_checks.sql

-- Investment constraints
ALTER TABLE "investments" ADD CONSTRAINT "investment_quantity_positive"
  CHECK ("totalQuantity" > 0);

ALTER TABLE "investments" ADD CONSTRAINT "investment_cost_basis_positive"
  CHECK ("averageCostBasis" > 0);

ALTER TABLE "investments" ADD CONSTRAINT "investment_current_price_positive"
  CHECK ("currentPrice" IS NULL OR "currentPrice" > 0);

ALTER TABLE "investments" ADD CONSTRAINT "investment_quantity_reasonable"
  CHECK ("totalQuantity" <= 1000000000); -- 1 billion shares max

ALTER TABLE "investments" ADD CONSTRAINT "investment_price_reasonable"
  CHECK ("currentPrice" IS NULL OR "currentPrice" <= 10000000); -- $10M per share max

-- Purchase transaction constraints
ALTER TABLE "purchase_transactions" ADD CONSTRAINT "purchase_quantity_positive"
  CHECK ("quantity" > 0);

ALTER TABLE "purchase_transactions" ADD CONSTRAINT "purchase_price_positive"
  CHECK ("pricePerUnit" > 0);

ALTER TABLE "purchase_transactions" ADD CONSTRAINT "purchase_date_not_future"
  CHECK ("purchaseDate" <= CURRENT_DATE);

-- Tax lot constraints (when implemented)
ALTER TABLE "tax_lots" ADD CONSTRAINT "tax_lot_remaining_lte_original"
  CHECK ("remainingQuantity" <= "quantity");

ALTER TABLE "tax_lots" ADD CONSTRAINT "tax_lot_remaining_non_negative"
  CHECK ("remainingQuantity" >= 0);

-- Dividend constraints (when implemented)
ALTER TABLE "dividends" ADD CONSTRAINT "dividend_amount_positive"
  CHECK ("amountPerShare" > 0);

ALTER TABLE "dividends" ADD CONSTRAINT "dividend_shares_positive"
  CHECK ("sharesOwned" > 0);
```

**Validation**:

```typescript
// test/integrity/database-constraints.test.ts
describe('Database Constraints', () => {
  it('should reject negative investment quantity', async () => {
    await expect(
      prisma.investment.create({
        data: {
          ticker: 'AAPL',
          totalQuantity: -10, // Should fail
          averageCostBasis: 150,
          // ...other fields
        },
      })
    ).rejects.toThrow(/investment_quantity_positive/)
  })

  it('should reject future purchase dates', async () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)

    await expect(
      prisma.purchaseTransaction.create({
        data: {
          quantity: 10,
          pricePerUnit: 150,
          purchaseDate: futureDate, // Should fail
          // ...other fields
        },
      })
    ).rejects.toThrow(/purchase_date_not_future/)
  })
})
```

**Implementation Tasks**:

- [ ] Create migration with CHECK constraints
- [ ] Add unit tests for each constraint
- [ ] Document constraint violation error handling
- [ ] Update application error messages to be user-friendly

---

### 1.2 UNIQUE Constraints (Priority: HIGH, Effort: 1 day)

**Problem**: Duplicate entries possible, causing aggregation errors.

**Required UNIQUE Constraints**:

```sql
-- Portfolio constraints
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolio_name_user_unique"
  UNIQUE ("userId", "name");

-- Investment constraints (one investment per ticker per portfolio)
ALTER TABLE "investments" ADD CONSTRAINT "investment_ticker_portfolio_unique"
  UNIQUE ("portfolioId", "ticker");

-- Prevent duplicate purchase transactions
CREATE UNIQUE INDEX "purchase_transaction_unique" ON "purchase_transactions" (
  "investmentId",
  "purchaseDate",
  "pricePerUnit",
  "quantity"
);

-- Session constraints (prevent session fixation)
ALTER TABLE "sessions" ADD CONSTRAINT "session_token_unique"
  UNIQUE ("sessionToken");

-- Audit log constraints (prevent duplicate log entries)
CREATE UNIQUE INDEX "audit_log_unique" ON "audit_logs" (
  "userId",
  "action",
  "entityId",
  "timestamp"
) WHERE "userId" IS NOT NULL;
```

**Application-Level Enforcement**:

```typescript
// lib/validation/uniqueness.ts
export async function validatePortfolioNameUnique(
  userId: string,
  name: string,
  excludeId?: string
): Promise<void> {
  const existing = await prisma.portfolio.findFirst({
    where: {
      userId,
      name,
      id: excludeId ? { not: excludeId } : undefined,
    },
  })

  if (existing) {
    throw new Error(`Portfolio "${name}" already exists`)
  }
}

export async function validateInvestmentUnique(
  portfolioId: string,
  ticker: string,
  excludeId?: string
): Promise<void> {
  const existing = await prisma.investment.findFirst({
    where: {
      portfolioId,
      ticker,
      id: excludeId ? { not: excludeId } : undefined,
    },
  })

  if (existing) {
    throw new Error(`Investment ${ticker} already exists in this portfolio`)
  }
}
```

---

### 1.3 Foreign Key Integrity (Priority: MEDIUM, Effort: 1 day)

**Problem**: Orphaned records possible if cascade deletes not configured properly.

**Review and Enforce**:

```prisma
// prisma/schema.prisma

model Portfolio {
  id          String       @id @default(cuid())
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  investments Investment[]

  @@index([userId])
}

model Investment {
  id                   String                 @id @default(cuid())
  portfolioId          String
  portfolio            Portfolio              @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  purchaseTransactions PurchaseTransaction[]
  taxLots              TaxLot[]              @relation("InvestmentTaxLots")
  dividends            Dividend[]

  @@index([portfolioId])
  @@index([ticker])
}

model PurchaseTransaction {
  id           String     @id @default(cuid())
  investmentId String
  investment   Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)

  @@index([investmentId])
  @@index([purchaseDate])
}

model TaxLot {
  id             String     @id @default(cuid())
  investmentId   String
  investment     Investment @relation("InvestmentTaxLots", fields: [investmentId], references: [id], onDelete: Cascade)

  @@index([investmentId])
  @@index([status])
}
```

**Validation Query**:

```sql
-- Find orphaned records (should return 0 rows)
SELECT 'investment' AS table_name, COUNT(*) AS orphaned_count
FROM "investments" i
LEFT JOIN "portfolios" p ON i."portfolioId" = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 'purchase_transaction', COUNT(*)
FROM "purchase_transactions" pt
LEFT JOIN "investments" i ON pt."investmentId" = i.id
WHERE i.id IS NULL

UNION ALL

SELECT 'tax_lot', COUNT(*)
FROM "tax_lots" tl
LEFT JOIN "investments" i ON tl."investmentId" = i.id
WHERE i.id IS NULL;
```

---

## 2. Application-Level Validation Rules

### 2.1 Price Sanity Checks (Priority: HIGH, Effort: 2 days)

**Problem**: No validation on price data from Alpha Vantage or user input.

**Validation Rules**:

```typescript
// lib/validation/price-validation.ts

export interface PriceValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  suggestedPrice?: number
}

export async function validatePrice(params: {
  ticker: string
  assetType: AssetType
  price: number
  currency: string
  date?: Date
}): Promise<PriceValidationResult> {
  const { ticker, assetType, price, currency, date } = params
  const result: PriceValidationResult = {
    isValid: true,
    warnings: [],
    errors: [],
  }

  // 1. Basic bounds checking
  if (price <= 0) {
    result.isValid = false
    result.errors.push('Price must be positive')
    return result
  }

  if (price > 10_000_000) {
    result.isValid = false
    result.errors.push('Price exceeds maximum allowed value ($10M)')
    return result
  }

  // 2. Asset type-specific validation
  switch (assetType) {
    case 'STOCK':
    case 'ETF':
      if (price < 0.01) {
        result.warnings.push('Price unusually low for stock/ETF (< $0.01)')
      }
      if (price > 100_000) {
        result.warnings.push('Price unusually high for stock/ETF (> $100K). Possible stock split?')
      }
      break

    case 'CRYPTO':
      if (ticker === 'BTC' && price < 1000) {
        result.warnings.push('Bitcoin price seems unusually low')
      }
      if (ticker === 'BTC' && price > 500_000) {
        result.warnings.push('Bitcoin price seems unusually high')
      }
      break

    case 'MUTUAL_FUND':
      if (price > 10_000) {
        result.warnings.push('Mutual fund NAV unusually high (> $10K)')
      }
      break
  }

  // 3. Historical price comparison (if previous data exists)
  const lastKnownPrice = await getLastKnownPrice(ticker, date)
  if (lastKnownPrice) {
    const percentChange = Math.abs((price - lastKnownPrice) / lastKnownPrice)

    if (percentChange > 0.5) {
      result.warnings.push(
        `Price changed by ${(percentChange * 100).toFixed(1)}% from last known value. ` +
          `Previous: $${lastKnownPrice}, New: $${price}`
      )
    }

    if (percentChange > 0.9) {
      result.isValid = false
      result.errors.push(
        'Price change exceeds 90% from last known value. Possible data error or stock split.'
      )
    }
  }

  // 4. Cross-validation with multiple sources (if available)
  const alternatePrice = await getAlternatePriceSource(ticker, date)
  if (alternatePrice) {
    const discrepancy = Math.abs((price - alternatePrice) / alternatePrice)

    if (discrepancy > 0.05) {
      result.warnings.push(
        `Price differs by ${(discrepancy * 100).toFixed(1)}% from alternate source. ` +
          `Verify accuracy.`
      )
    }
  }

  return result
}

async function getLastKnownPrice(ticker: string, beforeDate?: Date): Promise<number | null> {
  const investment = await prisma.investment.findFirst({
    where: {
      ticker,
      priceUpdatedAt: beforeDate ? { lt: beforeDate } : undefined,
    },
    orderBy: { priceUpdatedAt: 'desc' },
    select: { currentPrice: true },
  })

  return investment?.currentPrice ? Number(investment.currentPrice) : null
}
```

**Integration with Server Actions**:

```typescript
// lib/actions/investment.ts
'use server'

export async function updateInvestmentPrice(
  investmentId: string,
  newPrice: number
): Promise<ActionResult> {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { portfolio: { select: { userId: true } } },
  })

  if (!investment || investment.portfolio.userId !== session.user.id) {
    throw new Error('Forbidden')
  }

  // VALIDATE PRICE
  const validation = await validatePrice({
    ticker: investment.ticker,
    assetType: investment.assetType,
    price: newPrice,
    currency: investment.purchaseCurrency,
  })

  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      warnings: validation.warnings,
    }
  }

  // Log warnings but proceed
  if (validation.warnings.length > 0) {
    await logAuditEvent({
      userId: session.user.id,
      action: 'PRICE_UPDATE_WITH_WARNINGS',
      entityId: investmentId,
      metadata: { warnings: validation.warnings },
    })
  }

  // Update price
  await prisma.investment.update({
    where: { id: investmentId },
    data: {
      currentPrice: newPrice,
      priceUpdatedAt: new Date(),
    },
  })

  revalidatePath(`/portfolios/${investment.portfolioId}`)
  return { success: true, warnings: validation.warnings }
}
```

---

### 2.2 Quantity Bounds Validation (Priority: HIGH, Effort: 1 day)

**Problem**: No validation on transaction quantities.

**Validation Rules**:

```typescript
// lib/validation/quantity-validation.ts

export interface QuantityValidationRules {
  min: number
  max: number
  decimalPlaces: number
  allowFractional: boolean
}

export function getQuantityRules(assetType: AssetType): QuantityValidationRules {
  switch (assetType) {
    case 'STOCK':
    case 'ETF':
      return {
        min: 0.000001, // Fractional shares allowed
        max: 1_000_000_000, // 1 billion shares
        decimalPlaces: 8,
        allowFractional: true,
      }

    case 'CRYPTO':
      return {
        min: 0.00000001, // 1 satoshi for BTC
        max: 1_000_000_000_000, // 1 trillion units (for low-value tokens)
        decimalPlaces: 8,
        allowFractional: true,
      }

    case 'MUTUAL_FUND':
      return {
        min: 0.001,
        max: 100_000_000,
        decimalPlaces: 3,
        allowFractional: true,
      }

    default:
      return {
        min: 0.000001,
        max: 1_000_000_000,
        decimalPlaces: 8,
        allowFractional: true,
      }
  }
}

export function validateQuantity(
  quantity: number,
  assetType: AssetType
): { isValid: boolean; error?: string } {
  const rules = getQuantityRules(assetType)

  if (quantity <= 0) {
    return { isValid: false, error: 'Quantity must be positive' }
  }

  if (quantity < rules.min) {
    return {
      isValid: false,
      error: `Quantity below minimum (${rules.min}) for ${assetType}`,
    }
  }

  if (quantity > rules.max) {
    return {
      isValid: false,
      error: `Quantity exceeds maximum (${rules.max}) for ${assetType}`,
    }
  }

  // Check decimal places
  const decimalPart = quantity.toString().split('.')[1]
  if (decimalPart && decimalPart.length > rules.decimalPlaces) {
    return {
      isValid: false,
      error: `Quantity has too many decimal places (max ${rules.decimalPlaces})`,
    }
  }

  return { isValid: true }
}
```

---

### 2.3 Date Validation (Priority: MEDIUM, Effort: 1 day)

**Problem**: No validation on purchase dates, dividend dates, etc.

**Validation Rules**:

```typescript
// lib/validation/date-validation.ts

export function validatePurchaseDate(date: Date): { isValid: boolean; error?: string } {
  const now = new Date()
  const minDate = new Date('1900-01-01') // Earliest reasonable stock purchase

  if (date > now) {
    return { isValid: false, error: 'Purchase date cannot be in the future' }
  }

  if (date < minDate) {
    return { isValid: false, error: 'Purchase date too far in the past' }
  }

  return { isValid: true }
}

export function validateDividendDate(
  paymentDate: Date,
  purchaseDate: Date
): { isValid: boolean; error?: string } {
  if (paymentDate < purchaseDate) {
    return {
      isValid: false,
      error: 'Dividend payment date cannot be before purchase date',
    }
  }

  const now = new Date()
  if (paymentDate > now) {
    return { isValid: false, error: 'Dividend payment date cannot be in the future' }
  }

  return { isValid: true }
}

export function validateSaleDate(
  saleDate: Date,
  purchaseDate: Date
): { isValid: boolean; error?: string } {
  if (saleDate < purchaseDate) {
    return {
      isValid: false,
      error: 'Sale date cannot be before purchase date',
    }
  }

  const now = new Date()
  if (saleDate > now) {
    return { isValid: false, error: 'Sale date cannot be in the future' }
  }

  return { isValid: true }
}
```

---

## 3. Concurrency and Conflict Resolution

### 3.1 Optimistic Locking (Priority: CRITICAL, Effort: 2 days)

**Problem**: Concurrent edits can cause data corruption (lost updates).

**Example Scenario**:

```
User A reads: Investment AAPL, quantity: 100, avg cost: $150
User B reads: Investment AAPL, quantity: 100, avg cost: $150

User A adds: 10 shares @ $160 → saves: quantity: 110, avg cost: $151
User B adds: 5 shares @ $155 → saves: quantity: 105, avg cost: $151.25

Result: Lost User A's transaction! Should be 115 shares.
```

**Solution: Version-Based Optimistic Locking**:

```prisma
// Add version field to all mutable entities
model Investment {
  id                   String   @id @default(cuid())
  version              Int      @default(0) // OPTIMISTIC LOCK
  totalQuantity        Decimal  @db.Decimal(20, 8)
  averageCostBasis     Decimal  @db.Decimal(20, 8)
  currentPrice         Decimal? @db.Decimal(20, 8)
  // ...other fields

  @@index([id, version])
}

model Portfolio {
  id      String @id @default(cuid())
  version Int    @default(0) // OPTIMISTIC LOCK
  // ...other fields
}
```

**Implementation**:

```typescript
// lib/actions/investment.ts
'use server'

export async function addPurchaseTransaction(params: {
  investmentId: string
  quantity: number
  pricePerUnit: number
  purchaseDate: Date
  expectedVersion: number // Client must provide current version
}): Promise<ActionResult> {
  const { investmentId, quantity, pricePerUnit, purchaseDate, expectedVersion } = params

  return await prisma.$transaction(async (tx) => {
    // 1. Read current investment with version
    const investment = await tx.investment.findUnique({
      where: { id: investmentId },
      select: {
        id: true,
        version: true,
        totalQuantity: true,
        averageCostBasis: true,
        portfolio: { select: { userId: true } },
      },
    })

    if (!investment) throw new Error('Investment not found')

    // 2. CHECK VERSION (optimistic lock)
    if (investment.version !== expectedVersion) {
      throw new ConflictError(
        'Investment was modified by another user. Please refresh and try again.',
        {
          currentVersion: investment.version,
          expectedVersion,
        }
      )
    }

    // 3. Calculate new values
    const newTotalQuantity = Number(investment.totalQuantity) + quantity
    const newTotalCost =
      Number(investment.totalQuantity) * Number(investment.averageCostBasis) +
      quantity * pricePerUnit
    const newAverageCostBasis = newTotalCost / newTotalQuantity

    // 4. Update investment with version increment
    await tx.investment.update({
      where: {
        id: investmentId,
        version: expectedVersion, // Atomic check
      },
      data: {
        totalQuantity: newTotalQuantity,
        averageCostBasis: newAverageCostBasis,
        version: { increment: 1 }, // Atomic increment
      },
    })

    // 5. Create purchase transaction record
    await tx.purchaseTransaction.create({
      data: {
        investmentId,
        quantity,
        pricePerUnit,
        purchaseDate,
      },
    })

    return { success: true, newVersion: expectedVersion + 1 }
  })
}

// Custom error for version conflicts
export class ConflictError extends Error {
  constructor(
    message: string,
    public metadata?: any
  ) {
    super(message)
    this.name = 'ConflictError'
  }
}
```

**Client-Side Handling**:

```typescript
// components/investment/AddPurchaseForm.tsx
'use client'

export function AddPurchaseForm({ investment }: { investment: Investment }) {
  const [optimisticLockError, setOptimisticLockError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    try {
      const result = await addPurchaseTransaction({
        investmentId: investment.id,
        quantity: Number(formData.get('quantity')),
        pricePerUnit: Number(formData.get('price')),
        purchaseDate: new Date(formData.get('date') as string),
        expectedVersion: investment.version, // Pass current version
      })

      if (result.success) {
        toast.success('Purchase added successfully')
        router.refresh() // Get new version
      }
    } catch (error) {
      if (error instanceof ConflictError) {
        setOptimisticLockError(error.message)
        // Show dialog: "Refresh to see latest data?"
      } else {
        toast.error('Failed to add purchase')
      }
    }
  }

  return (
    <>
      {optimisticLockError && (
        <Alert variant="destructive">
          <AlertTitle>Conflict Detected</AlertTitle>
          <AlertDescription>
            {optimisticLockError}
            <Button onClick={() => router.refresh()}>Refresh Data</Button>
          </AlertDescription>
        </Alert>
      )}
      {/* Form fields */}
    </>
  )
}
```

---

### 3.2 Transaction Isolation (Priority: HIGH, Effort: 1 day)

**Problem**: Complex operations not wrapped in transactions.

**Required Transactions**:

```typescript
// All multi-step operations MUST use transactions

// Example: Portfolio deletion with cascading cleanup
export async function deletePortfolio(portfolioId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Delete all investments (cascades to purchase_transactions, tax_lots, dividends)
    await tx.investment.deleteMany({
      where: { portfolioId },
    })

    // 2. Delete portfolio
    await tx.portfolio.delete({
      where: { id: portfolioId },
    })

    // 3. Log audit event
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PORTFOLIO_DELETED',
        entityId: portfolioId,
        timestamp: new Date(),
      },
    })
  })
}

// Example: Corporate action (stock split) with atomicity
export async function applyStockSplit(params: {
  ticker: string
  splitRatio: string
  effectiveDate: Date
}): Promise<void> {
  const [oldShares, newShares] = params.splitRatio.split(':').map(Number)
  const multiplier = newShares / oldShares

  await prisma.$transaction(async (tx) => {
    // 1. Update all investments for this ticker
    const investments = await tx.investment.findMany({
      where: { ticker: params.ticker },
    })

    for (const inv of investments) {
      await tx.investment.update({
        where: { id: inv.id },
        data: {
          totalQuantity: Number(inv.totalQuantity) * multiplier,
          averageCostBasis: Number(inv.averageCostBasis) / multiplier,
          currentPrice: inv.currentPrice ? Number(inv.currentPrice) / multiplier : null,
          version: { increment: 1 },
        },
      })
    }

    // 2. Update all purchase transactions
    await tx.purchaseTransaction.updateMany({
      where: {
        investment: { ticker: params.ticker },
        purchaseDate: { lt: params.effectiveDate },
      },
      data: {
        quantity: { multiply: multiplier },
        pricePerUnit: { divide: multiplier },
      },
    })

    // 3. Update all tax lots
    await tx.taxLot.updateMany({
      where: {
        investment: { ticker: params.ticker },
        purchaseDate: { lt: params.effectiveDate },
      },
      data: {
        quantity: { multiply: multiplier },
        remainingQuantity: { multiply: multiplier },
        costBasisPerUnit: { divide: multiplier },
      },
    })

    // 4. Record corporate action
    await tx.corporateAction.create({
      data: {
        ticker: params.ticker,
        type: 'STOCK_SPLIT',
        effectiveDate: params.effectiveDate,
        splitRatio: params.splitRatio,
        splitMultiplier: multiplier,
      },
    })
  })
}
```

---

## 4. Time Zone and Temporal Data Handling

### 4.1 Time Zone Standards (Priority: HIGH, Effort: 1 day)

**Problem**: Inconsistent time zone handling causes date boundary errors.

**Standards**:

```typescript
// lib/utils/datetime.ts

/**
 * DATETIME STANDARDS FOR TRACK YOUR STACK
 *
 * 1. Storage: All dates stored in UTC in database
 * 2. Market Times: NYSE/NASDAQ close = 4:00 PM ET
 * 3. Purchase Dates: Store as DATE only (no time component)
 * 4. Dividend Dates: Store as DATE only (payment date)
 * 5. Price Updates: Store timestamp in UTC
 */

import { startOfDay, endOfDay, parseISO, formatISO } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

// Market time zones
export const MARKET_TIMEZONES = {
  NYSE: 'America/New_York',
  NASDAQ: 'America/New_York',
  LSE: 'Europe/London',
  TSE: 'Asia/Tokyo',
  CRYPTO: 'UTC', // 24/7 markets use UTC
} as const

/**
 * Convert user input date to start-of-day UTC
 * Use for purchase dates, dividend dates, sale dates
 */
export function dateToStartOfDayUTC(date: Date | string): Date {
  const parsed = typeof date === 'string' ? parseISO(date) : date
  return startOfDay(parsed)
}

/**
 * Get market close time for a given date
 */
export function getMarketCloseTime(date: Date, market: keyof typeof MARKET_TIMEZONES): Date {
  const timezone = MARKET_TIMEZONES[market]

  // Create market close time (4:00 PM in market timezone)
  const marketDate = utcToZonedTime(date, timezone)
  marketDate.setHours(16, 0, 0, 0)

  // Convert back to UTC
  return zonedTimeToUtc(marketDate, timezone)
}

/**
 * Check if market is currently open
 */
export function isMarketOpen(market: keyof typeof MARKET_TIMEZONES): boolean {
  const now = new Date()
  const timezone = MARKET_TIMEZONES[market]
  const marketTime = utcToZonedTime(now, timezone)

  // Crypto markets are always open
  if (market === 'CRYPTO') return true

  // Check day of week (skip weekends)
  const dayOfWeek = marketTime.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) return false

  // Check time (9:30 AM - 4:00 PM)
  const hour = marketTime.getHours()
  const minute = marketTime.getMinutes()
  const timeInMinutes = hour * 60 + minute

  const marketOpen = 9 * 60 + 30 // 9:30 AM
  const marketClose = 16 * 60 // 4:00 PM

  return timeInMinutes >= marketOpen && timeInMinutes < marketClose
}

/**
 * Get appropriate cache duration based on market status
 */
export function getCacheDuration(assetType: AssetType, ticker: string): number {
  const market = getMarketForTicker(ticker)

  if (assetType === 'CRYPTO') {
    return 5 * 60 * 1000 // 5 minutes
  }

  const isOpen = isMarketOpen(market)
  return isOpen ? 15 * 60 * 1000 : 60 * 60 * 1000 // 15 min : 1 hour
}
```

**Database Schema Clarification**:

```prisma
model PurchaseTransaction {
  purchaseDate Date     @db.Date  // Date only, no time component
  createdAt    DateTime @default(now()) // Audit trail with timestamp
  // ...
}

model Dividend {
  paymentDate Date     @db.Date  // Date only
  recordDate  Date?    @db.Date  // Date only
  createdAt   DateTime @default(now())
  // ...
}

model Investment {
  priceUpdatedAt DateTime? // Full timestamp for staleness checking
  // ...
}
```

---

### 4.2 Price Staleness Detection (Priority: MEDIUM, Effort: 1 day)

**Problem**: No indication when prices are outdated.

**Implementation**:

```typescript
// lib/calculations/price-staleness.ts

export interface PriceFreshnessInfo {
  isFresh: boolean
  isStale: boolean
  isVeryStale: boolean
  staleSinceMinutes: number
  lastUpdateDate: Date | null
  nextUpdateDue: Date | null
  indicator: 'fresh' | 'aging' | 'stale' | 'very_stale' | 'unknown'
}

export function getPriceFreshness(
  investment: Pick<Investment, 'assetType' | 'ticker' | 'priceUpdatedAt'>
): PriceFreshnessInfo {
  if (!investment.priceUpdatedAt) {
    return {
      isFresh: false,
      isStale: true,
      isVeryStale: true,
      staleSinceMinutes: Infinity,
      lastUpdateDate: null,
      nextUpdateDue: null,
      indicator: 'unknown',
    }
  }

  const now = new Date()
  const lastUpdate = new Date(investment.priceUpdatedAt)
  const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)

  // Get thresholds based on asset type and market status
  const thresholds = getStalenessThresholds(investment.assetType, investment.ticker)
  const market = getMarketForTicker(investment.ticker)
  const isOpen = isMarketOpen(market)

  let indicator: PriceFreshnessInfo['indicator']
  let nextUpdateDue: Date | null = null

  if (minutesSinceUpdate < thresholds.fresh) {
    indicator = 'fresh'
    nextUpdateDue = new Date(lastUpdate.getTime() + thresholds.fresh * 60 * 1000)
  } else if (minutesSinceUpdate < thresholds.stale) {
    indicator = 'aging'
    nextUpdateDue = new Date(lastUpdate.getTime() + thresholds.stale * 60 * 1000)
  } else if (minutesSinceUpdate < thresholds.veryStale) {
    indicator = 'stale'
  } else {
    indicator = 'very_stale'
  }

  return {
    isFresh: minutesSinceUpdate < thresholds.fresh,
    isStale: minutesSinceUpdate >= thresholds.stale,
    isVeryStale: minutesSinceUpdate >= thresholds.veryStale,
    staleSinceMinutes: minutesSinceUpdate,
    lastUpdateDate: lastUpdate,
    nextUpdateDue,
    indicator,
  }
}

function getStalenessThresholds(assetType: AssetType, ticker: string) {
  const market = getMarketForTicker(ticker)
  const isOpen = isMarketOpen(market)

  if (assetType === 'CRYPTO') {
    return {
      fresh: 5, // 5 minutes
      stale: 15, // 15 minutes
      veryStale: 60, // 1 hour
    }
  }

  if (isOpen) {
    return {
      fresh: 15, // 15 minutes during market hours
      stale: 60, // 1 hour
      veryStale: 240, // 4 hours
    }
  } else {
    return {
      fresh: 60, // 1 hour after market close
      stale: 1440, // 24 hours
      veryStale: 10080, // 1 week
    }
  }
}
```

**UI Component**:

```typescript
// components/investment/PriceFreshnessIndicator.tsx
'use client'

export function PriceFreshnessIndicator({ investment }: { investment: Investment }) {
  const freshness = getPriceFreshness(investment)

  const indicatorStyles = {
    fresh: 'bg-green-100 text-green-800',
    aging: 'bg-yellow-100 text-yellow-800',
    stale: 'bg-orange-100 text-orange-800',
    very_stale: 'bg-red-100 text-red-800',
    unknown: 'bg-gray-100 text-gray-800',
  }

  const indicatorText = {
    fresh: 'Up to date',
    aging: 'Updated recently',
    stale: 'Price may be outdated',
    very_stale: 'Price is stale',
    unknown: 'Price unknown',
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={indicatorStyles[freshness.indicator]}>
        {indicatorText[freshness.indicator]}
      </Badge>
      {freshness.lastUpdateDate && (
        <span className="text-sm text-muted-foreground">
          Last updated: {formatDistanceToNow(freshness.lastUpdateDate)} ago
        </span>
      )}
      {freshness.isStale && (
        <Button size="sm" variant="outline" onClick={() => refreshPrice(investment.id)}>
          Refresh Price
        </Button>
      )}
    </div>
  )
}
```

---

## 5. Error Recovery and Resilience Patterns

### 5.1 Retry Logic with Exponential Backoff (Priority: MEDIUM, Effort: 1 day)

**Problem**: Transient errors (network issues, rate limits) cause permanent failures.

**Implementation**:

```typescript
// lib/utils/retry.ts

export interface RetryOptions {
  maxAttempts: number
  initialDelay: number // milliseconds
  maxDelay: number
  backoffFactor: number
  retryableErrors?: Array<new (...args: any[]) => Error>
  onRetry?: (error: Error, attempt: number) => void
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      // Check if error is retryable
      if (opts.retryableErrors) {
        const isRetryable = opts.retryableErrors.some((ErrorClass) => error instanceof ErrorClass)
        if (!isRetryable) {
          throw error // Don't retry non-retryable errors
        }
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      )

      // Call retry callback
      opts.onRetry?.(error as Error, attempt)

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Specific retry strategies
export async function withNetworkRetry<T>(operation: () => Promise<T>): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 3,
    initialDelay: 1000,
    retryableErrors: [NetworkError, TimeoutError],
    onRetry: (error, attempt) => {
      console.warn(`Network error, retrying (attempt ${attempt}):`, error.message)
    },
  })
}

export async function withRateLimitRetry<T>(operation: () => Promise<T>): Promise<T> {
  return withRetry(operation, {
    maxAttempts: 5,
    initialDelay: 5000, // 5 seconds for rate limits
    maxDelay: 60000, // 1 minute max
    retryableErrors: [RateLimitError],
    onRetry: (error, attempt) => {
      console.warn(`Rate limit hit, waiting before retry (attempt ${attempt})`)
    },
  })
}
```

**Integration with Alpha Vantage Client**:

```typescript
// lib/api/alphaVantage.ts

export async function getStockQuote(ticker: string): Promise<StockQuote> {
  return withNetworkRetry(async () => {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`,
      { signal: AbortSignal.timeout(10000) } // 10 second timeout
    )

    if (response.status === 429) {
      throw new RateLimitError('Alpha Vantage rate limit exceeded')
    }

    if (!response.ok) {
      throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data['Error Message']) {
      throw new InvalidTickerError(data['Error Message'])
    }

    return parseStockQuote(data)
  })
}
```

---

### 5.2 Graceful Degradation (Priority: MEDIUM, Effort: 1 day)

**Problem**: Complete feature failure when external dependencies unavailable.

**Strategy**:

```typescript
// lib/api/price-service.ts

export async function getPriceWithFallback(params: {
  ticker: string
  assetType: AssetType
}): Promise<{ price: number; source: string; isFallback: boolean }> {
  // 1. Try primary source (Alpha Vantage)
  try {
    const quote = await alphaVantage.getStockQuote(params.ticker)
    return {
      price: quote.price,
      source: 'alpha_vantage',
      isFallback: false,
    }
  } catch (error) {
    console.error('Alpha Vantage failed:', error)
  }

  // 2. Try secondary source (if implemented)
  try {
    const quote = await polygonIO.getStockQuote(params.ticker)
    return {
      price: quote.price,
      source: 'polygon_io',
      isFallback: true,
    }
  } catch (error) {
    console.error('Polygon.io failed:', error)
  }

  // 3. Try cached price (with staleness warning)
  const cached = await getCachedPrice(params.ticker)
  if (cached) {
    return {
      price: cached.price,
      source: 'cache',
      isFallback: true,
    }
  }

  // 4. Allow manual entry as last resort
  throw new PriceUnavailableError(
    `Unable to fetch price for ${params.ticker}. Please enter manually.`
  )
}

// Show degraded mode indicator in UI
export function PriceDisplay({ investment }: { investment: Investment }) {
  const [priceInfo, setPriceInfo] = useState<PriceInfo | null>(null)

  useEffect(() => {
    getPriceWithFallback({
      ticker: investment.ticker,
      assetType: investment.assetType,
    }).then(setPriceInfo)
  }, [investment])

  if (!priceInfo) return <Skeleton />

  return (
    <div>
      <span className="text-2xl font-bold">${priceInfo.price}</span>
      {priceInfo.isFallback && (
        <Alert variant="warning" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Price from fallback source ({priceInfo.source}). Primary API unavailable.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
```

---

## 6. Data Quality Monitoring

### 6.1 Consistency Checks (Priority: MEDIUM, Effort: 1 day)

**Problem**: No automated detection of data inconsistencies.

**Monitoring Queries**:

```sql
-- data-integrity-checks.sql

-- 1. Verify investment totals match purchase transactions
WITH transaction_totals AS (
  SELECT
    "investmentId",
    SUM("quantity") AS total_purchased
  FROM "purchase_transactions"
  GROUP BY "investmentId"
)
SELECT
  i.id,
  i.ticker,
  i."totalQuantity" AS current_total,
  COALESCE(tt.total_purchased, 0) AS expected_total,
  i."totalQuantity" - COALESCE(tt.total_purchased, 0) AS discrepancy
FROM "investments" i
LEFT JOIN transaction_totals tt ON i.id = tt."investmentId"
WHERE ABS(i."totalQuantity" - COALESCE(tt.total_purchased, 0)) > 0.00001;

-- 2. Verify tax lots don't exceed purchase quantities (when implemented)
WITH lot_totals AS (
  SELECT
    "investmentId",
    SUM("quantity") AS total_lots
  FROM "tax_lots"
  WHERE "status" != 'CLOSED'
  GROUP BY "investmentId"
)
SELECT
  i.id,
  i.ticker,
  i."totalQuantity" AS current_total,
  lt.total_lots,
  lt.total_lots - i."totalQuantity" AS excess
FROM "investments" i
JOIN lot_totals lt ON i.id = lt."investmentId"
WHERE lt.total_lots > i."totalQuantity";

-- 3. Find orphaned records (should return 0 rows)
SELECT 'orphaned_investments' AS issue, COUNT(*) AS count
FROM "investments" i
LEFT JOIN "portfolios" p ON i."portfolioId" = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 'orphaned_transactions', COUNT(*)
FROM "purchase_transactions" pt
LEFT JOIN "investments" i ON pt."investmentId" = i.id
WHERE i.id IS NULL;

-- 4. Detect invalid prices
SELECT
  id,
  ticker,
  "currentPrice",
  "priceUpdatedAt",
  CASE
    WHEN "currentPrice" <= 0 THEN 'negative_or_zero'
    WHEN "currentPrice" > 10000000 THEN 'unreasonably_high'
    WHEN "priceUpdatedAt" < NOW() - INTERVAL '7 days' THEN 'very_stale'
  END AS issue
FROM "investments"
WHERE "currentPrice" <= 0
   OR "currentPrice" > 10000000
   OR "priceUpdatedAt" < NOW() - INTERVAL '7 days';

-- 5. Detect future dates
SELECT
  'future_purchase_dates' AS issue,
  COUNT(*) AS count
FROM "purchase_transactions"
WHERE "purchaseDate" > CURRENT_DATE;
```

**Automated Monitoring Script**:

```typescript
// scripts/check-data-integrity.ts

import { prisma } from '@/lib/prisma'

interface IntegrityIssue {
  type: string
  severity: 'error' | 'warning'
  count: number
  details?: any
}

export async function runDataIntegrityChecks(): Promise<IntegrityIssue[]> {
  const issues: IntegrityIssue[] = []

  // 1. Check investment-transaction consistency
  const investmentDiscrepancies = await prisma.$queryRaw`
    WITH transaction_totals AS (
      SELECT "investmentId", SUM("quantity") AS total_purchased
      FROM "purchase_transactions"
      GROUP BY "investmentId"
    )
    SELECT i.id, i.ticker, i."totalQuantity", COALESCE(tt.total_purchased, 0) AS expected
    FROM "investments" i
    LEFT JOIN transaction_totals tt ON i.id = tt."investmentId"
    WHERE ABS(i."totalQuantity" - COALESCE(tt.total_purchased, 0)) > 0.00001
  `

  if (investmentDiscrepancies.length > 0) {
    issues.push({
      type: 'investment_quantity_mismatch',
      severity: 'error',
      count: investmentDiscrepancies.length,
      details: investmentDiscrepancies,
    })
  }

  // 2. Check for orphaned records
  const orphanedInvestments = await prisma.investment.count({
    where: { portfolio: null },
  })

  if (orphanedInvestments > 0) {
    issues.push({
      type: 'orphaned_investments',
      severity: 'error',
      count: orphanedInvestments,
    })
  }

  // 3. Check for invalid prices
  const invalidPrices = await prisma.investment.count({
    where: {
      OR: [{ currentPrice: { lte: 0 } }, { currentPrice: { gt: 10000000 } }],
    },
  })

  if (invalidPrices > 0) {
    issues.push({
      type: 'invalid_prices',
      severity: 'warning',
      count: invalidPrices,
    })
  }

  // 4. Check for future dates
  const futureDates = await prisma.purchaseTransaction.count({
    where: { purchaseDate: { gt: new Date() } },
  })

  if (futureDates > 0) {
    issues.push({
      type: 'future_purchase_dates',
      severity: 'error',
      count: futureDates,
    })
  }

  return issues
}

// Run as cron job
export async function dataIntegrityMonitor() {
  const issues = await runDataIntegrityChecks()

  if (issues.length > 0) {
    // Log to monitoring service (Sentry, Datadog, etc.)
    console.error('Data integrity issues detected:', issues)

    // Send alert email to admin
    await sendAdminAlert({
      subject: 'Data Integrity Issues Detected',
      body: JSON.stringify(issues, null, 2),
    })
  }

  return issues
}
```

---

## 7. Implementation Timeline

### Phase 1: Critical Data Integrity (Week 1-2)

- ✅ Day 1-2: Database CHECK constraints
- ✅ Day 3: UNIQUE constraints and foreign key review
- ✅ Day 4-5: Optimistic locking implementation
- ✅ Day 6-7: Price and quantity validation
- ✅ Day 8-9: Date validation and time zone standards
- ✅ Day 10: Transaction isolation patterns

### Phase 2: Quality Assurance (Week 3)

- ✅ Day 11-12: Retry logic and graceful degradation
- ✅ Day 13-14: Price staleness detection
- ✅ Day 15: Consistency check monitoring
- ✅ Day 16-17: Integration testing and validation

**Total Effort**: 12 days
**Priority**: HIGH (Phase 2, after authentication security fixes)

---

## 8. Testing Requirements

### Unit Tests

- Database constraint violations
- Validation function edge cases
- Optimistic locking race conditions
- Retry logic with mocked failures
- Time zone conversions

### Integration Tests

- Concurrent edit scenarios
- Transaction rollback on error
- Price validation with real data
- Staleness detection accuracy

### E2E Tests

- User adds conflicting purchases (optimistic lock)
- Corporate action propagation
- Price refresh with API failures

---

## 9. Success Metrics

**Data Quality**:

- ✅ Zero invalid prices in production
- ✅ Zero negative quantities
- ✅ Zero future-dated transactions
- ✅ 100% foreign key integrity

**Concurrency**:

- ✅ Optimistic lock conflicts detected and resolved
- ✅ <0.1% transaction rollback rate
- ✅ Zero lost updates

**Reliability**:

- ✅ 99% price fetch success rate (including retries)
- ✅ <1% stale price incidents
- ✅ Zero data corruption events

---

## Conclusion

This checklist addresses fundamental data integrity gaps that could cause financial calculation errors, data corruption, and poor user experience. Implementation of these requirements is **CRITICAL** before the application can be considered production-ready for handling real user financial data.

**Next Steps**:

1. Review and approve this checklist
2. Prioritize implementation alongside security fixes
3. Create Jira/GitHub issues for each item
4. Assign ownership and timeline
5. Schedule data integrity audit after implementation
