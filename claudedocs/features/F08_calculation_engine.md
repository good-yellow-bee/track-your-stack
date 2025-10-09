# F08: Calculation Engine

**Status:** ⬜ Not Started
**Priority:** 🔴 Critical
**Estimated Time:** 3-4 hours
**Dependencies:** F05 (Alpha Vantage), F07 (Investment Management)

---

## 📋 Overview

Implement core business logic for portfolio calculations: average cost basis, multi-currency conversion, gains/loss calculation, and portfolio aggregation.

**What this enables:**

- Accurate average cost basis across multiple purchases
- Multi-currency portfolio value calculation
- Gains/loss calculation per investment
- Portfolio-level aggregation
- Performance metrics

---

## 🎯 Acceptance Criteria

- [ ] Average cost basis calculation working
- [ ] Multi-currency conversion accurate
- [ ] Gains/loss calculation correct
- [ ] Portfolio summary calculation
- [ ] Best/worst performer identification
- [ ] Type-safe calculation functions
- [ ] Unit tests passing

---

## 🔧 Key Implementation Steps

### Calculation Utilities

Create `lib/calculations/investment.ts`:

```typescript
import { Investment } from '@prisma/client'
import { getCurrencyRate } from '@/lib/services/priceService'

export interface InvestmentMetrics {
  currentValue: number
  totalCost: number
  gainLossDollar: number
  gainLossPercent: number
}

export function calculateInvestmentMetrics(investment: Investment): InvestmentMetrics {
  const currentValue =
    (investment.currentPrice?.toNumber() || 0) * investment.totalQuantity.toNumber()
  const totalCost = investment.averageCostBasis.toNumber() * investment.totalQuantity.toNumber()
  const gainLossDollar = currentValue - totalCost
  const gainLossPercent = totalCost > 0 ? (gainLossDollar / totalCost) * 100 : 0

  return {
    currentValue,
    totalCost,
    gainLossDollar,
    gainLossPercent,
  }
}

export async function convertToBaseCurrency(
  investment: Investment,
  baseCurrency: string
): Promise<InvestmentMetrics> {
  const metrics = calculateInvestmentMetrics(investment)

  if (investment.purchaseCurrency === baseCurrency) {
    return metrics
  }

  // Get exchange rate
  const rate = await getCurrencyRate(investment.purchaseCurrency, baseCurrency)

  return {
    currentValue: metrics.currentValue * rate,
    totalCost: metrics.totalCost * rate,
    gainLossDollar: metrics.gainLossDollar * rate,
    gainLossPercent: metrics.gainLossPercent, // Percentage stays same
  }
}
```

Create `lib/calculations/portfolio.ts`:

```typescript
import { Portfolio, Investment } from '@prisma/client'
import { convertToBaseCurrency } from './investment'

export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercent: number
  investments: Array<{
    investment: Investment
    metrics: InvestmentMetrics
    percentOfPortfolio: number
  }>
  bestPerformer: Investment | null
  worstPerformer: Investment | null
}

export async function calculatePortfolioSummary(
  portfolio: Portfolio & { investments: Investment[] }
): Promise<PortfolioSummary> {
  // Convert all investments to base currency
  const convertedInvestments = await Promise.all(
    portfolio.investments.map(async (inv) => ({
      investment: inv,
      metrics: await convertToBaseCurrency(inv, portfolio.baseCurrency),
    }))
  )

  // Calculate totals
  const totalValue = convertedInvestments.reduce(
    (sum, { metrics }) => sum + metrics.currentValue,
    0
  )

  const totalCost = convertedInvestments.reduce((sum, { metrics }) => sum + metrics.totalCost, 0)

  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

  // Calculate percentages
  const investmentsWithPercentage = convertedInvestments.map((item) => ({
    ...item,
    percentOfPortfolio: totalValue > 0 ? (item.metrics.currentValue / totalValue) * 100 : 0,
  }))

  // Find best/worst performers
  const sorted = [...convertedInvestments].sort(
    (a, b) => b.metrics.gainLossPercent - a.metrics.gainLossPercent
  )

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    investments: investmentsWithPercentage,
    bestPerformer: sorted[0]?.investment || null,
    worstPerformer: sorted[sorted.length - 1]?.investment || null,
  }
}
```

### Format Utilities

Create `lib/utils/format.ts`:

```typescript
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

export function getGainLossColor(value: number): string {
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-600'
  return 'text-gray-600'
}
```

---

## 🧪 Testing Requirements

### Unit Tests (Vitest)

Create `lib/calculations/__tests__/investment.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateInvestmentMetrics } from '../investment'

describe('calculateInvestmentMetrics', () => {
  it('calculates gain correctly', () => {
    const investment = {
      totalQuantity: 10,
      averageCostBasis: 100,
      currentPrice: 110,
    }

    const metrics = calculateInvestmentMetrics(investment)

    expect(metrics.currentValue).toBe(1100)
    expect(metrics.totalCost).toBe(1000)
    expect(metrics.gainLossDollar).toBe(100)
    expect(metrics.gainLossPercent).toBe(10)
  })

  it('calculates loss correctly', () => {
    const investment = {
      totalQuantity: 10,
      averageCostBasis: 100,
      currentPrice: 90,
    }

    const metrics = calculateInvestmentMetrics(investment)

    expect(metrics.gainLossDollar).toBe(-100)
    expect(metrics.gainLossPercent).toBe(-10)
  })
})
```

---

## 📦 Deliverables

- [x] Investment calculation functions
- [x] Portfolio calculation functions
- [x] Multi-currency conversion
- [x] Format utilities
- [x] Unit tests

---

## 🔗 Related Files

- `lib/calculations/investment.ts`
- `lib/calculations/portfolio.ts`
- `lib/utils/format.ts`
- `lib/calculations/__tests__/investment.test.ts`

---

## ⏭️ Next Feature

→ [F09: Price Refresh System](F09_price_refresh.md)
